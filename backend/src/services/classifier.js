/**
 * Material Classifier Service
 * Pure JavaScript rule-based keyword matching with optional Gemini AI fallback.
 * Maps scrap descriptions to category, subCategory, condition, unit, and quantity.
 */

const KEYWORD_RULES = [
  // Metal
  { keywords: ['copper', 'brass', 'wire', 'cable'], category: 'metal', subCategory: 'Copper / Brass', defaultCondition: 'clean' },
  { keywords: ['iron', 'steel', 'rebar', 'sheet', 'angle', 'scrap metal', 'tmt'], category: 'metal', subCategory: 'Iron / Steel', defaultCondition: 'clean' },
  { keywords: ['aluminium', 'aluminum', 'can', 'casing', 'profile'], category: 'metal', subCategory: 'Aluminium', defaultCondition: 'clean' },
  { keywords: ['lead', 'zinc', 'tin', 'nickel'], category: 'metal', subCategory: 'Non-Ferrous', defaultCondition: 'clean' },

  // Plastic
  { keywords: ['pet', 'bottle', 'bottles', 'mineral water'], category: 'plastic', subCategory: 'PET Bottles', defaultCondition: 'clean' },
  { keywords: ['hdpe', 'drum', 'pipe', 'canister', 'crate'], category: 'plastic', subCategory: 'HDPE Rigid', defaultCondition: 'clean' },
  { keywords: ['ldpe', 'film', 'packaging wrap', 'polythene'], category: 'plastic', subCategory: 'LDPE Films', defaultCondition: 'clean' },
  { keywords: ['pvc', 'plumbing', 'conduit'], category: 'plastic', subCategory: 'PVC Scraps', defaultCondition: 'mixed' },
  { keywords: ['plastic', 'polypropylene', 'pp', 'polymer'], category: 'plastic', subCategory: 'Mixed Plastic', defaultCondition: 'mixed' },

  // Cardboard & Paper
  { keywords: ['corrugated', 'carton', 'box', 'boxes', 'cardboard', 'packaging'], category: 'cardboard', subCategory: 'Corrugated Boxes', defaultCondition: 'clean' },
  { keywords: ['newspaper', 'office paper', 'shredded', 'records', 'paper', 'notebooks'], category: 'paper', subCategory: 'Office & Kraft Paper', defaultCondition: 'clean' },

  // E-waste
  { keywords: ['pcb', 'motherboard', 'circuit board', 'ram', 'processor', 'cpu'], category: 'ewaste', subCategory: 'Printed Circuit Boards (PCBs)', defaultCondition: 'clean' },
  { keywords: ['computer', 'phone', 'laptop', 'desktop', 'monitor', 'keyboard', 'ups', 'server'], category: 'ewaste', subCategory: 'IT & Office Equipment', defaultCondition: 'mixed' },
  { keywords: ['battery', 'lead acid', 'lithium', 'ups battery'], category: 'ewaste', subCategory: 'Industrial Batteries', defaultCondition: 'mixed' },
  { keywords: ['ewaste', 'e-waste', 'electronic', 'appliance'], category: 'ewaste', subCategory: 'Consumer Electronics', defaultCondition: 'mixed' },
];

const classifyMaterial = async (text) => {
  if (!text || typeof text !== 'string') {
    return {
      category: 'other',
      subCategory: 'General Industrial Scrap',
      condition: 'clean',
      suggestedUnit: 'kg',
      confidence: 0.5,
      source: 'rule-based',
    };
  }

  const lower = text.toLowerCase();

  // Extract condition hints
  let condition = 'clean';
  if (lower.includes('contaminat') || lower.includes('dirt') || lower.includes('greas') || lower.includes('oil') || lower.includes('rust')) {
    condition = 'contaminated';
  } else if (lower.includes('mix') || lower.includes('unsorted') || lower.includes('various')) {
    condition = 'mixed';
  }

  // Extract quantity hints (e.g. "200 kg", "5 ton", "500kg")
  let quantity = null;
  let unit = 'kg';
  const qtyMatch = lower.match(/(\d+(?:\.\d+)?)\s*(kg|kgs|ton|tons|tonne|tonnes|quintal)?/);
  if (qtyMatch) {
    quantity = parseFloat(qtyMatch[1]);
    const u = qtyMatch[2] || '';
    if (u.includes('ton')) unit = 'ton';
  }

  // Match against rules
  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        return {
          category: rule.category,
          subCategory: rule.subCategory,
          condition: condition || rule.defaultCondition,
          quantity: quantity || 100,
          unit,
          confidence: 0.9,
          matchedKeyword: kw,
          source: 'rule-based',
        };
      }
    }
  }

  // Fallback defaults
  return {
    category: 'other',
    subCategory: 'Miscellaneous Scrap',
    condition,
    quantity: quantity || 100,
    unit,
    confidence: 0.6,
    source: 'rule-based',
  };
};

module.exports = { classifyMaterial };
