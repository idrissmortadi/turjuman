import "./App.css";
import SubtitlesComponent from "./components/SubtitlesComponent";
import VideoUploader from "./components/VideoUploadComponent";
import { useRef } from "react";

function App() {
  const fileInputRef = useRef(null);

  const subtitles: Array<string> = [];

  return (
    <div className="app">
      <div className="title">
        <h1>ترجمان</h1>
      </div>
      <div className="Content">
        <div>
          <VideoUploader fileInputRef={fileInputRef} />
        </div>
       
        <SubtitlesComponent
          subtitlesList={subtitles}
          fileInputRef={fileInputRef}
        />
      </div>
    </div>
  );
}

export default App;
