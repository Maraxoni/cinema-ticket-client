// src/pages/ReservationsPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ReservationsPage: React.FC = () => {
  const { username } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!username) {
      navigate('/Login');
    }
  }, [username, navigate]);

  if (!username) return null; // Zapobiega wyświetleniu zawartości podczas przekierowania

  return (
    <div className="reservations-page">
      <h1>Twoje rezerwacje</h1>
      <p>Witaj, {username}! Tutaj będą wyświetlane Twoje rezerwacje.</p>
    </div>
  );
};

export default ReservationsPage;
