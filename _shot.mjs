import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text());
});
page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));

await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await page.fill('input[type="email"]', "ana.souza@evento.com");
await page.fill('input[type="password"]', "senha123");
await page.click('button[type="submit"]');
await page.waitForTimeout(2000);
console.log("URL after submit:", page.url());
await page.screenshot({ path: "after-submit.png", fullPage: true });
await page.waitForSelector("text=Explorar", { timeout: 15000 });
await page.screenshot({ path: "home-dark.png", fullPage: true });

await page.evaluate(() => document.documentElement.classList.remove("dark"));
await page.waitForTimeout(200);
await page.screenshot({ path: "home-light.png", fullPage: true });

await browser.close();
console.log("done");
