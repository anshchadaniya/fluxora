const PriceHistory = require('../models/PriceHistory');

// Baseline fallback prices per kg in INR if history has not been seeded yet
const DEFAULT_BASE_PRICES = {
  metal: 42,
  plastic: 28,
  cardboard: 14,
  ewaste: 65,
  paper: 12,
  other: 15,
};

/**
 * Smart Price Estimation Service
 * Calculates fair market price based on historical 3-month average,
 * condition adjustment, and bulk lot discount.
 */
const estimatePrice = async ({ category, subCategory, quantity = 1, unit = 'kg', condition = 'clean' }) => {
  let basePrice = DEFAULT_BASE_PRICES[category] || 20;

  try {
    // Look up recent 3 records from PriceHistory
    const query = { category };
    if (subCategory && subCategory !== 'General') {
      query.subCategory = new RegExp(subCategory, 'i');
    }

    const records = await PriceHistory.find(query).sort({ month: -1 }).limit(3);
    if (records && records.length > 0) {
      const sum = records.reduce((acc, r) => acc + r.avgPricePerKg, 0);
      basePrice = Math.round((sum / records.length) * 100) / 100;
    }
  } catch (err) {
    console.warn('Could not query PriceHistory, using default baseline:', err.message);
  }

  // Condition adjustment
  let conditionFactor = 1.0;
  let conditionText = 'clean (+0%)';
  if (condition === 'mixed') {
    conditionFactor = 0.90; // -10%
    conditionText = 'mixed grade (-10%)';
  } else if (condition === 'contaminated') {
    conditionFactor = 0.75; // -25%
    conditionText = 'contaminated / unsorted (-25%)';
  }

  // Bulk discount for lots over 1 ton (1000 kg)
  const totalKg = unit === 'ton' ? quantity * 1000 : quantity;
  const isBulk = totalKg >= 1000;
  const bulkFactor = isBulk ? 0.97 : 1.0; // -3% for > 1 ton

  const adjustedPricePerKg = Math.round(basePrice * conditionFactor * bulkFactor * 100) / 100;
  const unitPrice = unit === 'ton' ? adjustedPricePerKg * 1000 : adjustedPricePerKg;

  const low = Math.round(unitPrice * 0.92);
  const high = Math.round(unitPrice * 1.08);

  const explanation = `Base rate ₹${basePrice}/kg based on recent market trends. Adjusted for ${conditionText}${
    isBulk ? ' and bulk volume discount (-3%)' : ''
  }. Estimated fair market range: ₹${low} - ₹${high} per ${unit}.`;

  return {
    estimatedPrice: unitPrice,
    low,
    high,
    unit,
    baseRatePerKg: basePrice,
    explanation,
  };
};

module.exports = { estimatePrice };
