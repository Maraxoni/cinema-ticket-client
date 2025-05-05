export interface Reservation {
  reservationId: number;
  screeningId: number;
  username: string;
  seats?: number[];
}