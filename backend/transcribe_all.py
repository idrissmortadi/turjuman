import os
import shutil
import datetime
import speech_recognition as sr
from moviepy.editor import VideoFileClip
import pandas as pd
import numpy as np
from moviepy.editor import VideoFileClip
from PIL import ImageFont, ImageDraw, Image
import arabic_reshaper 
from bidi.algorithm import get_display
from pydub import AudioSegment
from pydub.silence import split_on_silence
from deep_translator import GoogleTranslator
from tqdm import tqdm
import textwrap

def split_wav_on_silence(input_file, output_folder, f, silence_threshold=-30, min_silence_duration=500):
    print("Splitting audio on silence...")

    # Load the audio file
    audio = AudioSegment.from_wav(input_file)

    # Split on silence
    segments = split_on_silence(audio, silence_thresh=silence_threshold, min_silence_len=min_silence_duration,keep_silence=True)

    # Create output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Save the segments as separate WAV files and collect timestamps
    timestamps = []
    for i, segment in enumerate(segments):
        segment_file_path = os.path.join(output_folder, f"segment_{i + 1:04d}.wav")
        segment.export(segment_file_path, format="wav")

        # Calculate timestamps in milliseconds
        start_timestamp = sum(segment.duration_seconds for segment in segments[:i])
        end_timestamp = start_timestamp + segment.duration_seconds

        timestamps.append((start_timestamp, end_timestamp))

    return timestamps

def transcribe_audio_segments(segment_folder, timestamps, output_text_file):
    recognizer = sr.Recognizer()
    subtitles = []
    with open(output_text_file, 'w',encoding="utf-8") as text_output:
        for file_name in sorted(os.listdir(segment_folder)):
            if file_name.endswith(".wav"):
                file_path = os.path.join(segment_folder, file_name)

                with sr.AudioFile(file_path) as source:
                    # print(f"Processing {file_name}...")
                    audio_data = recognizer.record(source)
                
                segment_index = int(file_name.split('_')[1][:-4])-1
                start_time = datetime.timedelta(seconds=timestamps[segment_index][0])
                end_time   = datetime.timedelta(seconds=timestamps[segment_index][1])
                
                # Convert the seconds part to a string and limit to 2 digits
                start_seconds = f'{start_time.seconds % 60:02d}.{start_time.microseconds // 1000:03d}'
                end_seconds = f'{end_time.seconds % 60:02d}.{end_time.microseconds // 1000:03d}'

                # Format start_time and end_time as strings with only 2 digits in the seconds part
                start_time_str = f'{start_time.seconds // 3600:02d}:{(start_time.seconds % 3600) // 60:02d}:{start_seconds}'
                end_time_str = f'{end_time.seconds // 3600:02d}:{(end_time.seconds % 3600) // 60:02d}:{end_seconds}'
                try:
                    # print("Transcribing...")
                    text = recognizer.recognize_google(audio_data, language="ar")

                    text_output.write(f"{start_time_str}|{end_time_str}|{text}\n")

                    subtitles.append({"start":start_time_str, "end":end_time_str, "text":text})
                    print(f"Transcription: {start_time_str}|{end_time_str}|{text}")
                except sr.UnknownValueError:
                    text_output.write(f"{start_time_str}|{end_time_str}|\n")
                    print("Speech Recognition could not understand audio")
                except sr.RequestError as e:
                    print(f"Could not request results from Google Speech Recognition service; {e}")
    return subtitles

def extract_audio_from_video(video_file, output_wav):
    # Load the video clip
    video_clip = VideoFileClip(video_file)

    # Extract audio
    audio_clip = video_clip.audio

    # Save audio as WAV
    audio_clip.write_audiofile(output_wav)

    # Close the audio clip
    audio_clip.close()

