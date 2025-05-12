import React from "react";
import "../css/HomePage.css";

const HomePage: React.FC = () => (
  <div className="home-container">
    <h1 className="title">System rezerwacji biletów w kinie</h1>

    <section className="section">
      <h1>Wymagania funkcjonalne:</h1>
      <ol>
        <li>Wyświetlenie listy filmów (tytuł, dzień, godzina) z listą dostępnych miejsc,</li>
        <li>Możliwość rezerwacji konkretnego miejsca na wybrany film i godzinę
          (zwracane potwierdzenie zamówienia lub informacja o tym, że wskazane miejsce jest zajęte)
        </li>
        <li>Możliwość rezygnacji z rezerwacji</li>
        <li>Rezerwacja większej ilości miejsc za pomocą pojedynczej operacji</li>
        <li>Modyfikacja parametrów rezerwacji, np. zmiana miejsca,</li>
        <li>Odbiór potwierdzenia rezerwacji w formacie PDF</li>
        <li>Wyświetlenie dokonanych rezerwacji.</li>
      </ol>

      <h2>Informacja o filmie to dane o następującej postaci:</h2>
      <ul>
        <li>tytuł filmu,</li>
        <li>reżyser,</li>
        <li>lista aktorów,</li>
        <li>krótki opis,</li>
        <li>zdjęcie (należy zwrócić uwagę jak wykorzystać MTOM do transportu danych binarnych)</li>
      </ul>
    </section>

    <section className="section">
      <h2>Made by:</h2>
      <ul>
        <li>Mateusz Zaczeniuk</li>
      </ul>
    </section>
  </div>
);

export default HomePage;
