import { useEffect, useRef } from "react";

export const DECCO_IDLE_VIDEO = encodeURI("/Sleep_video.mp4");
export const DECCO_WAKEUP_VIDEO = encodeURI("/Wakeup_video.mp4");
const POSTER_SRC = "/DECCO.jpeg";
/** Restart before the last frames so the clip does not zoom/shrink at the end. */
const LOOP_END_PAD_S = 0.35;

function disableVideoCaptions(video) {
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  if (!video.textTracks) return;
  for (let i = 0; i < video.textTracks.length; i += 1) {
    video.textTracks[i].mode = "disabled";
  }
}

function DeccoRobot({
  state = "idle",
  className = "",
  reducedMotion = false,
  src = DECCO_IDLE_VIDEO,
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (reducedMotion) {
      video.pause();
      return undefined;
    }

    disableVideoCaptions(video);
    video.playsInline = true;
    video.loop = true;
    video.muted = true;

    let restarting = false;

    const play = () => {
      disableVideoCaptions(video);
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    const restart = () => {
      if (restarting) return;
      restarting = true;
      try {
        video.currentTime = 0.04;
      } catch {
        /* ignore seek errors */
      }
      play();
    };

    const onTimeUpdate = () => {
      const duration = video.duration;
      if (!duration || !Number.isFinite(duration)) return;
      if (video.currentTime >= duration - LOOP_END_PAD_S) {
        restart();
      }
    };

    const onSeeked = () => {
      restarting = false;
    };

    const onAddTrack = () => disableVideoCaptions(video);

    try {
      video.currentTime = 0.04;
    } catch {
      /* ignore */
    }
    if (video.readyState >= 2) play();
    video.addEventListener("loadeddata", play);
    video.addEventListener("canplay", play);
    video.addEventListener("loadedmetadata", onAddTrack);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", restart);
    video.addEventListener("seeked", onSeeked);
    video.textTracks?.addEventListener?.("addtrack", onAddTrack);

    return () => {
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("canplay", play);
      video.removeEventListener("loadedmetadata", onAddTrack);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", restart);
      video.removeEventListener("seeked", onSeeked);
      video.textTracks?.removeEventListener?.("addtrack", onAddTrack);
    };
  }, [reducedMotion, src]);

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
            key={src}
            ref={videoRef}
            className="decco-photo-img decco-photo-video"
            src={src}
            autoPlay
            muted
            defaultMuted
            loop
            playsInline
            preload="auto"
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

export default DeccoRobot;
