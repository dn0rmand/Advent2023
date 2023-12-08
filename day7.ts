import { Day } from "./tools/day.ts";

type Hand = {
  cards: string;
  bid: number;
  rank: number;
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

  getRank(cards: string, allowJoker: boolean): number {
    const counts = cards.split("").reduce(
      (a, c) => {
        a[c] = (a[c] || 0) + (c === "J" && allowJoker ? -1 : 1);
        return a;
      },
      { J: 0 }
    );

    const groups = Object.values(counts).filter((v) => {
      return v !== undefined;
    });
    groups.sort((a, b) => b - a);

    let rank: number;

    switch (Math.abs(groups[0])) {
      case 5:
        rank = 6;
        break;
      case 4:
        rank = 5;
        break;
      case 3:
        rank = Math.abs(groups[1]) === 2 ? 4 : 3;
        break;
      case 2:
        rank = Math.abs(groups[1]) === 2 ? 2 : 1;
        break;
      default:
        rank = 0;
        break;
    }

    if (allowJoker && counts.J) {
      let rank2: number;
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
      rank = Math.max(rank, rank2);
    }

    for (const c of cards) {
      rank = rank * 16 + (allowJoker ? CARD_VALUES[c.toLowerCase()] : CARD_VALUES[c]);
    }
    return rank;
  }

  loadInput(): Hand[] {
    return this.readDataFile().map((line) => {
      const [cards, bid] = line.split(" ");
      return { cards, bid: +bid, rank: 0 };
    });
  }

  part1(input: Hand[]): number {
    const sorted = input
      .map((a) => ({ cards: a.cards, bid: a.bid, rank: this.getRank(a.cards, false) }))
      .sort((a, b) => a.rank - b.rank);
    const answer = sorted.reduce((a: number, h: Hand, i: number) => a + h.bid * (i + 1), 0);

    return answer;
  }

  part2(input: Hand[]): number {
    const sorted = input
      .map((a) => ({ cards: a.cards, bid: a.bid, rank: this.getRank(a.cards, true) }))
      .sort((a, b) => a.rank - b.rank);
    const answer = sorted.reduce((a: number, h: Hand, i: number) => a + h.bid * (i + 1), 0);

    return answer;
  }
}

new Day7().execute();
