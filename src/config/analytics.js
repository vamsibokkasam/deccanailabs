export const GA_MEASUREMENT_ID = "G-228BDMQV0X";

export function trackPageView(path) {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("config", GA_MEASUREMENT_ID, {
    page_path: path,
  });
}
