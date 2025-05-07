import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Screening } from '../types/Screening';
import '../css/ReservationPage.css';

const ReservationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = useUser();
  const screening: Screening | undefined = location.state?.screening;

  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  useEffect(() => {
    if (!screening) navigate('/screenings');
  }, [screening, navigate]);

  if (!screening) return null;

  const raw = (screening.availableSeats as any);
  const seatsArray: boolean[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.boolean)
      ? raw.boolean
      : [];

  const handleSeatClick = (index: number) => {
    if (!seatsArray[index]) return; // niedostępne
    setSelectedSeats(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleReserve = async () => {
    if (!username) {
      navigate('/login');
      return;
    }

    const screeningId = screening.screeningID;
    const accountUsername = username;
    const seats = selectedSeats;
    console.log("Reservation: " + "screening: " + screeningId);
    const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:tem="http://tempuri.org/">
      <soapenv:Header/>
      <soapenv:Body>
        <tem:MakeReservation>
          <tem:screeningId>${screeningId}</tem:screeningId>
          <tem:customerName>${accountUsername}</tem:customerName>
          <tem:reservedSeats>
            ${seats.map(i => `<int xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays">${i}</int>`).join('')}
          </tem:reservedSeats>
        </tem:MakeReservation>
      </soapenv:Body>
    </soapenv:Envelope>`.trim();

    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      console.log("URL: " + baseUrl);
      const response = await fetch(`${baseUrl}/ReservationService`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IReservationService/MakeReservation'
        },
        body: soapEnvelope
      });

      if (!response.ok) {
        console.log('O:', screeningId);
        throw new Error(`SOAP fault: ${response.statusText}`);
      }

      const text = await response.text();
      console.log('Odpowiedź SOAP:', text);
      alert('Rezerwacja przebiegła pomyślnie.');
      navigate('/screenings');
    } catch (err) {
      console.error(err);
      alert('Błąd przy wysyłce rezerwacji.');
    }
  };

  return (
    <div className="reservation-page">
      <h1>Wybierz miejsca</h1>
      <div className="seats-container">
        {seatsArray.map((isAvailable, index) => (
          <button
            key={index}
            className={[
              'seat',
              isAvailable ? 'available' : 'unavailable',
              selectedSeats.includes(index) ? 'selected' : ''
            ].join(' ')}
            onClick={() => handleSeatClick(index)}
            disabled={!isAvailable}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <button
        className="reserve-button"
        onClick={handleReserve}
        disabled={selectedSeats.length === 0}
      >
        Zarezerwuj ({selectedSeats.length})
      </button>
    </div>
  );
};

export default ReservationPage;
