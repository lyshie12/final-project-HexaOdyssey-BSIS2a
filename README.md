# Dagos Backend

REST API for Dagos, a commute planner for Albay (Region V). Built with Node.js, Express and MongoDB (Mongoose).

## Setup

1. Install packages (run both lines once, then commit `package.json` and `package-lock.json`):
   ```
   npm install express mongoose dotenv cors bcryptjs jsonwebtoken
   npm install --save-dev nodemon
   ```
2. Copy `.env.example` to `.env` and fill it in (set `JWT_SECRET` to a long random string).
3. Make sure MongoDB is running (local MongoDB or a MongoDB Atlas URI in `MONGO_URI`).
4. Load sample data (optional): `npm run seed`
5. Start the server: `npm run dev` (auto-restarts on changes) or `npm start`

The API runs on `http://localhost:5000`. Test it with `requests.http` (REST Client extension) or any API tool.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Run the server |
| `npm run dev` | Run with nodemon |
| `npm run seed` | Reset the database to sample data (never use on real data) |

## Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | Check the server |
| POST | `/api/auth/register` | Public | Create a commuter account |
| POST | `/api/auth/login` | Public | Log in, get a token |
| GET | `/api/auth/me` | Logged in | Current user |
| GET | `/api/stops` | Public | List stops (`q`, `municipality`, `page`, `limit`) |
| GET | `/api/stops/nearby` | Public | Stops near `lat`, `lng`, `radius` (meters) |
| GET | `/api/stops/:id` | Public | One stop |
| POST / PUT / DELETE | `/api/stops`, `/api/stops/:id` | Admin | Manage stops |
| GET | `/api/routes`, `/api/routes/:id` | Public | List routes, one route with its stops |
| POST / PUT / DELETE | `/api/routes`, `/api/routes/:id` | Admin | Manage routes |
| POST | `/api/routes/search` | Public | Find routes and fares from an origin to a destination |
| GET | `/api/fares` | Public | List fares |
| POST / PUT | `/api/fares`, `/api/fares/:id` | Admin | Manage fares |
| POST | `/api/reports` | Logged in | Report a wrong or changed route |
| GET | `/api/reports/mine` | Logged in | Your own reports |
| GET | `/api/reports` | Admin | All reports (`status` filter) |
| PUT | `/api/reports/:id` | Admin | Approve or reject a report |

Protected requests need the header `Authorization: Bearer <token>`.

## Folder structure

```
server.js        starts the server and connects to MongoDB
app.js           Express app: middleware, routes, error handling
config/          database connection, shared constants
middleware/      auth (JWT, roles), error handler
routes/          URL to controller mapping
controllers/     request handling
services/        main logic: auth tokens, route search, fare calculation
models/          Mongoose schemas: User, Stop, Route, Fare, Report
utils/           small helpers
seed/            sample data script
```

## Notes

- The seed data (stops, routes, fares) is placeholder only. Replace it with surveyed and LTFRB data.
- Route search finds direct routes only. Transfers still need to be built.
- Changing a route after an approved report is done by an admin through the route endpoints.
- Never commit `.env` to GitHub.
