import { Day } from "./tools/day.ts";

type Hand = {
  cards: string;
  bid: number;
  rank1: number;
  rank2: number;
};

const CARD_VALUES = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
  "9": 9,
  "8": 8,
  "7": 7,
  "6": 6,
  "5": 5,
  "4": 4,
  "3": 3,
  "2": 2,
  a: 14,
  k: 13,
  q: 12,
  j: 1,
  t: 10,
};

export class Day7 extends Day {
  constructor() {
    super(7);
  }

  getRanks(cards: string): number[] {
    const counts = cards.split("").reduce(
      (a, c) => {
        a[c] = (a[c] || 0) + (c === "J" ? -1 : 1);
        return a;
      },
      { A: 0, K: 0, Q: 0, J: 0, T: 0, "9": 0, "8": 0, "7": 0, "6": 0, "5": 0, "4": 0, "3": 0, "2": 0 }
    );

    const groups = Object.values(counts).filter((v) => v);

    groups.sort((a, b) => Math.abs(b) - Math.abs(a));

    let rank1: number;

    switch (Math.abs(groups[0])) {
      case 5:
        rank1 = 6;
        break;
      case 4:
        rank1 = 5;
        break;
      case 3:
        rank1 = Math.abs(groups[1]) === 2 ? 4 : 3;
        break;
      case 2:
        rank1 = Math.abs(groups[1]) === 2 ? 2 : 1;
        break;
      default:
        rank1 = 0;
        break;
    }

    let rank2: number = rank1;

    if (counts.J && rank1 < 6) {
      groups.sort((a, b) => b - a);

      switch (groups[0]) {
        case -5:
        case 5:
          rank2 = 6;
          break;
        case 4:
          rank2 = 6;
          break;
        case 3:
          rank2 = 4 - counts.J;
          break;
        case 2:
          if (groups[1] === 2) {
            rank2 = 4;
          } else {
            rank2 = counts.J === -3 ? 6 : counts.J === -2 ? 5 : 3;
          }
          break;
        default:
          switch (counts.J) {
            case -5:
              rank2 = 6;
              break;
            case -4:
              rank2 = 6;
              break;
            case -3:
              rank2 = 5;
              break;
            case -2:
              rank2 = 3;
              break;
            case -1:
              rank2 = 1;
              break;
            default:
              throw "Error";
          }
          break;
      }

      rank2 = Math.max(rank1, rank2);
    }

    for (const c of cards) {
      rank1 = rank1 * 16 + CARD_VALUES[c];
      rank2 = rank2 * 16 + CARD_VALUES[c.toLowerCase()];
    }

    return [rank1, rank2];
  }

  loadInput(): Hand[] {
    return this.readDataFile().map((line) => {
      const [cards, bid] = line.split(" ");
      const [rank1, rank2] = this.getRanks(cards);
      return { cards, bid: +bid, rank1, rank2 };
    });
  }

  part1(input: Hand[]): number {
    const sorted = input.sort((a, b) => a.rank1 - b.rank1);
    const answer = sorted.reduce((a: number, h: Hand, i: number) => a + h.bid * (i + 1), 0);

    return answer;
  }

  part2(input: Hand[]): number {
    const sorted = input.sort((a, b) => a.rank2 - b.rank2);
    const answer = sorted.reduce((a: number, h: Hand, i: number) => a + h.bid * (i + 1), 0);

    return answer;
  }
}

// new Day7().execute();
