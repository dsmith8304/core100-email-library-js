const fetch = require('node-fetch');
const pdf = require('pdf-parse');

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' query parameter" });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.buffer();
    const data = await pdf(buffer);

    res.status(200).json({
      report_url: url,
      preview_text: data.text.slice(0, 800) // Preview first 800 chars
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
