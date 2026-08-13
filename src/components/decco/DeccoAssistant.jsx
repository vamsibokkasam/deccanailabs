import { useEffect, useId, useRef, useState } from "react";
import { Mic, Send, X } from "lucide-react";
import { sendMessage } from "./deccoApi";

/**
 * Floating Decco assistant panel — does not replace site layout.
 */
function DeccoAssistant({
  open,
  onClose,
  onSpeak,
  onListeningChange,
  onThinkingChange,
}) {
  const titleId = useId();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "decco",
      text: "Hi! I’m Decco. Ask me about internships, projects, or DECCAN AI LABS.",
    },
  ]);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const listRef = useRef(null);
  const abortRef = useRef(null);
  const recognitionRef = useRef(null);

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
  }, [messages, open]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      recognitionRef.current?.stop?.();
    };
  }, []);

  if (!open) return null;

  const submit = async (raw) => {
    const text = (raw ?? input).trim();
    if (!text || busy) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setBusy(true);
    onThinkingChange?.(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { reply } = await sendMessage(text, { signal: controller.signal });
      setMessages((prev) => [...prev, { role: "decco", text: reply }]);
      onThinkingChange?.(false);
      onSpeak?.(reply);
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
      onThinkingChange?.(false);
    } finally {
      setBusy(false);
    }
  };

  const toggleMic = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          role: "decco",
          text: "Voice input isn’t supported in this browser. You can type instead.",
        },
      ]);
      return;
    }

    if (listening) {
      recognitionRef.current?.stop?.();
      setListening(false);
      onListeningChange?.(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      onListeningChange?.(true);
    };
    recognition.onend = () => {
      setListening(false);
      onListeningChange?.(false);
    };
    recognition.onerror = () => {
      setListening(false);
      onListeningChange?.(false);
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setInput(transcript);
        submit(transcript);
      }
    };

    recognition.start();
  };

  return (
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
          <div>
            <p id={titleId} className="decco-assistant-title">
              Decco Assistant
            </p>
            <p className="decco-assistant-sub">DECCAN AI LABS</p>
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
              className={`decco-bubble decco-bubble--${msg.role}`}
            >
              {msg.text}
            </div>
          ))}
          {busy ? (
            <div className="decco-bubble decco-bubble--decco decco-bubble--thinking">
              Thinking…
            </div>
          ) : null}
        </div>

        <form
          className="decco-assistant-form"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <button
            type="button"
            className={`decco-mic ${listening ? "is-on" : ""}`}
            onClick={toggleMic}
            aria-pressed={listening}
            aria-label={listening ? "Stop listening" : "Speak with microphone"}
            disabled={busy}
          >
            <Mic size={18} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Decco anything…"
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
  );
}

export default DeccoAssistant;
