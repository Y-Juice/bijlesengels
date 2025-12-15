import React from 'react';
import '../styles/Home.css';
import introsection from '../assets/introsection.jpg';
import teaching from '../assets/teaching.jpg';
import whatsapp from '../assets/whatsapp.jpg';
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
          <img src={introsection} alt="Bijlessen Engels introductie" />
        </div>
      </section>

      <section className="InfoHero InfoHero--about">
        <div className="InfoHero__content">
          <div className="InfoHero__text">
            <h2 className="InfoHero__title">Wie ik ben</h2>
            <p className="InfoHero__description">
              Ik ben een student Leerkracht secundair onderwijs aan de Erasmushogeschool Brussel. 
              Met passie voor het Engels en ervaring in het onderwijs, help ik leerlingen om hun 
              Engelse vaardigheden te verbeteren en zelfvertrouwen op te bouwen.
            </p>
            <p className="InfoHero__description">
              Mijn aanpak is persoonlijk en aangepast aan de behoeften van elke leerling. 
              Ik geloof dat leren leuk moet zijn en dat iedereen Engels kan leren met de juiste begeleiding.
            </p>
          </div>
          <div className="InfoHero__image">
            <img src={teaching} alt="Docent bijles geven" />
          </div>
        </div>
      </section>

      <section className="InfoHero InfoHero--contact">
        <div className="InfoHero__content InfoHero__content--reverse">
          <div className="InfoHero__text">
            <h2 className="InfoHero__title">Contact</h2>
            <p className="InfoHero__description">
              Heb je vragen of wil je meer informatie? Neem gerust contact met me op!
            </p>
            <div className="InfoHero__contactInfo">
              <div className="InfoHero__contactItem">
                <strong>🌐 Website:</strong>
                <a href="https://www.bijlesengels.be" target="_blank" rel="noopener noreferrer">www.bijlesengels.be</a>
              </div>
              <div className="InfoHero__contactItem">
                <strong>📱 WhatsApp:</strong>
                <a href="https://wa.me/32483996769" target="_blank" rel="noopener noreferrer">+32 483 99 67 69</a>
              </div>
            </div>
            <p className="InfoHero__description">
              Ik reageer meestal binnen 24 uur op je bericht. Voor dringende vragen kun je me 
              altijd via WhatsApp bereiken.
            </p>
          </div>
          <div className="InfoHero__image">
            <img src={whatsapp} alt="Contact informatie" />
          </div>
        </div>
      </section>

      <section className="InfoHero InfoHero--pricing">
        <div className="InfoHero__content">
          <div className="InfoHero__text">
            <h2 className="InfoHero__title">Tarieven</h2>
            <p className="InfoHero__description">
              Transparante en betaalbare tarieven voor kwaliteitsvolle bijlessen Engels.
            </p>
            <div className="InfoHero__pricing">
              <div className="InfoHero__priceCard">
                <div className="InfoHero__priceAmount">€17</div>
                <div className="InfoHero__priceLabel">per uur</div>
                <p>Perfect voor gerichte hulp bij specifieke onderwerpen</p>
              </div>
              <div className="InfoHero__priceCard InfoHero__priceCard--popular">
                <div className="InfoHero__priceBadge">Populair</div>
                <div className="InfoHero__priceAmount">€30</div>
                <div className="InfoHero__priceLabel">per 2 uur</div>
                <p>Ideaal voor uitgebreide begeleiding en oefening</p>
              </div>
            </div>
            <p className="InfoHero__description">
              <strong>Let op:</strong> Maximaal 2 uur per dag per leerling om de kwaliteit 
              en concentratie te waarborgen.
            </p>
          </div>
          <div className="InfoHero__image">
            <img src={poster} alt="Tarieven informatie" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;


