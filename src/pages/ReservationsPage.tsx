import React, { useEffect, useState } from 'react';
import '../css/styles.css';
import { Reservation } from '../types/Reservation';


interface Props {
  username: string;
}

const ReservationList: React.FC<Props> = ({ username }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/reservations/${username}`)
      .then(res => res.json())
      .then(data => setReservations(data));
  }, [username]);

  return (
    <div className="container">
      <h2>Twoje Rezerwacje</h2>
      <ul>
        {reservations.map(r => (
          <li key={r.reservationId}>Seans ID: {r.screeningId}</li>
        ))}
      </ul>
    </div>
  );
};

export default ReservationList;
