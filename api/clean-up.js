// Import the necessary libraries
const fetch = require('node-fetch');
const pdf = require('pdf-parse');

/**
 * Applies a series of cleaning rules to the raw text extracted from a PDF
 * to make it more consistent and easier to parse.
 * @param {string} rawText - The raw text content from pdf-parse.
 * @returns {string} The cleaned-up text.
 */
function normalizeText(rawText) {
  let text = rawText;

  // Rule: Replace the strange null character found in "Profit"
  text = text.replace(/Pro\u0000t/g, 'Profit');

  // Rule: Add a space before a dollar sign if one isn't there.
  // Example: 'Sales$56,681' -> 'Sales $56,681'
  text = text.replace(/([^\s])\$/g, '$1 $');
  
  // Rule: Only remove commas that are between two digits.
  // This looks for a digit, a comma, and another digit, and replaces just the comma.
  // We run this multiple times to handle numbers like 1,000,000
  text = text.replace(/(\d),(\d)/g, '$1$2');
  text = text.replace(/(\d),(\d)/g, '$1$2');

  // Rule: Add a space between letters and numbers.
  // Example: 'Baldwin21.7%' -> 'Baldwin 21.7%'
  text = text.replace(/([a-zA-Z])(\d)/g, '$1 $2');
  
  // Rule: Add a space between numbers and letters.
  // Example: '100%Customer' -> '100% Customer'
  text = text.replace(/(\d)([a-zA-Z])/g, '$1 $2');

  // Rule: Add a space before a percentage sign if one isn't there.
  // Example: '...word25%' -> '...word 25%'
  text = text.replace(/([^\s])%/g, '$1 %');
  
  // Rule: Add a space before an opening parenthesis.
  // Example: 'Profit($1,339)' -> 'Profit ($1,339)'
  text = text.replace(/([^\s])\(/g, '$1 (');

  return text;
}

// Export the main serverless function
module.exports = async (req, res) => {
  // Get the 'url' that the user provides in the query string
  const { url } = req.query;

  // If no URL is provided, return a 400 Bad Request error
  if (!url) {
    return res.status(400).json({ error: "Missing 'url' query parameter" });
  }

  try {
    // 1. Fetch the PDF file from the provided URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    // 2. Get the raw data (buffer) from the response
    const buffer = await response.buffer();
    
    // 3. Feed the PDF buffer into the pdf-parse library to extract text
    const data = await pdf(buffer);

    // 4. Apply our new text cleaning function to the raw text
    const normalizedText = normalizeText(data.text);

    // 5. If successful, send a 200 OK status with the cleaned text
    // Set a plain text header so the browser displays it nicely
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(normalizedText);

  } catch (error) {
    // If any error occurred, send a 500 Internal Server Error
    res.status(500).json({ error: error.message });
  }
};
