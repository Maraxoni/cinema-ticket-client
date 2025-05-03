export interface User {
    id: number;
    name: string;
  }
  
  export interface Movie {
    id: number;
    title: string;
    description: string;
  }
  
  export interface Session {
    id: number;
    movieId: number;
    time: string;
    availableSeats: number;
  }

  export {};