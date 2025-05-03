import React, { useEffect, useState } from 'react';
import { Session } from '../types';
import { fetchSessions } from '../api/cinemaApi';
import BookingButton from './BookingButton';

interface Props {
  movieId: number;
}

const ScreeningsList: React.FC<Props> = ({ movieId }) => {
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetchSessions(movieId).then(setSessions);
  }, [movieId]);

  return (
    <div>
      <h3 className="text-lg font-semibold">Seanse</h3>
      <ul className="space-y-2 mt-2">
        {sessions.map(session => (
          <li key={session.id}>
            {session.time} – {session.availableSeats} miejsc
            <BookingButton sessionId={session.id} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScreeningsList;
