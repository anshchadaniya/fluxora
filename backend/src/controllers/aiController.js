const { estimatePrice } = require('../services/priceEstimator');
const { classifyMaterial } = require('../services/classifier');
const {
  classifyWithLLaMA,
  estimatePriceWithLLaMA,
  parseMarketplaceQueryWithLLaMA,
} = require('../services/openRouterService');

// @desc    Get AI price estimation based on category, condition, quantity
// @route   POST /api/ai/estimate-price
// @access  Public
exports.getEstimate = async (req, res, next) => {
  try {
    const { category, subCategory, quantity, unit, condition } = req.body;

    if (!category) {
      return res.status(400).json({ success: false, message: 'Please provide a material category' });
    }

    // Baseline calculation from database / rule engine
    const baselineEstimate = await estimatePrice({ category, subCategory, quantity, unit, condition });

    // If OpenRouter API key is configured, enrich with Meta LLaMA 3.3 70B
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const llamaEstimate = await estimatePriceWithLLaMA({
          category,
          subCategory,
          quantity: Number(quantity) || 1,
          unit: unit || 'kg',
          condition: condition || 'clean',
          baseRatePerKg: baselineEstimate.baseRatePerKg,
        });

        return res.json({
          success: true,
          data: {
            ...llamaEstimate,
            ruleBaselineRate: baselineEstimate.baseRatePerKg,
          },
        });
      } catch (aiErr) {
        console.warn('OpenRouter estimate failed, using rule-based baseline:', aiErr.message);
      }
    }

    // Fallback to rule-based estimate
    res.json({
      success: true,
      data: {
        ...baselineEstimate,
        source: 'rule-based',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Classify scrap material from description text
// @route   POST /api/ai/classify
// @access  Public
exports.classify = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'Please provide material text description' });
    }

    // If OpenRouter API key is configured, classify with Meta LLaMA 3.3 70B
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const llamaResult = await classifyWithLLaMA(text);
        if (llamaResult && llamaResult.category) {
          return res.json({
            success: true,
            data: llamaResult,
          });
        }
      } catch (aiErr) {
        console.warn('OpenRouter classify failed, using rule-based fallback:', aiErr.message);
      }
    }

    // Fallback to local rule-based classifier
    const classification = await classifyMaterial(text);

    res.json({
      success: true,
      data: classification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Parse natural language search query using LLaMA into structured marketplace filters
// @route   POST /api/ai/parse-search
// @access  Public
exports.parseSearch = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a search prompt' });
    }

    // If OpenRouter API key is configured, parse with Meta LLaMA 3.3 70B
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const parsed = await parseMarketplaceQueryWithLLaMA(query.trim());
        if (parsed) {
          return res.json({
            success: true,
            data: parsed,
          });
        }
      } catch (aiErr) {
        console.warn('OpenRouter query parser failed, falling back to keywords:', aiErr.message);
      }
    }

    // Fallback rule parser
    const lower = query.toLowerCase();
    let category = 'all';
    for (const cat of ['metal', 'plastic', 'cardboard', 'ewaste', 'paper']) {
      if (lower.includes(cat)) {
        category = cat;
        break;
      }
    }

    let condition = 'all';
    if (lower.includes('clean')) condition = 'clean';
    else if (lower.includes('contaminat') || lower.includes('rust') || lower.includes('greas')) condition = 'contaminated';
    else if (lower.includes('mix')) condition = 'mixed';

    let city = 'all';
    for (const c of ['Ahmedabad', 'Vadodara', 'Surat', 'Rajkot', 'Ankleshwar', 'Bhavnagar']) {
      if (lower.includes(c.toLowerCase())) {
        city = c;
        break;
      }
    }

    res.json({
      success: true,
      data: {
        search: query.trim(),
        category,
        condition,
        city,
        maxPrice: null,
        summary: `Filters applied for "${query.trim()}"`,
        source: 'rule-based',
      },
    });
  } catch (error) {
    next(error);
  }
};
