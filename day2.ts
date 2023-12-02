import { Day } from "./tools/day.ts";

type GameData = {
  red: number;
  green: number;
  blue: number;
};

type Game = {
  id: number;
  data: GameData[];
};

export class Day2 extends Day {
  constructor() {
    super(2);
  }

  loadInput(): Game[] {
    const games: Game[] = [];

    for (const line of this.readDataFile()) {
      const [gameId, datas] = line.split(": ");
      const game: Game = { id: +gameId.slice(5), data: [] };
      for (const data of datas.split("; ")) {
        const gameData: GameData = { red: 0, green: 0, blue: 0 };
        for (const entry of data.split(", ")) {
          const [count, color] = entry.split(" ");
          gameData[color] = +count;
        }
        game.data.push(gameData);
      }
      games.push(game);
    }

    return games;
  }

  part1(games: Game[]): number {
    const answer = games
      .filter((game) => !game.data.some((data) => data.red > 12 || data.green > 13 || data.blue > 14))
      .reduce((sum: number, game: Game) => sum + game.id, 0);
    return answer;
  }

  part2(games: Game[]): number {
    const maxData = games.map((game: Game): GameData => {
      const data = game.data.reduce(
        (max: GameData, data: GameData) => {
          max.red = Math.max(max.red, data.red);
          max.green = Math.max(max.green, data.green);
          max.blue = Math.max(max.blue, data.blue);
          return max;
        },
        { red: 0, green: 0, blue: 0 }
      );
      return data;
    });

    const answer = maxData.reduce((sum: number, data: GameData) => sum + data.red * data.green * data.blue, 0);
    return answer;
  }
}

// new Day2().execute();
