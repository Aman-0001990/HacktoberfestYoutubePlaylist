import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const loginLink = "https://www.youtube.com/feed/channels";

// 🔹 helper function to replace waitForTimeout
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const browser = await puppeteer.launch({
  headless: false,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  userDataDir: "C:\\Users\\advsa\\AppData\\Local\\Google\\Chrome\\User Data\\puppeteer-profile",
  args: ["--start-maximized"]
});

(async () => {
  const page = await browser.newPage();
  await page.goto(loginLink, { waitUntil: "networkidle2" });

  let unsubCount = 0;
  let prevChannelCount = 0;

  while (true) {
    let menuButtons = await page.$$('.yt-spec-button-shape-next__secondary-icon');

    if (menuButtons.length === 0) {
      console.log("No more subscriptions left");
      break;
    }

    console.log(`📺 Found ${menuButtons.length} channels on screen`);

    for (let i = 0; i < menuButtons.length; i++) {
      try {
        const btns = await page.$$('.yt-spec-button-shape-next__secondary-icon');
        const menuButton = btns[i];
        if (!menuButton) continue;

        await menuButton.click();
        console.log(`Opened channel menu #${unsubCount + 1}`);

        await page.waitForSelector('tp-yt-paper-item', { visible: true, timeout: 5000 });

        const unsubscribeBtn = await page.evaluateHandle(() => {
          const items = [...document.querySelectorAll("tp-yt-paper-item")];
          return items.find(el => el.innerText.trim() === "Unsubscribe");
        });

        if (unsubscribeBtn) {
          await unsubscribeBtn.click();
          console.log("Clicked Unsubscribe");

          await page.waitForSelector('#confirm-button', { visible: true });
          await page.click('#confirm-button');
          console.log("Confirmed Unsubscribe ");

          unsubCount++;

          // 🔹 replaced waitForTimeout
          await delay(1000);
        } else {
          console.log(" Unsubscribe button not found!");
        }
      } catch (err) {
        console.log("Error:", err.message);
      }
    }

    prevChannelCount = menuButtons.length;

    let newCount = prevChannelCount;
    for (let step = 0; step < 10; step++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
      // 🔹 replaced waitForTimeout
      await delay(1000);

      menuButtons = await page.$$('.yt-spec-button-shape-next__secondary-icon');
      newCount = menuButtons.length;

      if (newCount > prevChannelCount) {
        console.log(` Loaded ${newCount - prevChannelCount} new channels`);
        break;
      }
    }

    if (newCount === prevChannelCount) {
      console.log("No more channels loaded. Probably reached the end.");
      break;
    }
  }

  console.log(` Finished unsubscribing from ${unsubCount} channels`);
})();
