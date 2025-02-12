import { chromium } from "playwright";

export const linkedInScraper = async () => {
  const browser = await chromium.launch({ headless: true, slowMo: 50 });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  const page = await context.newPage();

  // ✅ Go to LinkedIn Jobs Page
  await page.goto(
    `https://www.linkedin.com/jobs/search?keywords=locationUnited%20States`,
    {
      waitUntil: "domcontentloaded",
    }
  );

  // ✅ Mimic human-like mouse movements
  async function humanMouseMovements() {
    const startX = Math.floor(Math.random() * 300);
    const startY = Math.floor(Math.random() * 300);
    await page.mouse.move(startX, startY, { steps: 10 });

    for (let i = 0; i < 5; i++) {
      const x = Math.floor(Math.random() * 1280);
      const y = Math.floor(Math.random() * 720);
      await page.mouse.move(x, y, {
        steps: Math.floor(Math.random() * 20) + 5,
      });
      await page.waitForTimeout(Math.floor(Math.random() * 1500) + 500);
    }

    // ✅ Random click on a safe element
    try {
      const buttons = await page.$$("button, a");
      if (buttons.length) {
        const randomButton =
          buttons[Math.floor(Math.random() * buttons.length)];
        await randomButton.click();
        console.log("Random click performed!");
      }
    } catch (error) {
      console.log("No clickable elements found for random click.");
    }
  }

  await humanMouseMovements();

  // ✅ Close sign-in popups if they appear
  try {
    await page.waitForSelector(
      '[aria-labelledby="base-contextual-sign-in-modal-modal-header"]',
      { timeout: 5000 }
    );
    await page.click(
      'button[data-tracking-control-name="public_jobs_contextual-sign-in-modal_modal_dismiss"]'
    );
    console.log("Popup closed!");
  } catch (error) {
    console.log("No login popup detected.");
  }

  // ✅ Smooth scrolling with random behavior
  async function humanScrolling() {
    let scrollDirection = 1; // 1 = down, -1 = up

    for (let i = 0; i < Math.floor(Math.random() * 6) + 3; i++) {
      const scrollAmount = Math.floor(Math.random() * 600) + 300;
      await page.evaluate(
        ({ amount, direction }) => {
          window.scrollBy({
            top: amount * direction,
            behavior: "smooth",
          });
        },
        { amount: scrollAmount, direction: scrollDirection }
      );

      if (Math.random() > 0.7) scrollDirection *= -1; // Occasionally scroll back up

      await page.waitForTimeout(Math.random() * 3000 + 2000);
    }
  }

  await humanScrolling();

  // ✅ Click on a random job listing to mimic user behavior
  async function clickRandomJob() {
    try {
      const jobCards = await page.$$("ul.jobs-search__results-list > li");
      if (jobCards.length) {
        const randomJob = jobCards[Math.floor(Math.random() * jobCards.length)];
        await randomJob.click();
        console.log("Clicked on a random job listing!");
        await page.waitForTimeout(3000); // Wait after clicking
      }
    } catch (error) {
      console.log("No job listings found to click.");
    }
  }

  await clickRandomJob();

  // ✅ Extract job details
  const jobs = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll("ul.jobs-search__results-list > li")
    ).map((job) => {
      const titleElement = job.querySelector(".base-search-card__title");
      const companyElement = job.querySelector(".base-search-card__subtitle a");
      const locationElement = job.querySelector(".job-search-card__location");
      const linkElement = job.querySelector(".base-card__full-link");
      const timeElement = job.querySelector(".job-search-card__listdate--new");

      return {
        title: titleElement ? titleElement?.textContent?.trim() : null,
        company: companyElement ? companyElement?.textContent?.trim() : null,
        location: locationElement ? locationElement.textContent?.trim() : null,
        link: linkElement ? (linkElement as HTMLAnchorElement)?.href : null,
        posted: timeElement ? timeElement?.textContent?.trim() : null,
      };
    });
  });

  console.log("✅ Jobs Scraped:", jobs);

  await browser.close();
  return jobs;
};
