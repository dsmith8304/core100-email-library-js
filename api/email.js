// First, we need to import our email data.
// The 'require' function loads the JSON file so we can use it in our code.
const emails = require('../Core100EmailLibrary.json');

// This is the main function that will run when someone visits our API endpoint.
// Vercel automatically provides the 'request' and 'response' objects.
export default function handler(request, response) {

  // Get the 'email_id' from the URL query parameters.
  // For a URL like /api/email?email_id=2.1, this will be "2.1".
  const { email_id } = request.query;

  // Look for the requested email_id as a key in our imported 'emails' object.
  const emailData = emails[email_id];

  // If we found an email with that ID...
  if (emailData) {
    // ...send a 200 OK status and the email data as a JSON response.
    response.status(200).json(emailData);
  } else {
    // ...otherwise, send a 404 Not Found status with an error message.
    response.status(404).json({ error: "Email not found", email_id: email_id });
  }
}