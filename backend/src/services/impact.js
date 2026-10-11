/**
 * Environmental Impact Calculator
 * Multipliers for kg of CO2 emissions prevented per kg of material recycled:
 * - Metal (Iron, Steel, Copper, Alu): 1.5 kg CO2 / kg
 * - Plastic (PET, HDPE, LDPE): 1.8 kg CO2 / kg
 * - Cardboard & Paper: 0.9 kg CO2 / kg
 * - E-Waste (PCBs, IT assets): 2.0 kg CO2 / kg
 * - Other: 1.0 kg CO2 / kg
 */

const CO2_FACTORS = {
  metal: 1.5,
  plastic: 1.8,
  cardboard: 0.9,
  paper: 0.9,
  ewaste: 2.0,
  other: 1.0,
};

const calculateImpact = (category, quantity, unit = 'kg') => {
  const kg = unit === 'ton' ? quantity * 1000 : quantity;
  const factor = CO2_FACTORS[category] || 1.0;
  const co2SavedKg = Math.round(kg * factor * 10) / 10;

  return {
    kgRecycled: kg,
    co2SavedKg,
    factor,
    unit: 'kg',
    note: 'Estimated based on standard life-cycle industrial recycling emission reduction factors.',
  };
};

module.exports = { calculateImpact, CO2_FACTORS };
