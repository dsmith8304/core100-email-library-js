const fetch = require('node-fetch');
const pdf = require('pdf-parse');

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing 'url' query parameter" });
  }

  try {
    const response = await fetch(url);
    const buffer = await response.buffer();
    const data = await pdf(buffer);
    const text = data.text;

    const summary = {
      high_level: extractHighLevel(text),
      segment_criteria: extractSegmentCriteria(text),
      products: extractProductPerformance(text),
      marketing: extractMarketing(text),
      production: extractProduction(text),
      finance: extractFinance(text)
    };

    res.status(200).json({
      report_url: url,
      summary,
      raw_text: text
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// === Extraction Modules ===

function extractHighLevel(text) {
  const block = text.match(/Sales\$.*?Emergency Loan.*?\n/);
  if (!block) return {};
  const lines = block[0].split('\n').map(l => l.trim());
  const sales = lines[0]?.match(/\$[\d,]+/g)?.map(v => parseInt(v.replace(/[$,]/g, '')));
  const profit = lines[1]?.match(/\$[\d,]+/g)?.map(v => parseInt(v.replace(/[$,]/g, '')));
  const margin = lines[2]?.match(/\d+\.\d+%/g);
  const companies = ["Andrews", "Baldwin", "Chester", "Digby", "Erie", "Ferris"];

  const result = {};
  companies.forEach((name, i) => {
    result[name] = {
      sales: sales?.[i] || null,
      profit: profit?.[i] || null,
      margin: margin?.[i] || null
    };
  });
  return result;
}

function extractSegmentCriteria(text) {
  const segments = ["Low Tech", "High Tech"];
  const result = {};
  segments.forEach(seg => {
    const regex = new RegExp(`${seg}.*?Customer Buying Criteria[\\s\\S]{0,500}`, 'g');
    const match = text.match(regex);
    if (match) {
      const lines = match[0].split('\n').filter(Boolean);
      result[seg] = {
        price: lines.find(l => l.includes("Price")),
        age: lines.find(l => l.includes("Age")),
        reliability: lines.find(l => l.includes("Reliab")),
        positioning: lines.find(l => l.includes("Position"))
      };
    }
  });
  return result;
}

function extractProductPerformance(text) {
  const productBlock = text.match(/Product Performance[\s\S]{0,1500}/i);
  if (!productBlock) return {};
  const lines = productBlock[0].split('\n').filter(Boolean);
  const products = {};
  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(/\s+/);
    const name = row[0];
    if (!products[name]) {
      products[name] = {
        price: parseFloat(row[1]),
        awareness: parseFloat(row[2]),
        accessibility: parseFloat(row[3]),
        forecast: parseInt(row[4]),
        actual: parseInt(row[5])
      };
    }
  }
  return products;
}

function extractMarketing(text) {
  const market = {};
  const match = text.match(/Marketing Summary[\s\S]{0,1000}/);
  if (!match) return market;
  const lines = match[0].split('\n').filter(Boolean);
  lines.forEach(line => {
    const parts = line.split(/\s+/);
    if (parts.length >= 4 && parts[0] !== 'Product') {
      market[parts[0]] = {
        awareness: parseFloat(parts[1]),
        accessibility: parseFloat(parts[2]),
        promotion: parseFloat(parts[3])
      };
    }
  });
  return market;
}

function extractProduction(text) {
  const result = {};
  const match = text.match(/Inventory.*?Units Available.*?\n.*?\n/);
  if (!match) return result;
  const lines = match[0].split('\n').filter(Boolean);
  lines.forEach(line => {
    const [name, inventory, unitsAvailable] = line.split(/\s+/);
    result[name] = {
      inventory: parseInt(inventory),
      capacity: parseInt(unitsAvailable)
    };
  });
  return result;
}

function extractFinance(text) {
  const result = {};
  const loanMatch = text.match(/Emergency Loan.*?\n.*?\n/);
  if (loanMatch) {
    const line = loanMatch[1];
    const parts = line.match(/\$[\d,]+/g);
    const companies = ["Andrews", "Baldwin", "Chester", "Digby", "Erie", "Ferris"];
    companies.forEach((c, i) => {
      result[c] = {
        emergency_loan: parseInt(parts?.[i]?.replace(/[$,]/g, '') || '0')
      };
    });
  }
  return result;
}
