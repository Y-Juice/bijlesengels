# Supabase Database Setup

Deze applicatie gebruikt Supabase als database backend. Volg deze stappen om de database in te stellen.

## 1. Supabase Project Aanmaken

1. Ga naar [supabase.com](https://supabase.com) en maak een account aan
2. Maak een nieuw project aan
3. Noteer je Project URL en API Key (anon/public key)

## 2. Environment Variables Instellen

Maak een `.env` bestand in de root van het project met:

```
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_KEY=your-anon-key
```

## 3. Database Tabellen Aanmaken

Voer de volgende SQL queries uit in de Supabase SQL Editor:

### Tabel: `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  username TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Anyone can insert (for registration)
CREATE POLICY "Anyone can insert profile" ON profiles
  FOR INSERT WITH CHECK (true);

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Tabel: `availability`

```sql
CREATE TABLE availability (
  slot TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('available', 'unavailable', 'occupied')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read availability
CREATE POLICY "Anyone can read availability" ON availability
  FOR SELECT USING (true);

-- Policy: Only admins can modify availability
CREATE POLICY "Admins can modify availability" ON availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Tabel: `registrations`

```sql
CREATE TABLE registrations (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_age TEXT NOT NULL,
  student_leerjaar TEXT NOT NULL,
  student_studierichting TEXT NOT NULL,
  more_kids TEXT DEFAULT 'no',
  slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at BIGINT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index voor snellere queries
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_created_at ON registrations(created_at);

-- Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own registrations
CREATE POLICY "Users can view own registrations" ON registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own registrations
CREATE POLICY "Users can insert own registrations" ON registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending registrations
CREATE POLICY "Users can update own pending registrations" ON registrations
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Policy: Users can delete their own registrations
CREATE POLICY "Users can delete own registrations" ON registrations
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Admins can read all registrations
CREATE POLICY "Admins can read all registrations" ON registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update all registrations
CREATE POLICY "Admins can update all registrations" ON registrations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 4. Admin Gebruiker Aanmaken

### Optie A: Via Supabase Dashboard

1. Ga naar Authentication > Users in je Supabase dashboard
2. Klik op "Add User" > "Create new user"
3. Voer in:
   - Email: `admin@bijlesengels.be` (of een ander email adres)
   - Password: kies een sterk wachtwoord
   - Auto Confirm User: ✅ (aanzetten)
4. Noteer de User ID die wordt aangemaakt

5. Ga naar de SQL Editor en voer uit:

```sql
INSERT INTO profiles (id, name, email, username, role)
VALUES (
  'USER_ID_HIER', -- Vervang met de User ID van stap 4
  'Admin',
  'admin@bijlesengels.be',
  'admin',
  'admin'
);
```

### Optie B: Via SQL (vereist email confirmation disabled)

```sql
-- Eerst de auth user aanmaken (dit moet via Supabase Auth API of Dashboard)
-- Daarna het profile:

INSERT INTO profiles (id, name, email, username, role)
VALUES (
  'USER_ID_FROM_AUTH',
  'Admin',
  'admin@bijlesengels.be',
  'admin',
  'admin'
);
```

## 5. Testen

1. Start de applicatie: `npm start`
2. Probeer in te loggen met de admin credentials
3. Controleer of beschikbaarheden kunnen worden ingesteld
4. Test registratie van een nieuwe gebruiker
5. Test het maken van een inschrijving

## Troubleshooting

### "Admin user not found"
- Zorg ervoor dat je een admin gebruiker hebt aangemaakt in de `profiles` tabel met `role='admin'`

### "Row Level Security policy violation"
- Controleer of de RLS policies correct zijn ingesteld
- Zorg ervoor dat je ingelogd bent als de juiste gebruiker

### "Table does not exist"
- Controleer of alle tabellen zijn aangemaakt
- Controleer de tabelnamen (moeten exact overeenkomen: `profiles`, `availability`, `registrations`)

### "Column does not exist"
- Controleer of alle kolommen correct zijn aangemaakt
- Let op: `user_id` in registrations tabel (niet `userId`)

## Database Schema Overzicht

- **profiles**: Gebruikersprofielen (parent/admin)
- **availability**: Beschikbare tijdstippen voor lessen
- **registrations**: Inschrijvingen van leerlingen

Alle data wordt opgeslagen in Supabase en is universeel beschikbaar voor alle gebruikers.

