import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Screening } from '../types/Screening';
import '../css/ReservationPage.css';

const ReservationEditPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username } = useUser();

  const screening: Screening | undefined = location.state?.screening;
  const reservationId: number | undefined = location.state?.reservationId;
  const reservedSeats: number[] = location.state?.reservedSeats || [];
  console.log("Location:" + location.state);
  console.log("Screening:" + screening);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  useEffect(() => {
    if (!screening || reservationId === undefined) {
      navigate('/reservations');
    } else {
      setSelectedSeats(reservedSeats);
    }
  }, [screening, reservationId, reservedSeats, navigate]);

  if (!screening || reservationId === undefined) return null;

  const raw = screening.availableSeats as any;
  const seatsArray: boolean[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.boolean)
      ? raw.boolean
      : [];
      console.log("Seats array:", raw);

  const handleSeatClick = (index: number) => {
    const isAvailable = seatsArray[index];
    const isPreviouslyReserved = reservedSeats.includes(index);

    if (!isAvailable && !isPreviouslyReserved) return;

    setSelectedSeats(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleEdit = async () => {
    if (!username) {
      navigate('/login');
      return;
    }

    const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                      xmlns:tem="http://tempuri.org/">
      <soapenv:Header/>
      <soapenv:Body>
        <tem:EditReservation>
          <tem:reservationId>${reservationId}</tem:reservationId>
          <tem:screeningId>${screening.screeningID}</tem:screeningId>
          <tem:customerName>${username}</tem:customerName>
          <tem:reservedSeats>
            ${selectedSeats.map(i => `<int xmlns="http://schemas.microsoft.com/2003/10/Serialization/Arrays">${i}</int>`).join('')}
          </tem:reservedSeats>
        </tem:EditReservation>
      </soapenv:Body>
    </soapenv:Envelope>`.trim();

    try {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
       console.log("URL: " + baseUrl);
      const response = await fetch(`${baseUrl}/ReservationService`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://tempuri.org/IReservationService/EditReservation'
        },
        body: soapEnvelope
      });

      if (!response.ok) throw new Error(`SOAP fault: ${response.statusText}`);

      const text = await response.text();
      console.log('SOAP Response:', text);
      alert('Reservation was updated.');
      navigate('/reservations');
    } catch (err) {
      console.error(err);
      alert('Error occured during reservation.');
    }
  };

  return (
    <div className="reservation-page">
      <h1>Edit reservation</h1>
      <div className="seats-container">
        {seatsArray.map((isAvailable, index) => {
          console.log("A: " + seatsArray);
          const isPreviouslyReserved = reservedSeats.includes(index);
          const isSelectable = isAvailable || isPreviouslyReserved;

          return (
            <button
              key={index}
              className={[
                'seat',
                isAvailable ? 'available' : isPreviouslyReserved ? 'reserved-by-user' : 'unavailable',
                selectedSeats.includes(index) ? 'selected' : ''
              ].join(' ')}
              onClick={() => handleSeatClick(index)}
              disabled={!isSelectable}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
      <button
        className="reserve-button"
        onClick={handleEdit}
        disabled={selectedSeats.length === 0}
      >
        Save changes ({selectedSeats.length})
      </button>
    </div>
  );
};

export default ReservationEditPage;
