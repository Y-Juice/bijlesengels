import React from 'react';
import '../styles/Home.css';
import poster from '../assets/poster.jpeg';

function Home() {
  return (
    <div className="Home">
      <section className="Hero">
        <div className="Hero__text">
          <h1 className="Hero__title">Bijlessen Engels</h1>
          <p className="Hero__subtitle">Voor leerlingen 1ste tot en met 3de secundair</p>
          <ul className="Hero__bullets">
            <li>Volledig online via Zoom</li>
            <li>Flexibele uren tijdens schoolvakanties</li>
            <li>1 uur (€17) of 2 uur (€30)</li>
          </ul>
          <div className="Hero__cta">
            <a className="btn btn-primary" href="#/register">Inschrijven</a>
          </div>
        </div>
        <div className="Hero__art">
          <img src={poster} alt="Poster" />
        </div>
      </section>

      <section className="Info">
        <div className="Info__card">
          <h3>Wie ik ben</h3>
          <p>STUDENT Leerkracht secundair onderwijs @ Erasmushogeschool Brussel</p>
        </div>
        <div className="Info__card">
          <h3>Contact</h3>
          <p>Website: www.bijlesengels.be</p>
          <p>WhatsApp: +32 483 99 67 69</p>
        </div>
        <div className="Info__card">
          <h3>Tarieven</h3>
          <p>1 uur — €17, 2 uur — €30</p>
          <p>Maximaal 2 uur per dag per leerling</p>
        </div>
      </section>
    </div>
  );
}

export default Home;


