import React, { useState } from "react";

const VideoUploader = ({ fileInputRef }) => {
  const [videoUrl, setVideoUrl] = useState("");

  const handleUpload = (event) => {
    const file = event.target.files[0];

    if (file.type.match("video/[a-z]+")) {
      const reader = new FileReader();
      reader.onload = () => {
        const blob = new Blob([reader.result]);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please select a valid video file");
    }
  };

  return (
    <div className="videoComp column">
      <div>
        <label id="input-upload">
          <input ref={fileInputRef} type="file" onChange={handleUpload} />
        </label>
      </div>

      <div>
        {videoUrl && <video id="video" controls src={videoUrl} width="660" />}
      </div>
    </div>
  );
};

export default VideoUploader;
