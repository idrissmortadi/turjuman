import "./App.css";
import VideoPlayer from "./components/VideoComponent";
import SubtitlesComponent from "./components/SubtitlesComponent";
import VideoUploader from "./components/VideoUploadComponent";
import { useState, useRef } from "react";

function App() {
  const videoSource = "src/assets/ahmed_sied_0_30.mp4";
  const fileInputRef = useRef(null);

  const subtitles = [];
  const [timestamp, setTimestamp] = useState(0);
  const [stopTime, setStopTime] = useState(0);

  const handleSetVideoTime = (newTimestamp) => {
    // Handle the video time as needed
    console.log(`Video time set to: ${newTimestamp}`);
    // Update the timestamp state
    setTimestamp(newTimestamp);
  };
  const handleSetStopTime = (endTimestamp) => {
    // Handle the video time as needed
    console.log(`Video end time set to: ${endTimestamp}`);
    // Update the timestamp state
    setStopTime(endTimestamp);
  };

  return (
    <div className="app">
      <div className="title">
        <h1>ترجمان</h1>
      </div>
      <div className="Content">
        <VideoUploader fileInputRef={fileInputRef} />
        <SubtitlesComponent
          subtitlesList={subtitles}
          onSetVideoTime={handleSetVideoTime}
          fileInputRef={fileInputRef}
        />
      </div>
    </div>
  );
}

export default App;
