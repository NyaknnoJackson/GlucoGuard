# GlucoGuard 🛡️

An AI-powered diabetes risk prediction and health monitoring web application.

![GlucoGuard](https://img.shields.io/badge/Status-Active-brightgreen) ![Python](https://img.shields.io/badge/Python-3.12-blue) ![React](https://img.shields.io/badge/React-18-61dafb) ![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688) ![XGBoost](https://img.shields.io/badge/XGBoost-2.0-orange)

## 🌟 Overview

GlucoGuard helps users understand and manage their diabetes risk through:

- **AI-powered risk prediction** using an XGBoost model trained on the Pima Indians Diabetes dataset
- **Health metric tracking** — glucose, BMI, blood pressure, insulin, sleep, steps, hydration
- **Personalised recommendations** — diet, exercise, sleep, and lifestyle tips based on risk level
- **Interactive analytics** — 30-day trends for glucose, BMI, blood pressure, and lifestyle habits
- **Secure authentication** — JWT-based login and registration system

---

## 🖥️ Tech Stack

### Backend
| Tool | Purpose |
|------|---------|
| FastAPI | REST API framework |
| PostgreSQL | Relational database |
| SQLAlchemy | ORM |
| XGBoost + Scikit-learn | ML model |
| Passlib + bcrypt | Password hashing |
| Python-Jose | JWT authentication |

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework |
| Tailwind CSS | Styling |
| Recharts | Data visualisation |
| Zustand | State management |
| Axios | HTTP client |

---

## 📁 Project Structure
glucoguard/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── database.py       # DB connection
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── routers/          # API route handlers
│   │   ├── services/         # Business logic
│   │   └── ml/               # XGBoost model + training
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
├── src/
│   ├── pages/            # React pages
│   ├── components/       # Reusable components
│   ├── api/              # Axios API client
│   └── store/            # Zustand state
└── package.json
---

## 🚀 Getting Started

### Prerequisites
- Python 3.12
- Node.js 18+
- PostgreSQL 15+

### Backend Setup

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate   # Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend` folder:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/glucoguard
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ENVIRONMENT=development
```

Train the ML model (download `diabetes.csv` from [Kaggle](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database) and place it in `backend/app/ml/`):

```bash
python -m app.ml.train
```

Start the backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

App available at: `http://localhost:5173`

---

## 🤖 ML Model

- **Algorithm:** XGBoost Classifier
- **Dataset:** Pima Indians Diabetes Database (768 samples, 8 features)
- **Features:** Glucose, BMI, Age, Blood Pressure, Insulin, Pregnancies, Diabetes Pedigree Function, Skin Thickness
- **Performance:** ~84% ROC-AUC, ~80% accuracy
- **Preprocessing:** Median imputation for physiologically invalid zeros, StandardScaler normalisation

### Risk Labels
| Score | Label |
|-------|-------|
| 0–35% | Low Risk |
| 35–65% | Moderate Risk |
| 65–100% | High Risk |

---

## 📸 Features

- 🔐 JWT Authentication (register, login, logout)
- 📊 Interactive glucose trend charts
- 🤖 One-click diabetes risk prediction
- 💡 Personalised health recommendations
- 📈 30-day health analytics dashboard
- 🏃 Lifestyle tracking (steps, sleep, hydration)

---

## ⚠️ Disclaimer

GlucoGuard is a personal health awareness tool and is **not a medical device**. It is not intended to diagnose, treat, or replace professional medical advice. Always consult a qualified healthcare provider for medical decisions.

---

## 👤 Author

Built by **Jackson Nyaknno**  
BSc Biochemistry | Data Analyst | Health Tech  
[GitHub](https://github.com/NyaknnoJackson) · [LinkedIn](https://linkedin.com/in/your-profile)

---

## 📄 License

MIT License — free to use and modify with attribution.

## 🌐 Live Demo
**App:** https://gluco-guard-eight.vercel.app  
**API Docs:** https://glucoguard-production-c493.up.railway.app/docs
