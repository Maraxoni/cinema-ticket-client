import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Poprawiony import
import '../css/Navbar.css';

const Navbar: React.FC = () => {
  const { username, logout } = useUser(); // Użycie useUser, żeby uzyskać dane użytkownika
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Wywołanie funkcji logout, która usuwa użytkownika z localStorage i stanu
    navigate('/'); // Przekierowanie na stronę główną po wylogowaniu
  };

  return (
    <nav className="navbar">
      <div className="links">
        <Link to="/">Home Page</Link>
        <Link to="/movies">Movies List</Link>
        <Link to="/screenings">Screenings List</Link>
        <Link to="/reservations">Reservations</Link>
      </div>

      <div className="login">
        {username ? (
          <>
            <span>Welcome, {username}</span> {/* Wyświetlanie nazwy użytkownika */}
            <button onClick={handleLogout} className="logout-btn">Logout</button> {/* Przycisk do wylogowania */}
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
