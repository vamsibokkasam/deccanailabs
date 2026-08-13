/**
 * Pluggable AI message sender.
 * Replace the body of `sendMessage` with a real backend call later.
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

  // Simulate thinking latency; abortable for cleanup
  await wait(700 + Math.min(trimmed.length * 12, 900), options.signal);

  const lower = trimmed.toLowerCase();

  if (/intern|program|course|apply/.test(lower)) {
    return {
      reply:
        "We offer hands-on internships in AI & Machine Learning, Web Development, Python, Java, Data Science, and Cyber Security. Visit the Internships page to apply, or tell me which domain interests you.",
    };
  }

  if (/project|final.?year|major/.test(lower)) {
    return {
      reply:
        "Yes — Deccan AI Labs helps students build major and final-year projects with mentorship and industry-aligned outcomes. Share your college and preferred tech stack and I’ll guide you.",
    };
  }

  if (/contact|email|phone|whatsapp|call/.test(lower)) {
    return {
      reply:
        "You can reach us at careers@deccanailabs.com or +91 9845428526. I’m also here if you want a quick answer now.",
    };
  }

  if (/hello|hi|hey|hai/.test(lower)) {
    return {
      reply:
        "Hi! I’m Decco from DECCAN AI LABS. Ask me about internships, projects, or how to get started.",
    };
  }

  return {
    reply:
      "Thanks for your message! I’m Decco from DECCAN AI LABS. Ask about internships, final-year projects, or our programs — or visit Internships / Contact for next steps.",
  };
}

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const id = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(id);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}
