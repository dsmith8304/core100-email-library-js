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
  const lines = text.split('\n').map(line => line.trim());

  const salesLine = lines.find(l => l.startsWith("Sales$"));
  const profitLine = lines.find(l => l.startsWith("Profit$"));
  const marginLine = lines.find(l => l.includes("Contribution Margin"));

  if (!salesLine || !profitLine || !marginLine) return {};

  const sales = salesLine.match(/\$[\d,]+/g)?.map(v => parseInt(v.replace(/[$,]/g, '')));
  const profit = profitLine.match(/\$[\d,]+/g)?.map(v => parseInt(v.replace(/[$,]/g, '')));
  const margin = marginLine.match(/\d+\.\d+%/g);

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
    const regex = new RegExp(`${seg}[\\s\\S]{0,400}`, 'g');
    const match = text.match(regex);
    if (match) {
      const lines = match[0].split('\n').map(l => l.trim()).filter(Boolean);
      const priceLine = lines.find(l => l.toLowerCase().includes("price"));
      const ageLine = lines.find(l => l.toLowerCase().includes("age"));
      const reliabilityLine = lines.find(l => l.toLowerCase().includes("reliab"));
      const positionLine = lines.find(l => l.toLowerCase().includes("position"));

      result[seg] = {
        price: priceLine || null,
        age: ageLine || null,
        reliability: reliabilityLine || null,
        positioning: positionLine || null
      };
    } else {
      result[seg] = null;
    }
  });

  return result;
}


function extractProductPerformance(text) {
  const match = text.match(/Product Performance[\s\S]{0,1500}/i);
  if (!match) return {};

  const lines = match[0].split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return {};

  const products = {};

  for (let i = 1; i < lines.length; i++) {
    const row = lines[i].split(/\s+/);
    if (row.length < 6) continue; // Ensure we have enough columns

    const name = row[0];
    products[name] = {
      price: parseFloat(row[1]) || null,
      awareness: parseFloat(row[2]) || null,
      accessibility: parseFloat(row[3]) || null,
      forecast: parseInt(row[4]) || null,
      actual: parseInt(row[5]) || null
    };
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
  const match = text.match(/Emergency Loan[\s\S]{0,200}/i);
  if (!match) return result;

  const lines = match[0].split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return result;

  const dataLine = lines[1];
  if (!dataLine) return result;

  const values = dataLine.match(/\$[\d,]+/g);
  const companies = ["Andrews", "Baldwin", "Chester", "Digby", "Erie", "Ferris"];

  companies.forEach((company, i) => {
    result[company] = {
      emergency_loan: parseInt(values?.[i]?.replace(/[$,]/g, '') || '0')
    };
  });

  return result;
}

