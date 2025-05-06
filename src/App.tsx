import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import MoviesPage from './pages/MoviesPage';
import HomePage from './pages/HomePage';
import ScreeningsPage from './pages/ScreeningsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Navbar from './components/Navbar';
import ReservationsPage from './pages/ReservationsPage';
import ReservationPage from './pages/ReservationPage';
import ReservationEditPage from './pages/ReservationEditPage';

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MoviesPage />} />
            <Route path="/screenings" element={<ScreeningsPage />} />
            <Route path="/reservation" element={<ReservationPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/edit-reservation" element={<ReservationEditPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Routes>
        </main>
      </Router>
    </UserProvider>
  );
};

export default App;
