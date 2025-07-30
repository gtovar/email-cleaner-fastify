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

def months_ago(date_str: str, now: datetime) -> int:
    d = parsedate_to_datetime(date_str)
    return (now.year - d.year) * 12 + (now.month - d.month)

def days_ago(date_str: str, now: datetime) -> int:
    d = parsedate_to_datetime(date_str)
    return (now - d).days

@app.post("/suggest")
async def suggest(emails: List[Email]):
    now = datetime.now().astimezone()
    suggestions = {}

    for email in emails:
        sug = []
        if not email.isRead and months_ago(email.date, now) >= 12:
            sug.append("suggested-delete")
        if email.category == "promotions" and months_ago(email.date, now) >= 6:
            sug.append("suggested-archive")
        if email.attachmentSizeMb > 10 and months_ago(email.date, now) >= 12:
            sug.append("suggested-move-big-attachments")
        if days_ago(email.date, now) <= 3:
            sug.append("suggested-review-recent")

        suggestions[email.id] = sug

    return [
        {
            **email.dict(by_alias=True),
            "suggestions": suggestions[email.id]
        }
        for email in emails
    ]
