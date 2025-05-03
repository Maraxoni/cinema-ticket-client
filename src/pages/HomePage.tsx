import React from "react";
import "../css/HomePage.css";

const HomePage: React.FC = () => (
  <div className="home-container">
    <h1 className="title">Witamy w systemie rezerwacji biletów</h1>

    <section className="section">
      <h2>📌 Wymagania projektu</h2>
      <ul>
        <li>Możliwość przeglądania listy filmów oraz szczegółów seansów</li>
        <li>Rejestracja i logowanie użytkowników</li>
        <li>Rezerwacja miejsc na seans</li>
        <li>Podgląd własnych rezerwacji</li>
        <li>Panel administratora do zarządzania filmami i seansami</li>
        <li>Komunikacja z serwerem przez Web API (WCF lub REST)</li>
        <li>Zapis danych w lokalnych bazach JSON na serwerze</li>
      </ul>
    </section>

    <section className="section">
      <h2>👥 Made by:</h2>
      <ul>
        <li>Mateusz Zaczeniuk</li>
      </ul>
    </section>
  </div>
);

export default HomePage;
