import { answerFromKnowledge } from "./deccoKnowledge";

/**
 * Decco chat replies — grounded in DECCAN AI LABS site knowledge.
 * Never put API keys in the frontend.
 *
 * @param {string} message
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ reply: string }>}
 */
export async function sendMessage(message, options = {}) {
  const trimmed = message.trim();
  if (!trimmed) {
    return { reply: "Please type a message and I’ll help you." };
  }

  await wait(780 + Math.min(trimmed.length * 8, 420), options.signal);

  const known = answerFromKnowledge(trimmed);
  if (known) return { reply: known };

  return {
    reply:
      "I can only help with questions about DECCAN AI LABS — internships, courses, certificates, our Bengaluru office, or how to apply. I don’t have answers for unrelated topics. Try “What internships do you offer?” or “How can I contact you?”",
  };
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = window.setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          window.clearTimeout(id);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true }
      );
    }
  });
}
