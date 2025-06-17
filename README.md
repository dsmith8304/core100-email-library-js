# core100-email-library-js
Fetches email descriptions for Caprai from Core100EmailLibrary.json. A lightweight, serverless API that serves CapsimCore Inbox emails from a structured JSON file. This project provides a simple endpoint to fetch email data by its ID.

## 🚀 What It Does

This API exposes a single endpoint to retrieve specific email details from the `Core100EmailLibrary.json` data source. It's designed for deterministic lookups, perfect for use with a front-end application or another service.

### Endpoint

The API exposes one primary endpoint:

`/api/email?email_id=x.y`

Where `x.y` is the ID of a specific email (e.g., `1.1`, `2.3`, etc.) as defined in the JSON file.

## 🛠️ Tech Stack

* **Node.js:** The JavaScript runtime environment.
* **Vercel:** For deployment and hosting via serverless functions.

The API returns the full email object, including character, introduction, response type, and options—designed for deterministic lookup from a GPT or other front-end.

📁 Files

├── api/
│   └── email.js             # The serverless function that handles the API logic
├── Core100EmailLibrary.json # Structured data source for all Core100 emails
├── package.json             # Project dependencies and scripts
└── README.md                # This file


## 🧪 Usage & Examples

### Local Development (in Codespaces)

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Run the local development server:**
    ```bash
    vercel dev
    ```
3.  **Send a request:** The server will run on a forwarded port. Use the URL provided by Codespaces in the "Ports" tab.

    ```bash
    # Replace the port number with the one Codespaces provides
    curl "[https://your-codespace-name-3000.app.github.dev/api/email?email_id=2.1](https://your-codespace-name-3000.app.github.dev/api/email?email_id=2.1)"
    ```

### Production Request

Once deployed, your URL will be provided by Vercel.

```bash
curl "[https://your-project-name.vercel.app/api/email?email_id=2.1](https://your-project-name.vercel.app/api/email?email_id=2.1)"
☁️ Deployment
Deployment is handled automatically by Vercel. Connect your GitHub repository to your Vercel account, and any push to the main branch will trigger a new deployment.

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
