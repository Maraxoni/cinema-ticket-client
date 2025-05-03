import { Movie, Session, User } from '../types';

const API_BASE = 'https://example.com/api';

export const fetchMovies = async (): Promise<Movie[]> => {
  const res = await fetch(`${API_BASE}/movies`);
  return res.json();
};

export const fetchSessions = async (movieId: number): Promise<Session[]> => {
  const res = await fetch(`${API_BASE}/movies/${movieId}/sessions`);
  return res.json();
};

export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch(`${API_BASE}/users`);
  return res.json();
};

export const bookTicket = async (sessionId: number, userId: number): Promise<void> => {
  await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, userId })
  });
};
