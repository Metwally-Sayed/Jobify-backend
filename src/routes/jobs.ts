import express from "express";
import { scrapeJobs } from "../scraper/jobScraper";
const router = express.Router();

router.get("/scrape", async (req, res) => {
  try {
    // const jobs = SITESJOBS.map(async (site) => {
    //   await scrapeJobs(site.url as string, site.filter as string);
    // });
    const jobs = await scrapeJobs();
    console.log("Loading.... ⌛");
    console.log("jobs from API:", jobs);

    //res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to scrape jobs... ❌" });
  }
});

export default router;
