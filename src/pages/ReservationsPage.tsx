import React, { useEffect, useState } from 'react';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Reservation } from '../types/Reservation';
import { Screening } from '../types/Screening';
import { Movie } from '../types/Movie';
import '../css/ReservationsPage.css';
import jsPDF from 'jspdf';

const ReservationsPage: React.FC = () => {
  const { username } = useUser();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      navigate('/login');
      return;
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      removeNSPrefix: true,
    });

    const fetchData = async () => {
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        console.log("URL: " + baseUrl);
        const [reservationsRes, screeningsRes, moviesRes] = await Promise.all([
          axios.post(`${baseUrl}/DatabaseService`, `
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                           xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                           xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
              <soap:Body>
                <GetReservations xmlns="http://tempuri.org/" />
              </soap:Body>
            </soap:Envelope>`, {
            headers: {
              'Content-Type': 'text/xml;charset=UTF-8',
              'SOAPAction': 'http://tempuri.org/IDatabaseService/GetReservations',
            },
          }),
          axios.post(`${baseUrl}/DatabaseService`, `
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                           xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                           xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
              <soap:Body>
                <GetScreenings xmlns="http://tempuri.org/" />
              </soap:Body>
            </soap:Envelope>`, {
            headers: {
              'Content-Type': 'text/xml;charset=UTF-8',
              'SOAPAction': 'http://tempuri.org/IDatabaseService/GetScreenings',
            },
          }),
          axios.post(`${baseUrl}/DatabaseService`, `
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                           xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                           xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
              <soap:Body>
                <GetMovies xmlns="http://tempuri.org/" />
              </soap:Body>
            </soap:Envelope>`, {
            headers: {
              'Content-Type': 'text/xml;charset=UTF-8',
              'SOAPAction': 'http://tempuri.org/IDatabaseService/GetMovies',
            },
          }),
        ]);

        // Parsowanie danych
        const reservationsJson = parser.parse(reservationsRes.data);
        const screeningsJson = parser.parse(screeningsRes.data);
        const moviesJson = parser.parse(moviesRes.data);

        const rawReservations = reservationsJson.Envelope.Body.GetReservationsResponse.GetReservationsResult.Reservation;
        const rawScreenings = screeningsJson.Envelope.Body.GetScreeningsResponse.GetScreeningsResult.Screening;
        const rawMovies = moviesJson.Envelope.Body.GetMoviesResponse.GetMoviesResult.Movie;

        const reservationArray: Reservation[] = (Array.isArray(rawReservations) ? rawReservations : [rawReservations]).map((r: any) => ({
          reservationId: parseInt(r.ReservationId),
          screeningId: parseInt(r.ScreeningId),
          username: r.AccountUsername ?? '',
          seats: Array.isArray(r.ReservedSeats?.int)
            ? r.ReservedSeats.int
            : r.ReservedSeats?.int
              ? [r.ReservedSeats.int]
              : [],
        }));

        const screeningsArray: Screening[] = (Array.isArray(rawScreenings) ? rawScreenings : [rawScreenings]).map((s: any) => ({
          screeningID: parseInt(s.ScreeningID),
          movieID: parseInt(s.MovieID),
          startTime: s.StartTime,
          endTime: s.EndTime,
          availableSeats: s.AvailableSeats,
        }));

        const moviesData = Array.isArray(rawMovies) ? rawMovies : [rawMovies];
        const moviesArray: Movie[] = moviesData.map((m: any) => {
          console.log(`Raw Poster for movieID=${m.MovieID}:`, m.Poster);

          let posterBytes: Uint8Array | undefined;
          if (m.Poster) {
            const b64 = typeof m.Poster === 'string' ? m.Poster : m.Poster[0];
            const binStr = window.atob(b64);
            posterBytes = new Uint8Array(binStr.length);
            for (let i = 0; i < binStr.length; i++) {
              posterBytes[i] = binStr.charCodeAt(i);
            }
            console.log(`Decoded Poster bytes for movieID=${m.MovieID}:`, posterBytes);
          }

          const actors = Array.isArray(m.Actors?.string)
            ? m.Actors.string
            : m.Actors?.string
              ? [m.Actors.string]
              : [];

          return {
            movieID: Number(m.MovieID),
            title: m.Title,
            director: m.Director,
            description: m.Description,
            poster: posterBytes,
            actors,
          };
        });
        setReservations(reservationArray.filter(r => r.username === username));
        setScreenings(screeningsArray);
        setMovies(moviesArray);
      } catch (err: any) {
        setError('Błąd pobierania danych: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, navigate]);

  const convertToBase64 = (poster?: Uint8Array) => {
    console.log("C: ", poster);
    if (!poster) {
      return 'https://via.placeholder.com/150';
    }
    let binary = '';
    for (let i = 0; i < poster.length; i++) {
      binary += String.fromCharCode(poster[i]);
    }
    console.log("B: ", binary);
    return `data:image/jpeg;base64,${window.btoa(binary)}`;
  };

  const getScreeningById = (id: number) => screenings.find(s => s.screeningID === id);
  const getMovieById = (id: number) => movies.find(m => m.movieID === id);

  const handleDelete = async (reservationId: number) => {
    try {
      const soapRequest = `
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                       xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                       xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <CancelReservation xmlns="http://tempuri.org/">
              <reservationId>${reservationId}</reservationId>
            </CancelReservation>
          </soap:Body>
        </soap:Envelope>`;
        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        console.log("URL: " + baseUrl);
      await axios.post(`${baseUrl}/ReservationService`, soapRequest, {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': 'http://tempuri.org/IReservationService/CancelReservation',
        },
      });

      setReservations(prev => prev.filter(r => r.reservationId !== reservationId));
    } catch (err: any) {
      console.error('Błąd usuwania rezerwacji:', err.message);
      alert('Nie udało się usunąć rezerwacji.');
    }
  };

  const handlePrint = async (reservationId: number) => {
    const reservation = reservations.find(r => r.reservationId === reservationId);
    if (!reservation) return;

    const screening = getScreeningById(reservation.screeningId);
    const movie = screening ? getMovieById(screening.movieID) : undefined;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Cinema Ticket', 20, 20);

    doc.setFontSize(12);
    doc.text(`Reservation ID: ${reservation.reservationId}`, 20, 40);
    doc.text(`Movie: ${movie?.title ?? 'Unknown'}`, 20, 50);
    doc.text(`Date: ${new Date(screening?.startTime ?? '').toLocaleDateString('pl-PL')}`, 20, 60);
    doc.text(`Time: ${new Date(screening?.startTime ?? '').toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`, 20, 70);
    doc.text(`Seats: ${reservation.seats?.map(i => i + 1).join(', ')}`, 20, 80);
    doc.text(`Username: ${reservation.username}`, 20, 90);

    doc.save(`ticket-${reservation.reservationId}.pdf`);
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="reservations-page">
      <h1>Your reservations</h1>
      <div className="reservation-list">
        {reservations.map(res => {
          const screening = getScreeningById(res.screeningId);
          const movie = screening ? getMovieById(screening.movieID) : undefined;
          console.log("Check: " + screening?.screeningID + screening?.availableSeats);
          return (
            <div key={res.reservationId} className="reservation-item">
              <img
                src={convertToBase64(movie?.poster)}  // Konwersja poster do base64
                alt={movie?.title || 'Poster'}
                className="poster-img"
              />
              <div className="reservation-info">
                <h2>{movie?.title || 'Unknown movie'}</h2>
                {screening?.startTime ? (
                  <>
                    <p><strong>Date:</strong> {new Date(screening.startTime).toLocaleDateString('pl-PL')}</p>
                    <p><strong>Start time:</strong> {new Date(screening.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</p>
                  </>
                ) : (
                  <p><strong>Start:</strong> No data</p>
                )}
                <p><strong>Seats:</strong> {res.seats ? res.seats.map(i => i + 1).join(', ') : 'Brak'}</p>
                <button onClick={() => handleDelete(res.reservationId)}>
                  Delete reservation
                </button>
                <button onClick={() => navigate('/edit-reservation', {
                  state: {
                    screening,
                    reservationId: res.reservationId,
                    reservedSeats: res.seats
                  }
                })}>
                  Edit reservation
                </button>
                <button onClick={() => handlePrint(res.reservationId)}>
                  Print reservation
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReservationsPage;