def add_subtitles_to_video(video_file_path, timestamps, subs_txt, out_video_path, fontpath=r"transcription_web_app\fonts\noto_sans.ttf"):
    video   = VideoFileClip(video_file_path)
    FPS     = int(video.fps)
    cuts    = np.array([time[0] for time in timestamps])
    df      = {"frame":[],"sentence":[]}

    with open(subs_txt,encoding="utf-8") as f:
        text = f.readlines()

    for frame in range(video.reader.nframes):
        t = frame/FPS
        n = len(cuts[cuts<=t])-1

        df["frame"].append(frame)
        df["sentence"].append(text[n].split("|")[-1])


    df["frame"] = list(range(len(df["sentence"])))
    df = pd.DataFrame(df)
    
    font = ImageFont.truetype(fontpath, 32)

    def pipeline(frame):
        try:
            height = frame.shape[0]
            width  = frame.shape[1]

            img_pil = Image.fromarray(frame)

            text = str(next(dfi)[1].sentence)

            text = textwrap.fill(text, width=int(0.95*width*len(text)/font.getlength(text)))

            reshaped_text = arabic_reshaper.reshape(text)
            bidi_text = get_display(reshaped_text) 

            draw = ImageDraw.Draw(img_pil)
            draw.text((width//2, 9*height//10), bidi_text, align="center", fill='white', font=font, stroke_width=1, stroke_fill='black', anchor="mm")
            frame = np.array(img_pil)
        except StopIteration:
            pass
        # additional frame manipulation
        return frame

    dfi = df.iterrows()

    out_video = video.fl_image(pipeline)
    out_video.write_videofile(out_video_path, audio=True)

def convert_to_srt(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    # Open the output SRT file for writing
    with open(output_file, 'w', encoding='utf-8') as srt_file:
        subtitle_number = 1  # Counter for subtitle numbers

        # Loop through each line in the input file
        for line in lines:
            # Split the line into timestamp and text
            parts = line.split('|')
            
            # Check if the line has timestamps
            if len(parts) == 3:
                start, end = parts[0],parts[1]
                text = parts[2]
                
                # Convert timestamp to SubRip format
                srt_timestamp = f"{start.replace('.', ',')} --> {end.replace('.', ',')}"

                # Write SubRip formatted data to the output file
                srt_file.write(f"{subtitle_number}\n{srt_timestamp}\n{text}\n")

                # Increment subtitle number
                subtitle_number += 1

def translate_subs_txt(subs_txt_path, translated_subs_txt_path, source_language='arabic', target_language='english'):
    # Use any translator you like, in this example GoogleTranslator
    translator = GoogleTranslator(source=source_language, target=target_language)

    with open(subs_txt_path, "r", encoding="utf-8") as f:
        subs = f.readlines()

    with open(translated_subs_txt_path,'w',encoding="utf-8") as translation:
        for line in subs:
            start,end,text  = line.split("|")
            translated_text = translator.translate(text)

            translation.write(f"{start}|{end}|{translated_text}\n")


def transcribe_all(file_path):
    folder     = os.path.dirname(file_path)
    video_name = os.path.basename(file_path)[:-4]

    video_path                  = os.path.join(folder,f"{video_name}.mp4")
    extracted_audio_path        = os.path.join(folder,f"{video_name}_audio.wav")

    output_segments_folder      = os.path.join(folder,f"{video_name}_audio_segments")

    subs_txt_path               = os.path.join(folder,f"{video_name}_subs.txt")

    FPS = VideoFileClip(video_path).fps

    # Create a folder to store audio segments
    shutil.rmtree(output_segments_folder,ignore_errors=True)
    os.makedirs(output_segments_folder, exist_ok=False)

    # Extract audio from video
    extract_audio_from_video(video_path, extracted_audio_path)

    # Split the input WAV file into segments
    timestamps = split_wav_on_silence(extracted_audio_path, output_segments_folder , f=1/FPS)

    # Transcribe each audio segment to Arabic text and write timestamps to the output text file
    subtitles = transcribe_audio_segments(output_segments_folder, timestamps, subs_txt_path)

    shutil.rmtree(output_segments_folder,ignore_errors=True)
    return subtitles
