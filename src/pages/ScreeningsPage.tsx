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
    const fetchData = async () => {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '',
        removeNSPrefix: true,
      });

      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL;
        console.log("URL: " + baseUrl);
        const [screeningsRes, moviesRes] = await Promise.all([
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
          availableSeats: s.AvailableSeats,
        }));

        const moviesRaw = moviesJson['Envelope']['Body']['GetMoviesResponse']['GetMoviesResult']['Movie'];
        const moviesData = Array.isArray(moviesRaw) ? moviesRaw : [moviesRaw];
        const moviesArray: Movie[] = moviesData.map((m: any) => {
          // Log surowej zawartości pola Poster
          console.log(`Raw Poster for movieID=${m.MovieID}:`, m.Poster);

          let posterBytes: Uint8Array | undefined;
          if (m.Poster) {
            const b64 = typeof m.Poster === 'string' ? m.Poster : m.Poster[0];
            const binStr = window.atob(b64);
            posterBytes = new Uint8Array(binStr.length);
            for (let i = 0; i < binStr.length; i++) {
              posterBytes[i] = binStr.charCodeAt(i);
            }
            // Log decoded bytes
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


        setScreenings(screeningsArray);
        setMovies(moviesArray);
        console.log('Movies RAW:', moviesArray);
      } catch (err: any) {
        setError('Błąd pobierania danych: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) return <p>Ładowanie seansów…</p>;
  if (error) return <p className="error">{error}</p>;

  const getMovieById = (id: number) => movies.find((m) => m.movieID === id);

  return (
    <div className="screenings-page">
      <h1>Lista seansów</h1>
      <div className="screening-list">
        {screenings.map((s) => {
          const movie = getMovieById(s.movieID);
          if (!movie) {
            console.warn(`Nie znaleziono filmu o movieID=${s.movieID}`);
          }
          return (
            <div key={s.screeningID} className="screening-item">
              <img
                src={convertToBase64(movie?.poster)}  // Konwersja poster do base64
                alt={movie?.title || 'Plakat'}  // Alternatywny tekst, jeśli nie ma plakatu
                className="poster-img"
              />
              <div className="screening-info">
                <h2>{movie?.title || 'Nieznany film'}</h2>
                {s?.startTime ? (
                  <>
                    <p><strong>Data:</strong> {new Date(s.startTime).toLocaleDateString('pl-PL')}</p>
                    <p><strong>Godzina rozpoczęcia:</strong> {new Date(s.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</p>
                  </>
                ) : (
                  <p><strong>Start:</strong> Brak danych</p>
                )}
                {s?.endTime ? (
                  <>
                    <p><strong>Godzina zakończenia:</strong> {new Date(s.endTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</p>
                  </>
                ) : (
                  <p><strong>Start:</strong> Brak danych</p>
                )}
                <button onClick={() => navigate('/reservation', { state: { screening: s } })}>
                  Zarezerwuj miejsca
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScreeningsPage;
