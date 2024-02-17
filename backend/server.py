from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
from moviepy.editor import VideoFileClip
from transcribe_clip import transcribe
from transcribe_all import transcribe_all

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

UPLOAD_FOLDER = 'backend/uploads'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mkv'}  # Add allowed video file extensions

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


def allowed_file(filename):
    return '.' in filename\
        and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def parse_time(timestamp_str: str) -> int:
    time_format = "%H:%M:%S.%f"

    # Parse the timestamp string to a datetime object
    timestamp_datetime = datetime.strptime(timestamp_str, time_format)

    # Calculate the total seconds (including milliseconds)
    total_seconds = timestamp_datetime.hour * 3600 + \
        timestamp_datetime.minute * 60 + timestamp_datetime.second + \
        timestamp_datetime.microsecond / 1e6

    return total_seconds


@app.route('/upload', methods=['POST'])
def upload_file():
    client_ip = request.remote_addr
    print(f'New connection IP: {client_ip}')
    # Check if the post request has the file part
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    file = request.files['video']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        # Save the uploaded file to the server
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)

        start_time = parse_time(request.form.get("start"))
        end_time = parse_time(request.form.get("end"))
        print(start_time, end_time)

        # Load the video clip
        clip = VideoFileClip(filename)
        subclip = clip.subclip(start_time, end_time)
        clip_path = os.path.join(app.config['UPLOAD_FOLDER'], "clip.mp4")
        subclip.write_videofile(clip_path, audio=True)
        # Get the frames per second (FPS) of the video
        # Close the video clip
        clip.close()
        # Perform further processing on the filename if needed
        # result = model.transcribe(clip_path, verbose=True, language="ar")
        text = transcribe(clip_path)

        return jsonify({'text': text}), 200

    return jsonify({'error': 'Invalid file format'}), 400


@app.route('/upload/transcribe_all', methods=['POST'])
def get_subtitles():
    client_ip = request.remote_addr
    print(f'New connection IP: {client_ip}')
    # Check if the post request has the file part
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400

    file = request.files['video']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        # Save the uploaded file to the server
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)

        subtitles = transcribe_all(filename)

        return jsonify(subtitles), 200

    return jsonify({'error': 'Invalid file format'}), 400


if __name__ == '__main__':
    # model = whisper.load_model("medium", device=device)
    app.run(port=5000)  # Change the port if needed
