# Chat Server (API-kompatibler Ersatz)

Ein eigenständiger, dockerisierter Nachbau des ursprünglich für ein Hochschulprojekt entwickelten PHP-Chat-Servers. Der Originalserver wurde wegen einer PHP-Schwachstelle abgeschaltet und ist nur noch vor Ort erreichbar. Dieses Projekt implementiert dieselbe API (siehe `api-docs.yaml`), damit unabhängig davon weiterentwickelt und getestet werden kann.

> ⚠️ **Kein 1:1-Code-Nachbau der PHP-Implementierung**, sondern ein API-kompatibler Ersatz in Node.js/TypeScript. Verhalten (Endpunkte, Parameter, Fehlercodes, Response-Formate) folgt exakt der OpenAPI-Spec — inklusive bewusst übernommener Kuriositäten des Originals (z. B. `deleteuser` antwortet mit `"User reset"`, siehe [Bekannte Abweichungen/Eigenheiten](#bekannte-abweichungeneigenheiten)).

---

## Inhaltsverzeichnis

- [Tech-Stack](#tech-stack)
- [Schnellstart mit Docker](#schnellstart-mit-docker)
- [Lokale Entwicklung](#lokale-entwicklung)
- [Umgebungsvariablen](#umgebungsvariablen)
- [Projektstruktur](#projektstruktur)
- [Datenbank & Migrationen](#datenbank--migrationen)
- [Admin-Funktionen](#admin-funktionen)
- [Datenpersistenz (Volume)](#datenpersistenz-volume)
- [API-Dokumentation](#api-dokumentation)
- [CI/CD](#cicd)
- [Wechsel auf PostgreSQL](#wechsel-auf-postgresql)
- [Bekannte Abweichungen/Eigenheiten](#bekannte-abweichungeneigenheiten)
- [Sicherheitshinweise](#sicherheitshinweise)

---

## Tech-Stack

| Komponente | Wahl |
|---|---|
| Laufzeit | Node.js 20 (TypeScript) |
| HTTP-Framework | Express |
| Datenbank | SQLite (`better-sqlite3`), via Knex austauschbar gegen PostgreSQL |
| Query-Builder/Migrationen | Knex.js |
| Binärdaten (Fotos/Dateien) | Dateisystem-Volume, nicht in der DB |
| Container | Docker (Multi-Stage-Build) |

---

## Schnellstart mit Docker

```bash
cp .env.example .env
# ADMIN_KEY_HASH setzen (siehe Abschnitt "Admin-Funktionen")

docker compose up -d --build
```

```bash
curl "http://localhost:8080/?request=ping"
# {"status":"ok","message":"Pong","code":200}
```

Die Datenbank-Migrationen werden beim Containerstart automatisch ausgeführt (`db.migrate.latest()` in `src/index.ts`) — kein manueller Schritt nötig.

---

## Lokale Entwicklung

```bash
npm install
cp .env.example .env
npm run dev
```

`npm run dev` startet den Server mit `ts-node-dev` und automatischem Neustart bei Codeänderungen.

```bash
npm run build   # TypeScript -> dist/
npm start       # kompilierten Build ausführen
```

---

## Umgebungsvariablen

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `PORT` | nein (Default `8080`) | Port, auf dem der Server lauscht |
| `DB_CLIENT` | nein (Default `sqlite`) | `sqlite` oder `postgres` |
| `DB_PATH` | nein | Pfad zur SQLite-Datei (nur bei `DB_CLIENT=sqlite`) |
| `DATABASE_URL` | ja, bei `DB_CLIENT=postgres` | Postgres-Connection-String |
| `ADMIN_KEY_HASH` | ja, für Admin-Befehle | Gehashter Admin-Key, siehe unten |
| `DATA_DIR` | nein | Basisverzeichnis für Foto-/Datei-Blobs (Default: `./data`) |

Siehe `.env.example` für eine vollständige Vorlage.

---

## Projektstruktur

```
chat-server/
├── src/
│   ├── index.ts              # Einstiegspunkt, Express-Setup
│   ├── dispatcher.ts         # zentraler Request-Router (?request=<name>)
│   ├── types.ts
│   ├── manual.html           # HTML-Doku, ausgeliefert bei fehlendem request-Parameter
│   ├── commands/              # ein Command pro Endpunkt
│   ├── lib/
│   │   ├── errors.ts         # ApiError + Fehlercode-Katalog
│   │   ├── validate.ts       # Parameter-/Format-Validierung
│   │   ├── auth.ts           # Token -> User Auflösung
│   │   ├── admin.ts          # Admin-Key-Prüfung
│   │   ├── chats.ts          # Chat-Serialisierung, Main-Chat-Sonderfall
│   │   ├── crypto.ts         # ID-Generierung, Passwort-Hashing
│   │   ├── storage.ts        # Foto-/Datei-Persistenz, Pfadvalidierung
│   │   ├── filetype.ts       # Magic-Byte-Erkennung
│   │   ├── time.ts           # API-Zeitstempelformat
│   │   └── db-helpers.ts
│   ├── db/
│   │   ├── index.ts
│   │   ├── knexfile.ts
│   │   └── migrations/
│   └── scripts/
│       └── hash-secret.ts    # Admin-Key hashen
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .github/workflows/
│   └── docker-build-push.yml
├── api-docs.yaml             # OpenAPI-Spec (Vertrag, den dieser Server erfüllt)
└── data/                      # Docker-Volume: chat.db, photos/, files/
```

---

## Datenbank & Migrationen

```bash
# neue Migration anlegen
npm run migrate:make -- create_something

# Migrationen manuell ausführen (passiert beim Containerstart auch automatisch)
npm run migrate
```

Migrationen liegen unter `src/db/migrations/` und laufen über Knex — identischer Code für SQLite und PostgreSQL (siehe [Wechsel auf PostgreSQL](#wechsel-auf-postgresql)).

---

## Admin-Funktionen

Für `resetuser`, `deleteuser` und `clear` wird ein Admin-Key benötigt. Erzeugen:

```bash
npm run hash-secret -- "mein-geheimer-admin-key"
```

Den ausgegebenen Hash in `ADMIN_KEY_HASH` in der `.env` eintragen. Der Klartext-Key selbst wird nirgends gespeichert und muss bei jedem Admin-Request als `key`-Parameter mitgeschickt werden.

---

## Datenpersistenz (Volume)

Fotos und Dateien liegen **nicht** in der Datenbank, sondern im Dateisystem unter `data/photos/` bzw. `data/files/`. Im Docker-Setup ist `/app/data` als Volume gemountet — bei einem Container-Neustart bleiben DB und Dateien erhalten, solange das Volume nicht gelöscht wird.

```bash
docker compose down            # Volume bleibt erhalten
docker compose down -v         # Volume wird mitgelöscht (alle Daten weg)
```

---

## API-Dokumentation

Die vollständige Schnittstellenbeschreibung befindet sich in [`api-docs.yaml`](./api-docs.yaml) (OpenAPI 3.0). Zum Durchstöbern z. B. in [Swagger Editor](https://editor.swagger.io/) einfügen oder mit Postman importieren.

Eine kompakte HTML-Übersicht liefert der laufende Server selbst bei einem GET-Request ohne `request`-Parameter:

```bash
curl "http://localhost:8080/"
```

---

## CI/CD

Der Workflow [`.github/workflows/docker-build-push.yml`](./.github/workflows/docker-build-push.yml) baut bei jedem Push auf `main` sowie bei Versions-Tags (`v*.*.*`) automatisch ein Docker-Image, führt einen Smoke-Test (`?request=ping`) durch und pusht es anschließend nach **GitHub Container Registry** (`ghcr.io`). Bei Pull Requests wird nur gebaut und getestet, **nicht** gepusht.

```bash
docker pull ghcr.io/mobille-apps-user-experience/chat-backend:latest
```

---

## Wechsel auf PostgreSQL

Dank Knex als Abstraktionsschicht ist der Wechsel ein reiner Config-Swap, kein Codewechsel:

```env
# .env
DB_CLIENT=postgres
DATABASE_URL=postgres://user:pass@host:5432/dbname
```

```bash
npm run migrate
```

Details und Compose-Beispiel siehe Projektverlauf/Commit-History bzw. `src/db/knexfile.ts`.

---

## Bekannte Abweichungen/Eigenheiten

Bewusste Design-Entscheidungen, wo die API-Spec nicht eindeutig war — Details jeweils als Kommentar im betreffenden Code:

- `validatetoken` antwortet **immer** mit HTTP 200 (Ergebnis nur in `message`) und hat eine künstliche 1-Sekunden-Verzögerung.
- `deleteuser` antwortet mit `message: "User reset"` (identisch zu `resetuser`) — so im Original-Beispiel der Spec dokumentiert, hier 1:1 übernommen.
- Nachrichten und Chat-Mitgliedschaften bleiben nach `deregister` erhalten (nur `deleteuser` entfernt sie vollständig).
- Direktchats (`directchat: true`) akzeptieren über ihre gesamte Lebenszeit nur eine einzige Einladung, unabhängig von späterem Verlassen/Ablehnen.
- Der Main-Chat (`chatid: 0`) ist virtuell, hat keine Datenbankzeile und ist für jeden Nutzer immer `joined`.
- ZIP- und DOCX/XLSX/PPTX-Dateien sind anhand ihrer Magic Bytes nicht unterscheidbar und werden einheitlich als `application/zip` erkannt.

---

## Sicherheitshinweise

Der Anlass für dieses Projekt war eine Sicherheitslücke im Original. Entsprechend wurde besonderer Wert auf folgende Punkte gelegt:

- **Kein Path Traversal:** `photoid`/`fileid` werden immer zuerst gegen die Datenbank validiert, zusätzlich greift ein Zeichen-Whitelist-Check direkt vor jedem Dateisystemzugriff (`lib/storage.ts`).
- **Keine SQL-Injection:** sämtliche Queries laufen über den Knex Query-Builder, kein rohes SQL mit String-Konkatenation.
- **Passwörter/Admin-Key:** gehasht via `scrypt` (Node-Bordmittel), niemals im Klartext persistiert oder geloggt.
- **Admin-Key:** wird ausschließlich als Hash in der `.env` gehalten, niemals im Repository oder Docker-Image eingebettet.
