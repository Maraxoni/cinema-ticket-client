export interface Screening {
    screeningID: number;
    movieID: number;
    startTime: string; // lub Date, zależnie od sposobu serializacji
    endTime: string;
    availableSeats: boolean[];
  }
  