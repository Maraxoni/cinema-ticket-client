// src/components/MoviesPage.tsx
import React, { useEffect, useState } from 'react';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import { Movie } from '../types/Movie';
import '../css/MoviesPage.css';

const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Zaktualizowane filmy:', movies);
  }, [movies]);

  useEffect(() => {
    const fetchMovies = async () => {
      const baseUrl = process.env.REACT_APP_API_BASE_URL;
      console.log("URL: " + baseUrl);
      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetMovies xmlns="http://tempuri.org/" />
        </soap:Body>
      </soap:Envelope>`;
      try {
        const response = await axios.post(`${baseUrl}/DatabaseService`, soapRequest, {
          headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': 'http://tempuri.org/IDatabaseService/GetMovies',
          },
        });

        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '',
          removeNSPrefix: true
        });

        const json = parser.parse(response.data);

        const moviesRaw = json['Envelope']['Body']['GetMoviesResponse']['GetMoviesResult']['Movie'];
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

        setMovies(moviesArray);
      } catch (err: any) {
        setError(`Błąd pobierania filmów: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
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

  if (loading) return <p>Ładowanie filmów…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="movies-page">
      <h1>Lista filmów</h1>
      <div className="movie-list">
        {movies.map((m) => (
          <div key={m.movieID} className="movie-item">
            <div className="movie-poster">
              {/* Placeholder poster image */}
              <img
                src={convertToBase64(m?.poster)}  // Konwersja poster do base64
                alt={m?.title || 'Plakat'}  // Alternatywny tekst, jeśli nie ma plakatu
                className="poster-img"
              />
            </div>
            <div className="movie-info">
              <h2>{m.title}</h2>
              <p><strong>Reżyser:</strong> {m.director}</p>
              <p><strong>Opis:</strong> {m.description}</p>
              <p><strong>Aktorzy:</strong> {Array.isArray(m.actors) ? m.actors.toString() : m.actors}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

};

export default MoviesPage;
