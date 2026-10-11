const PriceHistory = require('../models/PriceHistory');

/**
 * Trend Analysis Service
 * Aggregates 12 months historical data and predicts next month price
 * using a 3-month simple moving average (SMA).
 */
const getTrendsByCategory = async (category = 'metal') => {
  let records = [];

  try {
    records = await PriceHistory.find({ category }).sort({ month: 1 });
  } catch (err) {
    console.warn('PriceHistory query error:', err.message);
  }

  // Fallback demo trends if collection is empty
  if (!records || records.length === 0) {
    const months = [
      '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04',
      '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10',
    ];
    const base = category === 'metal' ? 40 : category === 'plastic' ? 26 : category === 'cardboard' ? 13 : category === 'ewaste' ? 62 : 18;
    records = months.map((m, idx) => ({
      month: m,
      avgPricePerKg: Math.round((base + Math.sin(idx) * 3 + idx * 0.4) * 10) / 10,
    }));
  }

  // Calculate percent change vs last month
  const history = records.map((r, i) => {
    let changePct = 0;
    if (i > 0) {
      const prev = records[i - 1].avgPricePerKg;
      changePct = Math.round(((r.avgPricePerKg - prev) / prev) * 1000) / 10;
    }
    return {
      month: r.month,
      avgPricePerKg: r.avgPricePerKg,
      changePct,
    };
  });

  // 3-month moving average prediction for next month
  let nextMonthEstimate = 0;
  if (history.length >= 3) {
    const last3 = history.slice(-3);
    const sum = last3.reduce((acc, curr) => acc + curr.avgPricePerKg, 0);
    nextMonthEstimate = Math.round((sum / 3) * 10) / 10;
  } else if (history.length > 0) {
    nextMonthEstimate = history[history.length - 1].avgPricePerKg;
  }

  const latest = history[history.length - 1] || { avgPricePerKg: 0, changePct: 0 };

  return {
    category,
    currentPrice: latest.avgPricePerKg,
    lastMonthChange: latest.changePct,
    nextMonthEstimate,
    history,
  };
};

module.exports = { getTrendsByCategory };
