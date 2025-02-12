import { Request, Response } from "express";
import { Job } from "../../types/jobs";
import { scrapeJobs } from "../scraper/jobScraper";

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    // const jobs = SITESJOBS.map(async (site) => {
    //   await scrapeJobs(site.url as string, site.filter as string);
    // });
    const jobs: Job[] = await scrapeJobs();
    console.log("Loading.... ⌛");
    console.log("jobs from API:", jobs);

    //res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to scrape jobs... ❌" });
  }
};
