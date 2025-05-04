import React, { useEffect, useState } from 'react';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Screening } from '../types/Screening';
import { Movie } from '../types/Movie';
import '../css/ScreeningsPage.css';

const ScreeningsPage: React.FC = () => {
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
        console.log('Zaktualizowane wyświetlenia:', screenings);
      }, [screenings]);

  useEffect(() => {
    const fetchData = async () => {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        removeNSPrefix: true,
      });

      try {
        const [screeningsRes, moviesRes] = await Promise.all([
          axios.post('http://localhost:8080/DatabaseService', `
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
          axios.post('http://localhost:8080/DatabaseService', `
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

        // Parse both responses
        const screeningsJson = parser.parse(screeningsRes.data);
        const moviesJson = parser.parse(moviesRes.data);

        const screeningsRaw = screeningsJson['Envelope']['Body']['GetScreeningsResponse']['GetScreeningsResult']['Screening'];
        const screeningsData = Array.isArray(screeningsRaw) ? screeningsRaw : [screeningsRaw];
        const screeningsArray: Screening[] = screeningsData.map((s: any) => ({
          screeningID: parseInt(s.ScreeningID),
          movieID: parseInt(s.MovieID),
          startTime: s.StartTime,
          endTime: s.EndTime,
          availableSeats: [], // you can parse if included
        }));

        const moviesRaw = moviesJson['Envelope']['Body']['GetMoviesResponse']['GetMoviesResult']['Movie'];
        const moviesData = Array.isArray(moviesRaw) ? moviesRaw : [moviesRaw];
        const moviesArray: Movie[] = moviesData.map((m: any) => ({
          movieID: parseInt(m.MovieID),
          title: m.Title,
          director: m.Director,
          description: m.Description,
          poster: typeof m.Poster === 'string' ? m.Poster : undefined,
          actors: Array.isArray(m.Actors?.string)
            ? m.Actors.string
            : m.Actors?.string
              ? [m.Actors.string]
              : [],
        }));

        setScreenings(screeningsArray);
        setMovies(moviesArray);
      } catch (err: any) {
        setError('Błąd pobierania danych: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Ładowanie seansów…</p>;
  if (error) return <p className="error">{error}</p>;

  const getMovieById = (id: number) => movies.find((m) => m.movieID === id);

  return (
    <div className="screenings-page">
      <h1>Lista seansów</h1>
      <div className="screening-list">
        {screenings.map((s) => {
          const movie = getMovieById(s.movieID);
          return (
            <div key={s.screeningID} className="screening-item">
              <img
                src={movie?.poster || 'https://via.placeholder.com/150'}
                alt={movie?.title || 'Plakat'}
                className="poster-img"
              />
              <div className="screening-info">
                <h2>{movie?.title || 'Nieznany film'}</h2>
                <p><strong>Start:</strong> {s.startTime}</p>
                <p><strong>Koniec:</strong> {s.endTime}</p>
                <button onClick={() => navigate(`/screening/${s.screeningID}`)}>Zobacz szczegóły</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScreeningsPage;
