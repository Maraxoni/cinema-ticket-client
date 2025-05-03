import React, { useEffect, useState } from 'react';
import { Movie } from '../types';
import { fetchMovies } from '../api/cinemaApi';
import SessionList from './ScreeningsList';

const MoviesList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);


  return (
    <div>
    

    
    </div>
  );
};

export default MoviesList;
