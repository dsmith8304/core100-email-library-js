# core100-email-library-js
Fetches email descriptions for Caprai from Core100EmailLibrary.json. This is a lightweight Flask-based API that serves CapsimCore Inbox emails from a structured JSON file.

🔍 What It Does
This API exposes a single endpoint:

Where x.y is the ID of a specific email (e.g., 1.1, 2.3, etc.) as defined in the Core100EmailLibrary.json file.

The API returns the full email object, including character, introduction, response type, and options—designed for deterministic lookup from a GPT or other front-end.

📁 Files
Core100EmailLibrary.json — Structured data source for all Core100 emails.
app.py — Flask server code to load and serve the email data.
🧪 Sample Request
curl "http://localhost:5000/email?email_id=2.1"

    {
    "email_id": "2.1",
    "subject": "Let's get everything set up",
    "introduction": "Welcome to Practice Round 1! I am ready to go.",
    "report_url": "https://core100-email-api.vercel.app/reports/Round0.pdf",
    "character": "Caprai",
    "email_summary": "Caprai welcomes the CEO to their new job at Andrews Corporation.",
    "skills": "Strategy",
    "response_type": "multiple choice",
    "response_options": [
    "Continue"
    ]
    },
