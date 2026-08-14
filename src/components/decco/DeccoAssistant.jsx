import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Send, X } from "lucide-react";
import { sendMessage } from "./deccoApi";
import { SUGGESTED_PROMPTS } from "./deccoKnowledge";
import { playSendPop, playTypeClick } from "./deccoSounds";
import { DECCO_ORIGINAL } from "./deccoAssets";

const CHAT_CLIPS = {
  waiting: "/waiting.mp4",
  thinking: "/thinking.mp4",
  response: "/response.mp4",
};

function DeccoAvatar({ variant = "header" }) {
  return (
    <span className={`decco-profile decco-profile--${variant}`} aria-hidden="true">
      <img src={DECCO_ORIGINAL} alt="" draggable={false} />
      {variant === "header" ? <span className="decco-assistant-online" /> : null}
    </span>
  );
}

function DeccoBuddy({ mood = "waiting" }) {
  const src = CHAT_CLIPS[mood] || CHAT_CLIPS.waiting;
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
    video.playsInline = true;
    video.loop = true;
    const play = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    if (video.readyState >= 2) play();
    video.addEventListener("loadeddata", play);
    video.addEventListener("canplay", play);
    return () => {
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("canplay", play);
    };
  }, [src]);

  return (
    <div
      className={`decco-buddy is-${mood}`}
      aria-label={
        mood === "thinking"
          ? "Decco is thinking"
          : mood === "response"
            ? "Decco is preparing a reply"
            : "Decco is waiting for a message"
      }
    >
      <span className="decco-buddy-face" aria-hidden="true">
        <video
          key={src}
          ref={videoRef}
          className="decco-buddy-video"
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
        />
      </span>
    </div>
  );
}

function DeccoAssistant({
  open,
  onClose,
  onPresence,
}) {
  const titleId = useId();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "decco",
      text: "Hi guys! I’m Decco from Deccan AI Labs. Ask me about internships, certificates, or how to get started — I’d love to help.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);
  const abortRef = useRef(null);
  const inputRef = useRef("");
  const typingTimer = useRef(0);
  const busyRef = useRef(false);
  const presenceRef = useRef(onPresence);

  inputRef.current = input;
  busyRef.current = busy;
  presenceRef.current = onPresence;

  const submit = useCallback(async (raw) => {
    const text = (raw ?? inputRef.current).trim();
    if (!text || busyRef.current) return;

    setInput("");
    setTyping(false);
    playSendPop();
    setMessages((prev) => [...prev, { role: "user", text }]);
    setBusy(true);
    presenceRef.current?.("thinking");

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { reply } = await sendMessage(text, { signal: controller.signal });
      setMessages((prev) => [...prev, { role: "decco", text: reply }]);
      presenceRef.current?.("idle");
    } catch (err) {
      if (err?.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            role: "decco",
            text: "Sorry — I couldn’t process that just now. Please try again.",
          },
        ]);
      }
      presenceRef.current?.("idle");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open, busy, typing]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      window.clearTimeout(typingTimer.current);
    };
  }, []);

  if (!open) return null;

  const markTyping = () => {
    setTyping(true);
    presenceRef.current?.("listening");
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      setTyping(false);
      presenceRef.current?.("idle");
    }, 900);
  };

  const isTyping = !busy && (typing || input.trim().length > 0);
  const buddyMood = busy ? "response" : isTyping ? "thinking" : "waiting";
  const status = busy ? "Thinking…" : isTyping ? "Typing…" : "Online";
  const showSuggestions = messages.length === 1 && !busy;

  return createPortal(
    <div className="decco-assistant-root" role="presentation">
      <button
        type="button"
        className="decco-assistant-backdrop"
        aria-label="Close Decco assistant"
        onClick={onClose}
      />
      <div
        className="decco-assistant-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="decco-assistant-header">
          <div className="decco-assistant-brand">
            <DeccoAvatar variant="header" />
            <div>
              <p id={titleId} className="decco-assistant-title">
                Decco
              </p>
              <p className="decco-assistant-sub">{status}</p>
            </div>
          </div>
          <button
            type="button"
            className="decco-assistant-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div ref={listRef} className="decco-assistant-messages">
          {messages.map((msg, i) => (
            <div
              key={`${msg.role}-${i}`}
              className={`decco-row ${
                msg.role === "user" ? "decco-row--user" : "decco-row--decco"
              } ${i === messages.length - 1 ? "is-fresh" : ""}`}
            >
              {msg.role === "decco" ? (
                <DeccoAvatar variant="bubble" />
              ) : null}
              <div className={`decco-bubble decco-bubble--${msg.role}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {showSuggestions ? (
            <div className="decco-suggestions">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="decco-chip"
                  onClick={() => submit(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="decco-composer">
          <DeccoBuddy mood={buddyMood} />
          <form
            className="decco-assistant-form"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key.length === 1 || e.key === "Backspace" || e.key === " ") {
                playTypeClick();
                markTyping();
              }
            }}
            placeholder="Ask about DECCAN AI LABS…"
            className="decco-assistant-input"
            disabled={busy}
            autoFocus
          />
          <button
            type="submit"
            className="decco-send"
            aria-label="Send message"
            disabled={busy || !input.trim()}
          >
            <Send size={18} />
          </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DeccoAssistant;
