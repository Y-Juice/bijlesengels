import React from 'react';
import { FiArrowRight, FiMonitor, FiCalendar, FiAward, FiClock, FiGlobe } from 'react-icons/fi';
import '../styles/Home.css';
import introsection from '../assets/introsection.png';
import teaching from '../assets/teaching.png';
import contact from '../assets/contact.png';

// thick multi-coloured squiggle ribbon, like the reference photo.
// hard colour stops give the crisp colour blocks instead of a smooth blend.
function Ribbon({ id, className, d, viewBox }) {
  return (
    <svg className={className} viewBox={viewBox} fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6fd1c1" />
          <stop offset="0.16" stopColor="#6fd1c1" />
          <stop offset="0.16" stopColor="#2fa45f" />
          <stop offset="0.33" stopColor="#2fa45f" />
          <stop offset="0.33" stopColor="#f29ac4" />
          <stop offset="0.5" stopColor="#f29ac4" />
          <stop offset="0.5" stopColor="#f47b3c" />
          <stop offset="0.66" stopColor="#f47b3c" />
          <stop offset="0.66" stopColor="#3ba0e0" />
          <stop offset="0.83" stopColor="#3ba0e0" />
          <stop offset="0.83" stopColor="#e6f06a" />
          <stop offset="1" stopColor="#e6f06a" />
        </linearGradient>
      </defs>
      <path
        d={d}
        stroke={`url(#${id})`}
        strokeWidth="34"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const HERO_RIBBON = 'M40 40 C 180 -10, 300 60, 230 140 C 170 210, 60 180, 90 250 C 115 310, 260 320, 320 250';
const ACCENT_RIBBON = 'M10 120 C 60 30, 150 30, 160 110 C 170 190, 250 190, 250 110';

function Home() {
  return (
    <div className="Home">
      <section className="Hero band">
        <div className="band__inner Hero__inner">
          <div className="Hero__text">
            <span className="eyebrow">Bijlessen Engels &bull; 1ste &ndash; 4de secundair</span>
            <h1 className="Hero__title">Sterker worden in Engels</h1>
            <p className="Hero__subtitle">
              Persoonlijke bijlessen voor leerlingen ASO, TSO &amp; BSO &mdash; online via
              Microsoft Teams of bij jou thuis.
            </p>
            <div className="Hero__cta">
              <a className="btn Hero__btn" href="#/register">
                Inschrijven
                <FiArrowRight aria-hidden="true" />
              </a>
              <a className="btn Hero__btnGhost" href="#tarieven">Bekijk tarieven</a>
            </div>
          </div>
        </div>
        <Ribbon id="heroRibbon" className="Hero__ribbon" d={HERO_RIBBON} viewBox="0 0 360 320" />
      </section>

      <section className="GreenBand band">
        <div className="band__inner GreenBand__inner">
          <div className="GreenBand__media">
            <img src={teaching} alt="Docent geeft bijles Engels" />
          </div>
          <div className="GreenBand__body">
            <span className="eyebrow eyebrow--light">Over mij</span>
            <h2 className="GreenBand__title">Persoonlijke begeleiding, op jouw tempo</h2>
            <p className="GreenBand__text">
              Ik ben een student Leerkracht secundair onderwijs aan de Erasmushogeschool Brussel.
              Met passie voor het Engels en ervaring in het onderwijs, help ik leerlingen om hun
              Engelse vaardigheden te verbeteren en zelfvertrouwen op te bouwen.
            </p>
            <p className="GreenBand__text">
              Mijn aanpak is persoonlijk en aangepast aan de behoeften van elke leerling.
              Ik geloof dat leren leuk moet zijn en dat iedereen Engels kan leren met de juiste begeleiding.
            </p>
          </div>
        </div>
      </section>

      <section className="Feature band" style={{ backgroundImage: `url(${introsection})` }}>
        <Ribbon id="featLeft" className="Feature__ribbon Feature__ribbon--left" d={ACCENT_RIBBON} viewBox="0 0 260 200" />
        <Ribbon id="featRight" className="Feature__ribbon Feature__ribbon--right" d={ACCENT_RIBBON} viewBox="0 0 260 200" />
        <div className="band__inner Feature__inner">
          <div className="Feature__card">
            <span className="eyebrow">Flexibel</span>
            <h2 className="Feature__title">Lessen via Teams of bij jou thuis</h2>
            <p className="Feature__text">
              Flexibele uren tijdens schoolvakanties en een aanpak die past bij jouw planning.
              Je kiest zelf of je online lessen volgt of de les bij jou thuis laat doorgaan.
            </p>
            <a className="btn Hero__btn" href="#/register">
              Plan je eerste les
              <FiArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="Services band">
        <div className="band__inner">
          <span className="eyebrow Services__eyebrow">Aanbod</span>
          <h2 className="Services__heading">Zo werken de bijlessen</h2>
          <div className="Services__grid">
            <article className="ServiceCard">
              <div className="ServiceCard__icon">
                <FiMonitor aria-hidden="true" />
              </div>
              <h3 className="ServiceCard__title">Online of thuis</h3>
              <p className="ServiceCard__text">
                Via Microsoft Teams of bij de leerling thuis (verplaatsingskosten komen erbij).
              </p>
            </article>
            <article className="ServiceCard">
              <div className="ServiceCard__icon">
                <FiCalendar aria-hidden="true" />
              </div>
              <h3 className="ServiceCard__title">Flexibele uren</h3>
              <p className="ServiceCard__text">
                Ook tijdens de schoolvakanties zoeken we samen een moment dat voor jou past.
              </p>
            </article>
            <article className="ServiceCard">
              <div className="ServiceCard__icon">
                <FiAward aria-hidden="true" />
              </div>
              <h3 className="ServiceCard__title">Persoonlijke aanpak</h3>
              <p className="ServiceCard__text">
                Elke les wordt aangepast aan het niveau en de doelen van de leerling.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="Pricing band" id="tarieven">
        <div className="band__inner">
          <span className="eyebrow Pricing__eyebrow">Tarieven</span>
          <h2 className="Pricing__heading">Transparant en betaalbaar</h2>
          <div className="Pricing__grid">
            <div className="PriceCard">
              <div className="PriceCard__amount">&euro;25</div>
              <div className="PriceCard__label">per uur / leerling</div>
              <p>Perfect voor gerichte hulp bij specifieke onderwerpen.</p>
            </div>
            <div className="PriceCard PriceCard--popular">
              <div className="PriceCard__badge">Populair</div>
              <div className="PriceCard__amount">&euro;40</div>
              <div className="PriceCard__label">per 2 uur / leerling</div>
              <p>Ideaal voor uitgebreide begeleiding en oefening.</p>
            </div>
          </div>
          <p className="Pricing__notice">
            <FiClock className="Pricing__noticeIcon" aria-hidden="true" />
            <span>
              <strong>Let op:</strong> Maximaal 2 uur per dag per leerling om de kwaliteit
              en concentratie te waarborgen. Bij lessen thuis komen er verplaatsingskosten bij.
            </span>
          </p>
        </div>
      </section>

      <section className="Contact band">
        <div className="band__inner Contact__inner">
          <div className="Contact__body">
            <span className="eyebrow eyebrow--light">Contact</span>
            <h2 className="Contact__title">Klaar om te starten?</h2>
            <p className="Contact__text">
              Heb je vragen of wil je meer informatie? Alle contact en inschrijvingen verlopen
              via deze website. Ik reageer meestal binnen 24 uur op je bericht.
            </p>
            <div className="Contact__row">
              <FiGlobe className="Contact__icon" aria-hidden="true" />
              <strong>Website:</strong>
              <a href="https://www.bijlesengels.be" target="_blank" rel="noopener noreferrer">www.bijlesengels.be</a>
            </div>
            <a className="btn Hero__btn" href="#/register">
              Schrijf je in
              <FiArrowRight aria-hidden="true" />
            </a>
          </div>
          <div className="Contact__media">
            <img src={contact} alt="Contact informatie" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
