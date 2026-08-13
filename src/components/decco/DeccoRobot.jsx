import { useEffect, useRef } from "react";

const VIDEO_SRC = encodeURI(
  "/WhatsApp Video 2026-08-12 at 12.48.17 AM.mp4"
);
const POSTER_SRC = "/DECCO.jpeg";

function DeccoRobot({
  state = "idle",
  className = "",
  reducedMotion = false,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (reducedMotion) {
      video.pause();
      return undefined;
    }

    video.muted = true;
    video.playsInline = true;

    const play = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    // Keep playback smooth — never seek / re-sample (that caused blinking)
    if (video.readyState >= 2) play();
    video.addEventListener("loadeddata", play);
    video.addEventListener("canplay", play);

    return () => {
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("canplay", play);
    };
  }, [reducedMotion]);

  const isHover = state === "hover";
  const isSpeaking = state === "speaking";

  return (
    <div
      className={`decco-photo ${className} ${isHover ? "is-hover" : ""} ${
        isSpeaking ? "is-speaking" : ""
      }`}
    >
      <div className="decco-photo-stage">
        {reducedMotion ? (
          <img
            className="decco-photo-img"
            src={POSTER_SRC}
            alt=""
            draggable={false}
            decoding="async"
          />
        ) : (
          <video
            ref={videoRef}
            className="decco-photo-img decco-photo-video"
            src={VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

export default DeccoRobot;
