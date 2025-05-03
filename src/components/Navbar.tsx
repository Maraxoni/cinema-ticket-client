import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css'; 
const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="links">
        <Link to="/">Home Page</Link>
        <Link to="/movies">Movies List</Link>
        <Link to="/screenigs">Screenings List</Link>
        <Link to="/reservations">Reservations</Link>
      </div>

      <div className="login">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
    </nav>
  );
};

export default Navbar;
