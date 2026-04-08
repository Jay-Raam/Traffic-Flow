# Traffic Flow Optimization System

AI-powered full-stack smart-city traffic platform with FastAPI backend, MCP tools, OpenRouter integration, and a modern Next.js dashboard.

## Features

- Real-time traffic simulation using NumPy + Pandas
- AI-driven optimization using OpenRouter model `nvidia/llama-nemotron-embed-vl-1b-v2`
- Structured MCP tools for traffic analysis, congestion prediction, and signal timing optimization
- Socket.IO live updates for traffic streams and alerts
- Rate limiting with Redis + SlowAPI:
  - `POST /optimize`: 5 requests per minute per IP
  - `GET /traffic`: 30 requests per minute per IP
- Responsive dashboard, map heat overlay, historical charts, and AI control panel
- Route planner for any from/to location with map polyline, ETA, traffic level, and alerts
- Auto optimization every 30 seconds in control panel

## Architecture

```mermaid
flowchart LR
  UI[Next.js Frontend]\nDashboard + Map + Control --> API[FastAPI Backend]
  API --> Sim[Traffic Simulation Service\nNumPy + Pandas]
  API --> AI[AI Service\nOpenRouter]
  AI --> MCP[MCP Tools\nanalyze_traffic / predict_congestion / optimize_signal]
  API --> Redis[(Redis)]
  API --> Socket[Socket.IO Stream]
  Socket --> UI
```

## Project Structure

```text
frontend/
backend/
  main.py
  routers/
  services/
  models/
  utils/
    mcp_tools.py
```

## Setup

### 1) Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

Optional MCP server process:

```bash
python mcp_server.py
```

### 2) Frontend

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## API Endpoints

- `GET /traffic` - live simulated traffic snapshot
- `POST /optimize` - AI optimization workflow using MCP tools
- `GET /history` - historical trend points
- `POST /route` - geocode source/destination and compute best route with ETA and alerts
- `GET /health` - health check

## Rate Limiting

SlowAPI uses IP-based throttling with Redis storage.

- Strict AI endpoint protection: `5/minute` on `POST /optimize`
- Moderate read protection: `30/minute` on `GET /traffic`
- Exceeded limits return HTTP `429 Too Many Requests` with a structured error payload.

## Security and Stability Practices

- CORS restricted by `ALLOWED_ORIGINS`
- Environment-variable based secrets and service URLs
- Axios retry and centralized error handling in frontend
- Input validation via Pydantic models
- Service-layer AI integration (no direct AI calls in routes)
- Fallback local optimization when OpenRouter is unavailable

## AI + MCP Tool Flow

1. Frontend sends optimization request.
2. Backend validates request and gathers latest traffic data.
3. AI service sends a structured prompt and tool schema to OpenRouter.
4. Model selects tool calls.
5. Backend executes MCP tools and returns structured decision output:
   - congestion levels
   - predictions
   - optimized signal timing
6. UI renders AI summary and timing suggestions.

## Notes

- If Redis is unavailable, limiter falls back to in-memory mode so development remains functional.
- For production, run Redis and configure a strong `ALLOWED_ORIGINS` list.
