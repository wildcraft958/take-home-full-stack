# Room Booking System - Railway Deployment Guide

## Quick Deploy to Railway

### Prerequisites
- [Railway CLI](https://docs.railway.app/develop/cli) installed
- Railway account (free tier available)
- OpenRouter/OpenAI API key for AI features

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### Step 2: Create Railway Project

```bash
cd take-home-full-stack
railway init
```

### Step 3: Add PostgreSQL Database

```bash
railway add --plugin postgresql
```

### Step 4: Deploy Backend

```bash
cd backend
railway up
```

Set these environment variables in Railway dashboard:
- `DATABASE_URL` - Auto-configured by Railway PostgreSQL
- `OPENROUTER_API_KEY` - Your API key
- `AI_PROVIDER` - `openai`
- `AI_MODEL` - `openai/gpt-3.5-turbo`

### Step 5: Deploy Frontend

```bash
cd ../frontend
railway up
```

Set this environment variable:
- `VITE_API_URL` - Your backend Railway URL (e.g., `https://your-backend.up.railway.app`)

### Step 6: Get Your URLs

```bash
railway open
```

Your app will be available at the Railway-provided URLs.

---

## Alternative: One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

---

## Environment Variables Reference

| Variable | Service | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `OPENROUTER_API_KEY` | Backend | OpenRouter API key |
| `AI_PROVIDER` | Backend | `openai` or `ollama` |
| `AI_MODEL` | Backend | Model name (e.g., `openai/gpt-3.5-turbo`) |
| `VITE_API_URL` | Frontend | Backend API URL |
