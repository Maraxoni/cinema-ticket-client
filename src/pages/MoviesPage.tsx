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
      const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                     xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetMovies xmlns="http://tempuri.org/" />
        </soap:Body>
      </soap:Envelope>`;
      console.log('RAW response:', soapRequest);
      try {
        const response = await axios.post('http://localhost:8080/DatabaseService', soapRequest, {
          headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': 'http://tempuri.org/IDatabaseService/GetMovies',
          },
        });

        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '',
          removeNSPrefix: true // <— TO DODAĆ
        });

        const json = parser.parse(response.data);
        console.log(JSON.stringify(json, null, 2));

        const moviesRaw = json['Envelope']['Body']['GetMoviesResponse']['GetMoviesResult']['Movie'];
        const moviesData = Array.isArray(moviesRaw) ? moviesRaw : [moviesRaw];

        const moviesArray: Movie[] = moviesData.map((m: any) => ({
          movieID: m.MovieID,
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
        console.log(moviesArray);
        setMovies(moviesArray);
        //movies jest puste, mimo tego, że moviesArray nie jest puste
        console.log(movies);
      } catch (err: any) {
        setError(`Błąd pobierania filmów: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

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
                src={m.poster ? m.poster : 'https://via.placeholder.com/150'}
                alt={m.title}
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
