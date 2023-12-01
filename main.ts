import { Day } from "./tools/day.ts";
import { Day1 } from "./day1.ts";

const days: Day[] = [new Day1()];

type TimeEntry = {
  duration: number;
  message: string;
};

const times: { [id: string]: TimeEntry } = {};

function compare(a: TimeEntry, b: TimeEntry): number {
  return a.duration - b.duration;
}

console.debug = () => {};
console.time = (key: string) => {
  performance.mark(key + "$start");
};
console.timeLog = (key: string, msg: string) => {
  performance.mark(key + "$end");
  const t = performance.measure(key, key + "$start", key + "$end");
  times[key] = {
    duration: t.duration,
    message: `${t.duration}ms ${msg}`,
  };
};

console.log("***************************");
console.log("*** Advent of Code 2023 ***");
console.log("***************************");
console.log("");

console.time("advent-2023");
for (const day of days) {
  day.execute();
}
console.timeLog("advent-2023", "to execute them all");

console.log("");
console.log(times["advent-2023"].message);
times["advent-2023"].duration = 0; // For the sorting

const order = Object.values(times).sort((a: TimeEntry, b: TimeEntry) =>
  compare(b, a)
);

console.log(`Slowest: ${order[0].message}`);
