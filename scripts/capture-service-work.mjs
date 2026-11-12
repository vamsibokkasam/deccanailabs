import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "services", "work");
const chrome =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const sites = [
  {
    file: "sri-sandeep",
    url: "https://www.srisandeepminifunctionhall.com/",
  },
  {
    file: "spice-route",
    url: "https://spice-route-red.vercel.app/",
  },
  {
    file: "skyline-properties",
    url: "https://real-estate-xi-two-69.vercel.app/",
  },
  {
    file: "urban-thread",
    url: "https://urban-thread-theta.vercel.app/",
  },
];

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: true,
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
  args: ["--hide-scrollbars", "--disable-gpu", "--no-first-run"],
});

try {
  for (const site of sites) {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(90000);
    await page.goto(site.url, { waitUntil: "networkidle2" });
    await page.evaluate(async () => {
      document
        .querySelectorAll(
          '[id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i]'
        )
        .forEach((node) => {
          const close = node.querySelector(
            'button, [aria-label*="close" i], [aria-label*="accept" i]'
          );
          close?.click();
        });
      await new Promise((resolve) => {
        let y = 0;
        const step = () => {
          y += 900;
          window.scrollTo(0, y);
          if (y < document.body.scrollHeight) {
            window.setTimeout(step, 180);
          } else {
            window.scrollTo(0, 0);
            window.setTimeout(resolve, 400);
          }
        };
        step();
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 800));

    const png = await page.screenshot({ fullPage: true, type: "png" });
    const dest = path.join(outDir, `${site.file}.webp`);
    await sharp(png)
      .webp({ quality: 72 })
      .toFile(dest);
    const meta = await sharp(dest).metadata();
    console.log(`${site.file}: ${meta.width}x${meta.height}`);
    await page.close();
  }
} finally {
  await browser.close();
}
