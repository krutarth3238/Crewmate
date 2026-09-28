<div align="center">
  <img width="800" alt="Crewmate Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
  <h1>🚀 Crewmate</h1>
  <p><b>Your Gamified AI Co-Founder Console</b></p>
  
  [![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
  [![PostgreSQL](https://img.shields.io/badge/postgresql-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
</div>

---

**Crewmate** is a next-generation gamified AI co-founder console. Built with a server-authoritative trust engine, real agent execution loops, and secure Firebase authentication, Crewmate brings your digital teammate to life. Level up your AI teammate, assign missions, and build the future together!

## ✨ Features

- **🎮 Server-Authoritative Trust Engine:** The XP and autonomy level of your AI teammate are rigorously verified on the server. Level ups happen organically as missions succeed.
- **🤖 Real Agent Execution Loop:** Utilizing Groq, the agent plans and executes tasks against sandboxed tools.
- **🛡️ Boundary-Gated Autonomy:** Objectives outside the teammate's current autonomy level become pending `ApprovalQuests` instead of running silently. You remain in control.
- **📜 Append-Only Mission Audit Log:** Track everything your AI co-founder does. Missions are securely logged and cannot be tampered with.
- **🔐 Secure Authentication:** Integrated with Firebase Auth and Admin SDK for bulletproof token verification.

## 🏗️ Architecture

Crewmate is divided into two core parts:

1. **Frontend:** A React + Vite app providing the sleek, gamified console interface.
2. **Backend:** An asynchronous FastAPI + PostgreSQL + SQLAlchemy 2.0 backend powering the trust engine, agent logic, and mission audits.

## 🚀 Quick Start

### 1. Backend Setup

Navigate to the `backend` directory:
```bash
cd backend
```
1. Set up a virtual environment and install dependencies:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Configure your environment:
   ```bash
   cp .env.example .env
   ```
   *Make sure to set `DATABASE_URL` and `FIREBASE_SERVICE_ACCOUNT_PATH`.*
3. Run migrations and start the server:
   ```bash
   alembic upgrade head
   uvicorn app.main:app --reload --port 8000
   ```
   *The backend will be available at `http://localhost:8000/docs`.*

### 2. Frontend Setup

Navigate to the `frontend` directory:
```bash
cd frontend
```
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure your environment variables in `.env`.
3. Start the dev server:
   ```bash
   npm run dev
   ```

## 🎮 How it Works

When you spin up Crewmate, you aren't just logging into a dashboard—you are interacting with an AI co-founder that grows with your project. The more tasks you collaborate on, the more XP your agent earns. High-risk missions require your manual approval, while tasks within the agent's current autonomy level are executed automatically. 

Build the future, together! 🌌
