export interface Movie {
    movieID: number;
    title: string;
    director: string;
    actors: string[];
    description: string;
    poster?: Uint8Array;
  }
  