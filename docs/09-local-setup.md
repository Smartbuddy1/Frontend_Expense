# Local Setup — Getting ASEMS Running On Your Machine

_Last updated: 2026-08-30_

Follow this once when you join the project. It gets both the frontend and the backend running locally, talking to your own local MySQL database.

## 1. Install prerequisites

- **Node.js** (v20 or newer) — [nodejs.org](https://nodejs.org)
- **Git**
- **XAMPP** (gives you MySQL + phpMyAdmin in one installer, no separate MySQL setup needed) — [apachefriends.org](https://www.apachefriends.org/)

## 2. Start MySQL

1. Open the **XAMPP Control Panel**.
2. Click **Start** next to **MySQL**.
3. (Optional, to browse the database visually) Click **Start** next to **Apache** too, then open `http://localhost/phpmyadmin` in a browser.

## 3. Create your local database

Easiest way — phpMyAdmin:
1. Go to `http://localhost/phpmyadmin`.
2. Click **Databases** → name it `asems` → Create.

(Or via command line: `mysql -u root -e "CREATE DATABASE asems CHARACTER SET utf8mb4;"` — XAMPP's MySQL binary is typically at `C:\xampp\mysql\bin\mysql.exe`.)

## 4. Clone the repo and install dependencies

```
git clone https://github.com/Smartbuddy1/Expense.git
cd Expense
git checkout develop

npm install          # frontend deps

cd server
npm install           # backend deps
cd ..
```

## 5. Set up environment variables

Two separate `.env` files — neither is committed to git, so you create both yourself from the `.env.example` templates:

**Root `.env`** (frontend, tells it where the backend is):
```
cp .env.example .env
```
The default (`VITE_API_BASE_URL=http://localhost:5000`) is correct as-is if you're running the backend locally on the default port.

**`server/.env`** (backend):
```
cd server
cp .env.example .env
```
Then edit `server/.env` and fill in:
```
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL="mysql://root:@localhost:3306/asems"
JWT_SECRET=<any long random string>
```
`root` with no password is XAMPP's default MySQL login — adjust if you changed it. Generate a `JWT_SECRET` with:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 6. Create the database tables and seed test users

From `server/`:
```
npx prisma migrate dev
node prisma/seed.js
```
The seed script creates one test login per role, all using password `test1234`:

| Role | Mobile |
|---|---|
| Admin | 9999999999 |
| Operations | 9999999998 |
| Accountant | 9999999997 |
| Site Supervisor | 9999999996 |

## 7. Run it

Two terminals:
```
# Terminal 1 — backend
cd server
npm run dev              # http://localhost:5000 — check http://localhost:5000/health

# Terminal 2 — frontend
npm run dev              # http://localhost:5173
```
Open `http://localhost:5173`, log in with any of the test accounts above, and you should land on that role's dashboard.

## Troubleshooting

- **"Can't reach database server"** — MySQL isn't started in the XAMPP Control Panel, or `DATABASE_URL` in `server/.env` doesn't match your setup.
- **Login says "Could not reach the server"** — the backend (`server/`, port 5000) isn't running, or `VITE_API_BASE_URL` in the root `.env` doesn't point at it.
- **"Too many login attempts"** — the login endpoint is rate-limited to 5 tries per 15 minutes per IP (see [06-security.md](06-security.md)); restart the backend to reset it during testing, or just wait.
- **Port already in use** — something else is already listening on 5000 or 5173; stop it or change `PORT` in `server/.env` (and `VITE_API_BASE_URL` to match).

## Next steps

Read [02-git-workflow.md](02-git-workflow.md) for how branching and PRs work on this repo, and [03-frontend-status.md](03-frontend-status.md) for what's already done vs. still open in your module.
