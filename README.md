# Calendar Lite

## Running the project

### Prerequisites

- **Node.js** 18+ (with npm)
- **PostgreSQL** (running and reachable)
- **Git** (to clone the repo)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root with:

```env
PORT=3000
DATABASE_URL=postgres://user:password@localhost:5432/calendar_lite
JWT_SECRET=your-secret-key-min-32-chars
BASE_URL=http://localhost:3000
```

- `PORT` – Server port (default: 3000).
- `DATABASE_URL` – PostgreSQL connection string.
- `JWT_SECRET` – Secret for signing JWT tokens (use a long, random value).
- `BASE_URL` – Base URL of the API (e.g. for links or docs).

### 3. Run the application

**Development (with auto-reload):**

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

- `npm run dev` – Runs the app with `ts-node` (no build step).
- `npm run build` – Compiles TypeScript to `dist/`.
- `npm start` – Runs the compiled app from `dist/index.js`.

The API will be available at `http://localhost:3000` (or the port set in `PORT`).

---

## API overview

Protected routes require the `Authorization: Bearer <token>` header.
