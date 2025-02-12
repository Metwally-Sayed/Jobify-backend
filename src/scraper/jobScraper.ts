import { Jobs } from "../../types/jobs";
import { linkedInScraper } from "./scrappers/linkedInScraper";

export const scrapeJobs = async () => {
  let jobs: Jobs[] = [];
  const linkedInJobs = await linkedInScraper();
  if (linkedInJobs) {
    jobs = [...jobs, ...linkedInJobs];
  }
  console.log("scrapeJobs:", jobs);
  return jobs;
};
