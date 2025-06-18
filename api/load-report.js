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
  const sectionMatch = text.match(/0\.2 High Level Overview\s+Andrews.*?\n([\s\S]+?)\n(?=Section 1|1\.3 Low Tech)/i);
  if (!sectionMatch) return {};

  const lines = sectionMatch[1].split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 6) return {};

  const [salesLine, profitLine, marginLine, priceLine, loanLine, shareLine] = lines;

  const headers = ['Andrews', 'Baldwin', 'Chester', 'Digby', 'Erie', 'Ferris'];
  const extractValues = (line, type = 'currency') => {
    const parts = line.match(/\$?\(?[\d,\.]+\)?%?/g) || [];
    return parts.slice(0, 6).map(raw => {
      let val = raw.replace(/[^\d\.\-]/g, '');
      let parsed = type === 'percent' ? parseFloat(val) : parseFloat(val.replace(/,/g, ''));
      return raw.includes('(') ? -parsed : parsed;
    });
  };

  const sales = extractValues(salesLine);
  const profit = extractValues(profitLine);
  const margin = extractValues(marginLine, 'percent');
  const stock = extractValues(priceLine);
  const loan = extractValues(loanLine);
  const share = extractValues(shareLine, 'percent');

  const result = {};
  headers.forEach((company, i) => {
    result[company] = {
      sales: sales[i],
      profit: profit[i],
      contribution_margin: margin[i],
      stock_price: stock[i],
      emergency_loan: loan[i],
      market_share: share[i]
    };
  });

  return result;
}




function extractSegmentCriteria(text) {
  const result = {};

  const extractBlock = (label, pattern) => {
    const match = text.match(pattern);
    if (!match) return;

    const block = match[1].trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (block.length < 4) return;

    const criteria = {};
    const importance = {};

    block.forEach(line => {
      if (line.includes('Price')) {
        const price = line.match(/\$[\d,.]+ - \$[\d,.]+/);
        const imp = line.match(/(\d+)%/);
        if (price) criteria.Price = price[0];
        if (imp) importance.Price = imp[1] + '%';
      } else if (line.includes('Age')) {
        const age = line.match(/(\d+)\s*Years?/);
        const imp = line.match(/(\d+)%/);
        if (age) criteria.Age = age[1] + ' Years';
        if (imp) importance.Age = imp[1] + '%';
      } else if (line.includes('Reliability')) {
        const rel = line.match(/(\d{2,3},?\d{3})\s*-\s*(\d{2,3},?\d{3})/);
        const imp = line.match(/(\d+)%/);
        if (rel) criteria.Reliability = `${rel[1]} - ${rel[2]} Hours`;
        if (imp) importance.Reliability = imp[1] + '%';
      } else if (line.includes('Positioning')) {
        const pos = line.match(/Performance\s+([\d.]+)\s+Size\s+([\d.]+)/i);
        const imp = line.match(/(\d+)%/);
        if (pos) criteria.Positioning = `Performance ${pos[1]} Size ${pos[2]}`;
        if (imp) importance.Positioning = imp[1] + '%';
      }
    });

    result[label] = {
      ...criteria,
      Importance: importance
    };
  };

  extractBlock("Low Tech", /1\.3 Low Tech\s+Customer Buying CriteriaExpectationsImportance\s+([\s\S]+?)\n1\.4 High Tech/i);
  extractBlock("High Tech", /1\.4 High Tech\s+Customer Buying CriteriaExpectationsImportance\s+([\s\S]+?)\n1\.5 Perceptual Map/i);

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

