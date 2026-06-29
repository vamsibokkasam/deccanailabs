# DECCAN AI labs

A full-stack web application for **DECCAN AI labs** — an AI education and internship platform. The site showcases programs, accepts contact inquiries and internship applications, and includes an admin dashboard to manage submissions and programs.

## Features

### Public website
- Responsive landing page with hero, about, focus areas, and vision sections
- Programs and internships pages
- Contact form with validation
- Internship application modal with per-program apply flow

### Admin dashboard (`/admin`)
- Secure login with admin key
- Dashboard stats (contacts, applications, programs, status breakdown)
- Applications per program chart
- View and manage contact messages
- View internship applications and update status (pending / reviewed / accepted)
- Program management (add, edit, delete, restore)

### Backend API
- REST API with Express.js
- MongoDB Atlas cloud database
- Form validation on frontend and backend
- Protected admin routes

---

## Tech stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React, Vite, Tailwind CSS, React Router |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas (Mongoose)            |
| Icons      | Lucide React                        |

---

## Project structure

```
deccanailabs/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── pages/              # Route pages (Home, Contact, Admin, etc.)
│   ├── layouts/            # MainLayout (Navbar + Footer)
│   ├── services/           # API client
│   └── utils/              # Form validation
├── server/                 # Express backend
│   ├── config/             # DB connection & seed data
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth, validation, error handling
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── server.js           # Entry point
├── public/                 # Static assets
└── package.json            # Frontend dependencies
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier)
- Git (optional, for deployment)

---

## Local development setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/deccanailabs.git
cd deccanailabs
```

### 2. Set up MongoDB Atlas

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user (username + password)
3. Under **Network Access**, allow your IP (or `0.0.0.0/0` for development)
4. Copy the connection string and replace `<password>` with your encoded password

> If your password contains `@`, encode it as `%40` in the connection string.

### 3. Backend setup

```bash
cd server
npm install
```

Create `server/.env` from the example:

```bash
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/deccanailabs?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
ADMIN_KEY=your-secret-admin-key
```

Start the backend:

```bash
npm run dev
```

You should see:

```
MongoDB Atlas connected
Server running on port 5000
```

### 4. Frontend setup

Open a new terminal from the project root:

```bash
npm install
```

Optional: create `.env` in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

> If omitted, Vite proxies `/api` to `http://localhost:5000` during development.

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment variables

### Frontend (`.env`)

| Variable       | Description              | Example                        |
|----------------|--------------------------|--------------------------------|
| `VITE_API_URL` | Backend API base URL     | `http://localhost:5000/api`    |

### Backend (`server/.env`)

| Variable      | Description                    | Example                              |
|---------------|--------------------------------|--------------------------------------|
| `PORT`        | Server port (local only; **do not set on Render**) | `5000` |
| `MONGODB_URI` | MongoDB Atlas connection string| `mongodb+srv://...`                  |
| `CLIENT_URL`  | Frontend URL(s) for CORS (comma-separated for multiple) | `http://localhost:5173,https://deccanailabs.vercel.app` |
| `ADMIN_KEY`   | Admin dashboard login key      | `your-secret-admin-key`              |

**Never commit `.env` files to Git.**

---

## API endpoints

### Public

| Method | Endpoint            | Description                |
|--------|---------------------|----------------------------|
| GET    | `/api/health`       | Health check               |
| GET    | `/api/programs`     | List active programs       |
| POST   | `/api/contacts`     | Submit contact form        |
| POST   | `/api/applications` | Submit internship application |

### Admin (requires `x-admin-key` header)

| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| GET    | `/api/admin/verify`           | Verify admin key               |
| GET    | `/api/admin/stats`            | Dashboard statistics           |
| GET    | `/api/admin/programs`         | List all programs              |
| POST   | `/api/admin/programs`         | Create program                 |
| PUT    | `/api/admin/programs/:id`     | Update program                 |
| DELETE | `/api/admin/programs/:id`     | Soft-delete program            |
| GET    | `/api/contacts`               | List contact messages          |
| GET    | `/api/applications`           | List applications              |
| PATCH  | `/api/applications/:id/status`| Update application status      |

---

## Admin panel

1. Go to [http://localhost:5173/admin](http://localhost:5173/admin)
2. Enter the `ADMIN_KEY` from `server/.env`
3. Use the tabs:
   - **Dashboard** — stats and charts
   - **Contacts** — contact form submissions
   - **Applications** — internship applications
   - **Programs** — add, edit, delete programs

---

## Scripts

### Frontend (project root)

| Command         | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Start Vite dev server    |
| `npm run build` | Build for production     |
| `npm run preview` | Preview production build |
| `npm run lint`  | Run ESLint               |

### Backend (`server/`)

| Command         | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Start with nodemon       |
| `npm start`     | Start production server  |

---

## Deployment (free)

### Recommended stack

| Component | Platform        | Cost  |
|-----------|-----------------|-------|
| Frontend  | [Vercel](https://vercel.com) | Free |
| Backend   | [Render](https://render.com) | Free |
| Database  | MongoDB Atlas   | Free  |

### Backend (Render)

1. Connect your GitHub repo on Render
2. Create a **Web Service**
3. Use these settings:

| Setting         | Value                              |
|-----------------|------------------------------------|
| Root Directory  | `server`                           |
| Build Command   | `npm install && npm run build`     |
| Start Command   | `npm start`                        |

4. Add environment variables:

```env
MONGODB_URI=your_mongodb_atlas_uri
CLIENT_URL=https://deccanailabs.vercel.app
ADMIN_KEY=your-secret-admin-key
```

> **Important:** Set **Root Directory** to `server`. Do **not** set `PORT` on Render — Render assigns the port automatically. Setting `PORT=5000` manually causes CORS-like errors because requests never reach your app.

### Frontend (Vercel)

1. Import the GitHub repo on Vercel
2. Framework preset: **Vite**
3. Add environment variable:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

4. Deploy

### After deployment

Update `CLIENT_URL` on Render to your live Vercel URL:

```env
CLIENT_URL=https://your-app.vercel.app
```

### SPA routing on Vercel

If routes like `/contact` or `/admin` return 404 in production, add `vercel.json` in the project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Pages

| Route          | Description                    |
|----------------|--------------------------------|
| `/`            | Home                           |
| `/about`       | About page                     |
| `/programs`    | Programs                       |
| `/internships` | Internship programs & apply    |
| `/contact`     | Contact form                   |
| `/admin`       | Admin dashboard                |

---

## License

This project is private. All rights reserved © 2026 DECCAN AI labs.
