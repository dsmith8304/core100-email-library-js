// Use CommonJS 'require' to load the JSON data.
// This assumes Core100EmailLibrary.json is in the SAME 'api' folder.
const emails = require('./Core100EmailLibrary.json');

// Use CommonJS 'module.exports' to define the function Vercel will run.
// This is the "front door" that Vercel is looking for.
module.exports = (request, response) => {
  
  // Get the 'email_id' from the URL query parameters.
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
};