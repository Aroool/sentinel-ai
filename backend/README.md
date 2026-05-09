# SentinelAI Backend

FastAPI service that exposes the `/analyze` risk classification endpoint.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/analyze` | Classify a developer action |

### POST /analyze

**Request**
```json
{ "input": "git push origin main" }
```

**Response**
```json
{
  "action": "Direct Push to Main Branch",
  "risk": "HIGH",
  "category": "Version Control",
  "reason": ["..."],
  "recommendation": "..."
}
```

`risk` is one of: `LOW` | `MEDIUM` | `HIGH` | `CRITICAL`

## Notes

The frontend uses a built-in TypeScript classifier as its primary engine so it always works offline. The backend is optional — wire it up if you want server-side logging, AI-powered analysis, or multi-tenant policy enforcement.
