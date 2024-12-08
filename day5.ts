import { Day } from "./tools/day.ts";

type Range = {
  start: number;
  end: number;
};

interface IConverter {
  start: number;
  end: number;
  canConvert(input: number): boolean;
  convert(input: number): number;
}

class IdentityConverter implements IConverter {
  start: number;
  end: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  canConvert(input: number): boolean {
    return input >= this.start && input <= this.end;
  }

  convert(input: number): number {
    return input;
  }
}

class Converter implements IConverter {
  start: number;
  end: number;
  offset: number;

  constructor(numbers: number[]) {
    if (numbers.length !== 3) {
      throw "invalid input";
    }

    this.start = numbers[1];
    this.end = this.start + numbers[2] - 1;
    this.offset = numbers[0] - this.start;
  }

  canConvert(input: number): boolean {
    return input >= this.start && input <= this.end;
  }

  convert(input: number): number {
    return input + this.offset;
  }
}

class Input {
  seeds: number[] = [];
  seedToSoil: IConverter[] = [];
  soilToFertilizer: IConverter[] = [];
  fertilizerToWater: IConverter[] = [];
  waterToLight: IConverter[] = [];
  lightToTemperature: IConverter[] = [];
  temperatureToHumidity: IConverter[] = [];
  humidityToLocation: IConverter[] = [];

  constructor() {}

  convert(value: number, converters: IConverter[]): number {
    for (const converter of converters) {
      if (converter.canConvert(value)) {
        return converter.convert(value);
      }
    }
    return value;
  }

  getLocation(seed: number): number {
    let value;

    value = this.convert(seed, this.seedToSoil);
    value = this.convert(value, this.soilToFertilizer);
    value = this.convert(value, this.fertilizerToWater);
    value = this.convert(value, this.waterToLight);
    value = this.convert(value, this.lightToTemperature);
    value = this.convert(value, this.temperatureToHumidity);
    value = this.convert(value, this.humidityToLocation);

    return value;
  }

  expectToStartWith(input: string, prefix: string) {
    if (!input.startsWith(prefix)) {
      throw `${prefix} expected`;
    }
  }

  expectEmptyLine(input: string) {
    if (input.trim() !== "") {
      throw "Expect empty line";
    }
  }

  parseNumbers(input: string): number[] {
    return input
      .trim()
      .split(" ")
      .map((v) => +v);
  }

  parseConverter(input: string[], index: number, name: string, converters: IConverter[]): number {
    this.expectToStartWith(input[index++], `${name} map:`);
    while (index < input.length) {
      const line = input[index++].trim();
      if (line.length === 0) {
        break;
      }
      const numbers = this.parseNumbers(line);
      converters.push(new Converter(numbers));
    }

    converters.sort((a, b) => a.start - b.start);
    if (converters[0].start !== 0) {
      converters.unshift(new IdentityConverter(0, converters[0].start - 1));
    }
    const len = converters.length;
    for (let i = 0; i < len; i++) {
      const c1 = converters[i];
      const c2 = i + 1 < len ? converters[i + 1] : undefined;
      if (c2 === undefined) {
        if (c1.end <= Number.MAX_SAFE_INTEGER) {
          converters.push(new IdentityConverter(c1.end + 1, Number.MAX_SAFE_INTEGER));
        }
        break;
      }
      if (c2.start !== c1.end + 1) {
        converters.push(new IdentityConverter(c1.end + 1, c2.start - 1));
      }
    }

    // re-sort
    converters.sort((a, b) => a.start - b.start);

    return index;
  }

  parseSeeds(input: string[], index: number): number {
    this.expectToStartWith(input[index], "seeds: ");
    this.expectEmptyLine(input[index + 1]);

    this.seeds = this.parseNumbers(input[index].substring(7));
    return index + 2;
  }

  parse(input: string[]) {
    let index = this.parseSeeds(input, 0);
    index = this.parseConverter(input, index, "seed-to-soil", this.seedToSoil);
    index = this.parseConverter(input, index, "soil-to-fertilizer", this.soilToFertilizer);
    index = this.parseConverter(input, index, "fertilizer-to-water", this.fertilizerToWater);
    index = this.parseConverter(input, index, "water-to-light", this.waterToLight);
    index = this.parseConverter(input, index, "light-to-temperature", this.lightToTemperature);
    index = this.parseConverter(input, index, "temperature-to-humidity", this.temperatureToHumidity);
    index = this.parseConverter(input, index, "humidity-to-location", this.humidityToLocation);
  }
}

export class Day5 extends Day {
  constructor() {
    super(5);
  }

  loadInput(): Input {
    const lines = this.readDataFile();
    const input = new Input();
    input.parse(lines);
    return input;
  }

  getConverter(start: number, converters: IConverter[]): IConverter {
    for (const converter of converters) {
      if (converter.canConvert(start)) {
        return converter;
      }
    }

    throw "No converter found";
  }

  part1(input: Input): number {
    const locations = input.seeds.map((seed) => input.getLocation(seed));

    locations.sort((a, b) => a - b);

    return locations[0];
  }

  convertRange(ranges: Range[], converters: IConverter[]): Range[] {
    const result: Range[] = [];
    for (const range of ranges) {
      for (let start = range.start; start <= range.end; ) {
        const converter = this.getConverter(start, converters);
        const e = Math.min(converter.end, range.end);
        const newStart = converter.convert(start);
        const newEnd = converter.convert(e);
        result.push({ start: newStart, end: newEnd });
        start = e + 1;
      }
    }

    result.sort((a, b) => a.start - b.start);
    return result;
  }

  part2(input: Input): number {
    const seedRanges = input.seeds.reduce((a: Range[], v: number, i: number) => {
      if (i % 2 === 0) {
        a.push({ start: v, end: v });
      } else {
        const r = a[a.length - 1];
        r.end = r.start + v;
      }
      return a;
    }, []);

    const soilRanges = this.convertRange(seedRanges, input.seedToSoil);
    const fertilizerRanges = this.convertRange(soilRanges, input.soilToFertilizer);
    const waterRanges = this.convertRange(fertilizerRanges, input.fertilizerToWater);
    const lightRanges = this.convertRange(waterRanges, input.waterToLight);
    const temperatureRanges = this.convertRange(lightRanges, input.lightToTemperature);
    const humidityRanges = this.convertRange(temperatureRanges, input.temperatureToHumidity);
    const locationRanges = this.convertRange(humidityRanges, input.humidityToLocation);

    return locationRanges[0].start;
  }
}

// new Day5().execute();
