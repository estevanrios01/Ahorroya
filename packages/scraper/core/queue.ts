import { ScrapingJob } from "./job";

export class Queue {
    private jobs: ScrapingJob[] = [];

    push(job: ScrapingJob) {
        this.jobs.push(job);
    }

    pop() {
        return this.jobs.shift();
    }

    size() {
        return this.jobs.length;
    }
}
