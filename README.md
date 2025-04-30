# Expense Tracker

A full-stack expense tracking application built with **FastAPI**, **React (Vite + TypeScript + Tailwind CSS)**, and **PostgreSQL**, containerized using **Docker Compose** with both development and production setups.

## Features

### Authentication
- User registration, login, and logout using JWT tokens
- Token-based authentication with 6-hour expiry

### Expense Management
- Add, update, delete expenses
- Filter expenses by month or category
- View monthly and category-wise summaries

## Tech Stack

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy ORM
- JWT Authentication
- Pydantic for data validation

### Frontend
- React with Vite
- TypeScript
- Tailwind CSS
- React Router
- Axios

### DevOps
- Docker & Docker Compose
- Nginx for serving production frontend
- Development override using `docker-compose.override.yml`

## Project Structure

```
expense-tracker/
├── backend/                 # FastAPI backend
│   ├── app/                 # Backend application code
│   ├── Dockerfile
│   └── requirements.txt
│   └── ...                  # other files
├── frontend/                # React frontend (Vite + TypeScript + Tailwind)
│   ├── src/
│   ├── Dockerfile
│   └── vite.config.ts
│   └── ...                  # other files
├── docker-compose.yml       # Production setup
└── docker-compose.override.yml  # Development override
```

## Getting Started

### Prerequisites
- Docker
- Docker Compose

### Running in Development Mode

```bash
git clone https://github.com/aman99jnvchd/expense-tracker.git
cd expense-tracker
docker compose up --build
```

- Frontend: http://localhost:3000  
- Backend (Swagger UI): http://localhost:8000/docs

### Running in Production Mode

```bash
docker compose -f docker-compose.yml up --build
```

- Frontend served via Nginx at: http://localhost:3000  
- Backend API: http://localhost:8000

## Environment Variables

Create a `.env` file in the `backend/` directory:

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/expense_db
JWT_SECRET_KEY=your_jwt_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=360
```

## To-Do / Future Enhancements

- Add automated testing with Pytest and React Testing Library
- Add pagination and sorting
- Deploy to cloud (e.g., AWS, Render, Railway)
- Add user profile management

## License

This project is licensed under the MIT License.
