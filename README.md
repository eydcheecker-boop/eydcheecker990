# EYD Checker — Indonesian EYD/PUEBI Checker

Full-stack demo: React + Tailwind frontend, FastAPI backend.

Quick start (requires Node.js and Python 3.10+):

1) Run backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2) Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` and test the app. The frontend calls `http://localhost:8000/check_eyd`.

Notes:
- Backend includes light rule-based EYD checks and an optional IndoBERT scoring path (if `transformers` and a model are installed).
- Feedback is saved in `backend/feedback.db` (SQLite) when users submit acceptance/ignore decisions.
# eydcheecker990