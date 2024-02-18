import "./App.css";
import SubtitlesComponent from "./components/SubtitlesComponent";
import VideoUploader from "./components/VideoUploadComponent";
import DoubleEndedSlider from "./components/timestampSliderComponent";
import { useState, useRef } from "react";

function App() {
  const fileInputRef = useRef(null);

  const subtitles: Array<string> = [];
  const [timestamp, setTimestamp] = useState(0);
  const [stopTime, setStopTime] = useState(0);

  const handleSetVideoTime = (newTimestamp: number) => {
    // Handle the video time as needed
    console.log(`Video time set to: ${newTimestamp}`);
    // Update the timestamp state
    setTimestamp(newTimestamp);
  };
  const handleSetStopTime = (endTimestamp: number) => {
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
        <div>
          <VideoUploader fileInputRef={fileInputRef} />
          <DoubleEndedSlider />
        </div>
       
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
