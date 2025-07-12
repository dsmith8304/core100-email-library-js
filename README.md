Caprai Email Lookup System - Technical Overview
📚 Overview
Caprai uses an API action called core100-email-library-js.vercel.app to look up email prompts by ID. These emails are part of a structured dataset that includes fields like:
- introduction
- character
- subject
- email_summary
- response_type
- response_options
Example email entry from the database:
"2.1": {
  "email_id": "2.1",
  "subject": "Let's get everything set up",
  "introduction": "Welcome to Practice Round 1! I am ready to go.",
  "report_url": "https://core100-email-api.vercel.app/reports/Round0.pdf",
  "character": "Caprai",
  "email_summary": "Caprai welcomes the CEO to their new job at Andrews Corporation.",
  "skills": "Strategy",
  "response_type": "multiple choice",
  "response_options": ["Continue"]
}
When the user enters something like “email 2.1”, Caprai sends a query to the API and retrieves this email’s metadata. It uses that data to format a reply—and to switch into the voice of the specified character.
🔁 There Are Three Main Components
1. 🧾 The OpenAPI Schema (in the GPT Builder)
This is a machine-readable API definition stored in Caprai's GPT configuration. It tells Caprai:
- The server to call (https://core100-email-library-js.vercel.app)
- The endpoint to hit (/api/email)
- What parameters to send (email_id)
- What data to expect back

This schema appears in the GPT’s Actions tab when editing Caprai.
2. 🧠 The App Code (on GitHub)
This is a small JavaScript API hosted in the GitHub repository:
https://github.com/dsmith8304/core100-email-library-js

It contains:
- email-data.js — a JavaScript object with all email entries
- email.js — the API handler that returns email data by ID
3. 🌐 Vercel (Deployment Platform)
Vercel hosts and deploys the API.

- Changes pushed to the main branch of the GitHub repo are automatically deployed
- Caprai always accesses the latest version of the data
Example live API call:
https://core100-email-library-js.vercel.app/api/email?email_id=2.1
✨ Summary
Element	Role
email-data.js	Stores the emails in a JavaScript object
email.js	Serves one email by ID
GitHub Repo	Where edits are made
Vercel	Builds and hosts the app (auto-deploys on push)
OpenAPI Schema	Tells Caprai how to talk to the API
 
✏️ How to Add or Edit Email Descriptions
All email entries are stored in a single file called `email-data.js` located inside the `/api` folder of the GitHub repository.

Each email is represented as a JavaScript object with a unique ID (like "2.1"). These objects are stored as key-value pairs in a larger `module.exports` object.
🔧 To Add a New Email
1. Open the `email-data.js` file in the GitHub repository.
2. Scroll to the bottom of the existing entries.
3. Copy an existing email block and paste it below the last one.
4. Change the key (e.g. "3.1") and update the fields:
   - `email_id`
   - `subject`
   - `introduction`
   - `report_url` (if applicable)
   - `character`
   - `email_summary`
   - `skills`
   - `response_type`
   - `response_options`
5. Double-check your punctuation:
   - All keys and string values must be wrapped in quotes (`"`)
   - No trailing commas after the last field in each object
6. Save and commit your changes to the `main` branch.

Once pushed, the update will automatically deploy via Vercel and become available to Caprai immediately.
🛠 Example Entry
"3.1": {
  "email_id": "3.1",
  "subject": "A New Perspective",
  "introduction": "Alright then—let’s see how you think under pressure...",
  "report_url": "https://core100-email-api.vercel.app/reports/Round0.pdf",
  "character": "Hagrid",
  "email_summary": "Hagrid offers coaching on strategic thinking and resilience.",
  "skills": "Leadership",
  "response_type": "multiple choice",
  "response_options": ["Continue"]
}
🧼 Optional Cleanup
If removing or replacing an email:
- Delete the entire block for that ID
- Be careful to preserve commas between items
- Make sure the structure remains valid JavaScript
 
🔐 Access & Login Instructions
GitHub
- URL: https://github.com/dsmith8304/core100-email-library-js
- Log in using to GitHub account: username dsmith8304@yahoo.com password 55EMonroe!
- All edits to the API code and email database happen here
Vercel
- URL: https://vercel.com
- Log in with the same GitHub account (Vercel is linked to GitHub)
- Project name: core100-email-library-js
- Use Vercel to:
  • View deployments
  • Access logs
  • See your live API URL
🛠 Maintaining the Code
Here’s what to know to keep the system running smoothly:
1. To Edit or Add Emails
- Open `api/email-data.js`
- Follow the steps in the 'How to Add/Edit' section above
- Save and commit to the main branch
- Vercel will auto-deploy the latest version
2. To Modify the API Logic
- Edit `api/email.js`
- Only do this if you need to change how email lookups work (e.g., filtering or structure)
3. To View Live API Output
- Use a browser or terminal to visit:
  https://core100-email-library-js.vercel.app/api/email?email_id=2.1
4. To Check if Deployment Worked
- Go to Vercel → select the project → open the 'Deployments' tab
- A green ✅ means success
- Click into a build to see logs if something goes wrong

Appendix: Full GitHub README
# core100-email-library-js
Fetches email descriptions for Caprai from email-data.js. A lightweight, serverless API that serves CapsimCore Inbox emails from a structured JavaScript object. This project provides a simple endpoint to fetch email data by its ID.
## 🚀 What It Does
This API exposes a single endpoint to retrieve specific email details from the `email-data.js` source. It's designed for deterministic lookups, perfect for use with a front-end application or another service like Caprai.
### Endpoint
The API exposes one primary endpoint:
`/api/email?email_id=x.y`
Where `x.y` is the ID of a specific email (e.g., `1.1`, `2.3`, etc.) as defined in the JavaScript object.
## 🛠️ Tech Stack
* **Node.js:** The JavaScript runtime environment.
* **Vercel:** For deployment and hosting via serverless functions.
The API returns the full email object, including character, introduction, response type, and options—designed for deterministic lookup from a GPT or other front-end.
📁 Files
├── api/
│   ├── email.js          # The serverless function that handles the API logic
│   └── email-data.js     # The structured data source (JavaScript object)
├── public/               # Static reports or files
├── package.json          # Project dependencies and scripts
└── README.md             # This file
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
    curl "https://your-codespace-name-3000.app.github.dev/api/email?email_id=2.1"
    ```
### Production Request
Once deployed, your URL will be provided by Vercel.
```bash
curl "https://core100-email-library-js.vercel.app/api/email?email_id=2.1"
```
## ☁️ Deployment
Deployment is handled automatically by Vercel. Connect your GitHub repository to your Vercel account, and any push to the main branch will trigger a new deployment.

