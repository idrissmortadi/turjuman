import React, { useRef } from "react";

interface VideoPlayerProps {
  src: string;
  currentTime: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, currentTime }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (video !== null) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  return (
    <div className="videoComp">
      <div>
        <video id="video" ref={videoRef} controls src={src} width="660">
          Your browser does not support the video tag.
        </video>
      </div>
      <div></div>
    </div>
  );
};

export default VideoPlayer;
