import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

// Function to convert timestamp string to seconds
const timestampToSeconds = (timestamp: string): number => {
  const [hours, minutes, seconds] = timestamp.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const SubtitlesComponent = ({
  subtitlesList,
  fileInputRef,
}) => {
  const [subtitles, setSubtitles] = useState(subtitlesList);
  const [timestamp, setTimestamp] = useState("0");
  const [isLoading, setIsLoading] = useState(-1);

  const handleAddSubtitle = (index, time) => {
    const updatedSubtitles = [...subtitles];
    updatedSubtitles.splice(index, 0, { start: time, end: time, text: "" });
    setSubtitles(updatedSubtitles);
  };

  const handleDeleteSubtitle = (index) => {
    const updatedSubtitles = [...subtitles];
    updatedSubtitles.splice(index, 1);
    setSubtitles(updatedSubtitles);
  };

  const handleStartChange = (index, newTime) => {
    const updatedSubtitles = [...subtitles];
    updatedSubtitles[index].start = newTime;
    setSubtitles(updatedSubtitles);
  };

  const handleEndChange = (index, newTime) => {
    const updatedSubtitles = [...subtitles];
    updatedSubtitles[index].end = newTime;
    setSubtitles(updatedSubtitles);
  };

  const handleTextChange = (index, newText) => {
    const updatedSubtitles = [...subtitles];
    updatedSubtitles[index].text = newText;
    setSubtitles(updatedSubtitles);
  };

  const handleTimeClick = (index) => {
    var startTimestamp = document.getElementById(`start-` + index);
    var endTimestamp = document.getElementById(`end-` + index);

    const v = document.getElementById("video");
    // Validate the input format
    var timestampRegex = /^(\d{2}):(\d{2}):(\d{2}).(\d{3})$/;

    var matchStart = startTimestamp.value.match(timestampRegex);
    var matchEnd = endTimestamp.value.match(timestampRegex);

    if (matchStart) {
      // Extract components from the matched groups
      var hours = parseInt(matchStart[1], 10);
      var minutes = parseInt(matchStart[2], 10);
      var seconds = parseInt(matchStart[3], 10);
      var milliseconds = parseInt(matchStart[4], 10);

      // Calculate the total seconds
      var startTotalSeconds =
        hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;

      // Set the video's currentTime to the calculated time
      v.currentTime = startTotalSeconds;
      v.play();
    } else {
      // Display an error message for invalid input format
      alert("Invalid timestamp format. Please use HH:mm:ss.SSS format.");
    }
    if (matchEnd) {
      // Extract components from the matched groups
      var hours = parseInt(matchEnd[1], 10);
      var minutes = parseInt(matchEnd[2], 10);
      var seconds = parseInt(matchEnd[3], 10);
      var milliseconds = parseInt(matchEnd[4], 10);

      // Calculate the total seconds
      var endTotalSeconds =
        hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;

      var pausing_function = function () {
        if (this.currentTime >= endTotalSeconds) {
          this.pause();

          // remove the event listener after you paused the playback
          this.removeEventListener("timeupdate", pausing_function);
        }
      };
      v.addEventListener("timeupdate", pausing_function);
    } else {
      // Display an error message for invalid input format
      alert("Invalid timestamp format. Please use HH:mm:ss.SSS format.");
    }
  };

  const handleTranscribe = async (index, subtitle) => {
    if (isLoading !== -1) {
      return;
    }
    const file = fileInputRef.current.files[0];
    const formData = new FormData();

    // Append the video file
    formData.append("video", file);

    // Append additional data (timestamps in this example)
    formData.append("start", subtitle.start);
    formData.append("end", subtitle.end);

    setIsLoading(index);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/upload",
        formData
      );
      // Handle the success response
      console.log(response.data);
      const updatedSubtitles = [...subtitles];
      updatedSubtitles.splice(index, 1, {
        start: subtitle.start,
        end: subtitle.end,
        text: response.data.text,
      });
      setSubtitles(updatedSubtitles);
    } catch (error) {
      // Handle errors
      console.error(error);
    } finally {
      setIsLoading(-1);
    }
  };
  const getAllSubtitles = async () => {
    if (isLoading !== -1) {
      return;
    }
    const file = fileInputRef.current.files[0];
    const formData = new FormData();

    // Append the video file
    formData.append("video", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/upload/transcribe_all",
        formData
      );
      // Handle the success response
      console.log(response.data);
      setSubtitles(response.data);
    } catch (error) {
      // Handle errors
      console.error(error);
    } finally {
      setIsLoading(-1);
    }
  };

  function createSubtitleString(subtitle: any, index: number): string {
    return `${index + 1}\n${subtitle.start} --> ${subtitle.end}\n${
      subtitle.text
    }\n`;
  }
  function createTafrighString(subtitle: any, index: number): string {
    return `${subtitle.text}`;
  }

  const handlDonwloadTranscription = async (tafrigh: bool) => {
    if (subtitles.length === 0) return;

    var subtitleStrings = [];
    if (tafrigh) {
      subtitleStrings = subtitles.map((subtitle, index) =>
        createTafrighString(subtitle, index)
      );
    } else {
      subtitleStrings = subtitles.map((subtitle, index) =>
        createSubtitleString(subtitle, index)
      );
    }

    const content = subtitleStrings.join("\n"); // Join subtitles with two newlines

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "transcription.srt";
    a.click();

    // Clean up
    URL.revokeObjectURL(url);
  };

  return (
    <div className="subtitlesComp column">
      <div className="subs-main-buttons">
        <button onClick={getAllSubtitles}>ترجم الكل</button>
        <button onClick={() => handleAddSubtitle(0, "00:00:00.000")}>
          أضف
        </button>
        <button onClick={() => handlDonwloadTranscription(false)}>نزّل</button>
        <button onClick={() => handlDonwloadTranscription(true)}>تفريغ</button>
      </div>
      <div className="subtitles">
        {subtitles.map((subtitle, index) => (
          <div className="subtitlesBox subtitlesBox-loading" key={index}>
            <div className="timeArea">
              <input
                id={`start-` + index}
                className="subtitlesTime"
                type="text"
                value={subtitle.start}
                onChange={(e) => handleStartChange(index, e.target.value)}
              />
              <input
                id={`end-` + index}
                className="subtitlesTime"
                type="text"
                value={subtitle.end}
                onChange={(e) => handleEndChange(index, e.target.value)}
              />
              <button onClick={() => handleTranscribe(index, subtitle)}>
                ترجم المقطع
              </button>
              {isLoading === index && (
                <div style={{ textAlign: "center", marginTop: "3px" }}>
                  <FontAwesomeIcon icon={faSpinner} className="spinner" />
                  <p>Loading...</p>
                </div>
              )}
            </div>
            <div>
              <textarea
                className="subtitlesText"
                value={subtitle.text}
                onChange={(e) => handleTextChange(index, e.target.value)}
                onClick={() => handleTimeClick(index)}
              />
            </div>
            <button onClick={() => handleDeleteSubtitle(index)}>امسح</button>
            <button onClick={(e) => handleAddSubtitle(index + 1, subtitle.end)}>
              أضف أسفل
            </button>
            <button onClick={(e) => handleAddSubtitle(index, subtitle.start)}>
              أضف فوق
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubtitlesComponent;
