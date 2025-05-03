import React from 'react';
import { bookTicket } from '../api/cinemaApi';

interface Props {
  sessionId: number;
}

const userId = 1; // zakładamy zalogowanego użytkownika

const BookingButton: React.FC<Props> = ({ sessionId }) => {
  const handleBooking = async () => {
    try {
      await bookTicket(sessionId, userId);
      alert('Rezerwacja udana!');
    } catch (error) {
      alert('Błąd podczas rezerwacji.');
    }
  };

  return (
    <button
      onClick={handleBooking}
      className="ml-4 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
    >
      Rezerwuj
    </button>
  );
};

export default BookingButton;
