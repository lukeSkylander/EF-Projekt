# 🦒 Twigga – Snus WebShop

Ein einfacher WebShop für Snus-Produkte, entwickelt im Rahmen des Schulprojekts.
Kundinnen und Kunden können sich registrieren, ihre Adresse (CH) prüfen lassen, Produkte bestellen und per Rechnung bezahlen.

---

## 🚀 Projektübersicht

**Twigga** ist ein Fullstack-WebShop mit:

* **Frontend:** React + TailwindCSS
* **Backend:** Python (FastAPI)
* **Datenbank:** MySQL
* **Adressprüfung:** OpenPLZAPI ([https://www.openplzapi.org/de/](https://www.openplzapi.org/de/))
* **Bezahlung:** Rechnung

Ziel ist ein funktionsfähiger MVP (Minimum Viable Product) mit Registrierung, Login, Produktanzeige, Warenkorb und Bestellsystem.

---

## 🧱 Architektur

```
Browser (React)  ⇄  FastAPI (REST-API)  ⇄  MySQL-Datenbank
                     ↑
                     └─ OpenPLZAPI (PLZ-Validierung Schweiz)
```

### Hauptkomponenten

| Komponente   | Technologie                 | Beschreibung                                                |
| ------------ | --------------------------- | ----------------------------------------------------------- |
| **Frontend** | React 18, Vite, TailwindCSS | SPA mit Routing und API-Anbindung                           |
| **Backend**  | Python 3.12, FastAPI        | REST-Service für Auth, Produkte, Bestellungen               |
| **DB**       | MySQL 8.0                   | Relationales Datenmodell für Kunden, Produkte, Bestellungen |
| **Server**   | uvicorn / gunicorn + Nginx  | Produktionstauglicher Webserver                             |
| **API**      | OpenPLZAPI                  | Überprüfung von PLZ und Ort (Schweiz)                       |

---

## 🧉 Datenmodell (MySQL)

### Tabellenübersicht

#### `users`

| Feld          | Typ                      | Beschreibung             |
| ------------- | ------------------------ | ------------------------ |
| id            | INT, PK                  | Eindeutige ID            |
| username      | VARCHAR(50)              | Benutzername             |
| email         | VARCHAR(100)             | E-Mail-Adresse           |
| password_hash | VARCHAR(255)             | Passwort (verschlüsselt) |
| role          | ENUM('customer','admin') | Nutzerrolle              |
| created_at    | TIMESTAMP                | Erstellungsdatum         |

#### `addresses`

| Feld       | Typ           | Beschreibung    |
| ---------- | ------------- | --------------- |
| id         | INT, PK       | Eindeutige ID   |
| user_id    | FK → users.id | Kunde           |
| street     | VARCHAR(100)  | Strasse         |
| zip        | VARCHAR(10)   | Postleitzahl    |
| city       | VARCHAR(100)  | Ort             |
| canton     | VARCHAR(10)   | Kanton          |
| is_default | BOOL          | Standardadresse |

#### `products`

| Feld        | Typ          | Beschreibung      |
| ----------- | ------------ | ----------------- |
| id          | INT, PK      | Produkt-ID        |
| name        | VARCHAR(100) | Produktname       |
| description | TEXT         | Beschreibung      |
| price       | DECIMAL(8,2) | Preis             |
| stock       | INT          | Lagerbestand      |
| brand       | VARCHAR(50)  | Standard „Twigga“ |

#### `orders`

| Feld       | Typ                                                 | Beschreibung |
| ---------- | --------------------------------------------------- | ------------ |
| id         | INT, PK                                             | Bestell-ID   |
| user_id    | FK → users.id                                       | Kunde        |
| total      | DECIMAL(10,2)                                       | Gesamtsumme  |
| status     | ENUM('pending','awaiting_payment','paid','shipped') | Status       |
| created_at | TIMESTAMP                                           | Datum        |

#### `order_items`

| Feld       | Typ              | Beschreibung |
| ---------- | ---------------- | ------------ |
| id         | INT, PK          | Zeilen-ID    |
| order_id   | FK → orders.id   | Bestellung   |
| product_id | FK → products.id | Produkt      |
| quantity   | INT              | Menge        |
| unit_price | DECIMAL(8,2)     | Einzelpreis  |

---

## 🧠 Funktionalitäten

### 🔑 Authentifizierung

* Registrierung & Login (JWT)
* Passwort-Hashing mit bcrypt
* Benutzerrollen: `customer`, `admin`

### 🏠 Adressvalidierung

Bei der Registrierung wird die Schweizer Adresse über
**[OpenPLZAPI](https://www.openplzapi.org/de/)** überprüft.

### 🛍️ Shop

* Produktübersicht & Details
* Warenkorb (Frontend-State)
* Bestellung absenden → DB-Eintrag + Rechnung

### 🧳 Rechnungslogik

* Bestellstatus: `awaiting_payment` → `paid` → `shipped`
* Rechnungsnummernformat: `TW-YYYYMM-####`
* Fälligkeitsdatum: +30 Tage ab Bestelldatum

### 🧑‍💼 Admin-Panel

* Produkte hinzufügen / bearbeiten / löschen
* Bestellungen verwalten (Status ändern)

---

## 🖥️ Frontend-Struktur

**Framework:** React + Vite + TailwindCSS
**Routing:** React Router
**State-Management:** React Context + React Query

### Seiten

| Seite          | Pfad           | Beschreibung                      |
| -------------- | -------------- | --------------------------------- |
| Home           | `/`            | Produktübersicht                  |
| Produktdetails | `/product/:id` | Detailansicht                     |
| Warenkorb      | `/cart`        | Übersicht & Checkout              |
| Registrierung  | `/register`    | Neues Konto anlegen               |
| Login          | `/login`       | Anmeldung                         |
| Profil         | `/account`     | Adressen, Bestellungen            |
| Admin          | `/admin`       | Produkte & Bestellungen verwalten |

---

## ⚙️ API-Endpunkte (Auszug)

| Methode                    | Pfad                             | Beschreibung |
| -------------------------- | -------------------------------- | ------------ |
| `POST /auth/register`      | Nutzerregistrierung              |              |
| `POST /auth/login`         | Login (JWT)                      |              |
| `GET /products`            | Produktliste                     |              |
| `GET /products/{id}`       | Produktdetails                   |              |
| `POST /orders`             | Bestellung aufgeben              |              |
| `GET /orders`              | Eigene Bestellungen              |              |
| `POST /addresses/validate` | Prüft PLZ/Ort über OpenPLZAPI    |              |
| `POST /admin/products`     | (Admin) Neues Produkt hinzufügen |              |

---

## 🧮 Installation (Entwicklungsumgebung)

### Voraussetzungen

* Node.js 20+
* Python 3.12+
* MySQL 8+
* Git, Docker (optional)

### Setup

**1. Klone das Projekt:**

```bash
git clone https://github.com/<user>/twigga-webshop.git
cd twigga-webshop
```

**2. Backend starten**

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**3. Frontend starten**

```bash
cd frontend
npm install
npm run dev
```

**4. Datenbank**

```bash
mysql -u root -p
CREATE DATABASE twigga;
```

**5. ENV-Variablen (Beispiel `.env`)**

```
DATABASE_URL=mysql+pymysql://root:password@localhost/twigga
JWT_SECRET=supersecret
OPENPLZAPI_URL=https://openplzapi.org/de/
```

---

## 🤪 To-Do / MVP-Planung

* [x] Projektstruktur (React + FastAPI)
* [x] Authentifizierung
* [ ] Produktliste + Detailseite
* [ ] Warenkorb + Checkout
* [ ] OpenPLZAPI-Anbindung
* [ ] Bestellung + Rechnung
* [ ] Admin-Panel

---

## 🦒 Team Twigga

| Rolle          | Name |
| -------------- | ---- |
| Projektleitung | ...  |
| Backend        | ...  |
| Frontend       | ...  |
| Design / UX    | ...  |
| Datenbank      | ...  |

---

## 📄 Lizenz

MIT License © 2025 Team Twigga
