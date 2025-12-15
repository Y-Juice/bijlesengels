# Bijles Engels

Een moderne webapplicatie voor het beheren van Engelse bijlessen voor leerlingen van het secundair onderwijs (1ste tot 3de jaar).

## Features

- 🎓 **Inschrijvingen**: Ouders kunnen hun kinderen inschrijven voor bijlessen
- 📅 **Kalender**: Interactieve kalender voor het selecteren van lesblokken
- 👨‍💼 **Admin Dashboard**: Beheer beschikbaarheden en goedkeur inschrijvingen
- 🔐 **Authenticatie**: Veilige login en registratie systeem
- 💾 **Database**: Supabase integratie voor universele data opslag
- 📱 **Responsive**: Werkt perfect op desktop en mobiel

## Technologie Stack

- **Frontend**: React 18
- **Styling**: CSS (geen Tailwind)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Installatie

1. Clone de repository:
```bash
git clone <repository-url>
cd bijlesengels
```

2. Installeer dependencies:
```bash
npm install
```

3. Maak een `.env` bestand aan met je Supabase credentials:
```
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
```

4. Zet de Supabase database op (zie `SUPABASE_SETUP.md` voor gedetailleerde instructies)

5. Start de development server:
```bash
npm start
```

De applicatie is nu beschikbaar op [http://localhost:3000](http://localhost:3000)

## Database Setup

Zie `SUPABASE_SETUP.md` voor volledige instructies over het opzetten van de Supabase database.

## Beschikbare Scripts

### `npm start`
Start de development server. De applicatie opent automatisch in je browser.

### `npm test`
Start de test runner in watch mode.

### `npm run build`
Bouwt de applicatie voor productie. De output staat in de `build` folder.

## Project Structuur

```
src/
├── components/       # React componenten
│   ├── auth/        # Authenticatie componenten
│   ├── Header.js    # Header component
│   ├── Sidebar.js   # Sidebar navigatie
│   └── MobileNav.js # Mobiele navigatie
├── pages/           # Pagina componenten
│   ├── Home.js      # Home pagina
│   ├── Register.js  # Inschrijfformulier
│   ├── Admin.js     # Admin beschikbaarheden
│   ├── Approve.js   # Admin goedkeuringen
│   └── MyRequests.js # Gebruiker inschrijvingen
├── services/        # Services en API calls
│   └── storage.js   # Supabase/LocalStorage service
├── styles/          # CSS bestanden
└── shared/          # Gedeelde componenten
    └── Calendar.js  # Kalender component
```

## Licentie

© 2025 Bijles Engels - Alle rechten voorbehouden