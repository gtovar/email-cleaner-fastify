from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List
from datetime import datetime
from email.utils import parsedate_to_datetime


app = FastAPI()

class Email(BaseModel):
    id: str
    subject: str
    from_: str = Field(..., alias="from")
    date: str
    isRead: bool
    category: str
    attachmentSizeMb: float

from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

def _parse_email_date(date_str: str) -> datetime:
    d = parsedate_to_datetime(date_str)
    # Normalizamos todo a UTC aware
    if d.tzinfo is None:
        d = d.replace(tzinfo=timezone.utc)
    else:
        d = d.astimezone(timezone.utc)
    return d

def months_ago(date_str: str, now: datetime) -> int:
    d = _parse_email_date(date_str)
    # 'now' también debe ser UTC-aware
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    else:
        now = now.astimezone(timezone.utc)
    # diferencia aproximada en meses
    return (now.year - d.year) * 12 + (now.month - d.month)

def days_ago(date_str: str, now: datetime) -> int:
    d = _parse_email_date(date_str)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    else:
        now = now.astimezone(timezone.utc)
    return (now - d).days

@app.post("/v1/suggest")
async def suggest(emails: List[Email]):
    now = datetime.now(timezone.utc)  # importante: aware
    suggestions = {}

    for email in emails:
        sug = []
        if not email.isRead and months_ago(email.date, now) >= 12:
            sug.append({
                "action": "delete",
                "classification": "stale_unread",
                "confidence_score": 0.9
            })
        if email.category == "promotions" and months_ago(email.date, now) >= 6:
            sug.append({
                "action": "archive",
                "classification": "promotions_old",
                "confidence_score": 0.85
            })
        if email.attachmentSizeMb > 10 and months_ago(email.date, now) >= 12:
            sug.append({
                "action": "move",
                "classification": "large_attachments_old",
                "confidence_score": 0.8
            })
        if days_ago(email.date, now) <= 3:
            sug.append({
                "action": "review",
                "classification": "recent",
                "confidence_score": 0.7
            })

        suggestions[email.id] = sug

    return [
        {
            **email.dict(by_alias=True),
            "suggestions": suggestions[email.id]
        }
        for email in emails
    ]
