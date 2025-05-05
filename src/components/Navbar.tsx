import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../css/Navbar.css';

const Navbar: React.FC = () => {
  const { username, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="spacer" />
      <div className="links">
        <Link to="/">Home Page</Link>
        <Link to="/movies">Movies List</Link>
        <Link to="/screenings">Screenings List</Link>
        <Link to="/reservations">Reservations</Link>
      </div>

      <div className="login">
        {username ? (
          <>
            <span>Welcome, {username}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
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
