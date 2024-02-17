import speech_recognition as sr
from moviepy.editor import VideoFileClip
import os
from moviepy.editor import VideoFileClip


def transcribe_audio(clip_auido_path):
    recognizer = sr.Recognizer()

    if clip_auido_path.endswith(".wav"):

        with sr.AudioFile(clip_auido_path) as source:
            # print(f"Processing {file_name}...")
            audio_data = recognizer.record(source)
        try:
            # print("Transcribing...")
            text = recognizer.recognize_google(audio_data, language="ar")
            return text
        except sr.UnknownValueError:
            print("Speech Recognition could not understand audio")
        except sr.RequestError as e:
            print(f"Could not request results from Google Speech Recognition service; {e}")

def extract_audio_from_video(clip_path, clip_auido_path):
    # Load the video clip
    video_clip = VideoFileClip(clip_path)

    # Extract audio
    audio_clip = video_clip.audio

    # Save audio as WAV
    audio_clip.write_audiofile(clip_auido_path)

    # Close the audio clip
    audio_clip.close()

def transcribe(clip_path):
    clip_auido_path = os.path.join(os.path.dirname(clip_path), "clip_audio.wav")
    extract_audio_from_video(clip_path, clip_auido_path)
    text = transcribe_audio(clip_auido_path)
    return text


