/**
 * OpenRouter AI Service
 * Powered by Meta LLaMA 3.3 70B (or configured model)
 * Provides cloud LLM intelligence for scrap classification, fair-price estimation,
 * and marketplace natural language semantic search.
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const callOpenRouter = async (messages, temperature = 0.2) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured in .env');
  }

  const model = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
      'X-Title': 'Fluxora Industrial Scrap Marketplace',
    },
    body: JSON.stringify({
      model,
      temperature,
      messages,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from OpenRouter LLaMA model');
  }

  return content;
};

// Clean and parse JSON from LLM response
const cleanJson = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (e) {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
};

/**
 * 1. AI Scrap Material Classifier using LLaMA
 */
const classifyWithLLaMA = async (text) => {
  const prompt = `You are an expert industrial scrap and recycling materials classifier for the Indian manufacturing sector (Gujarat clusters).
Analyze this scrap lot description: "${text}"

Map the material into the exact Fluxora schema. You must output ONLY a valid JSON object matching this schema:
{
  "category": "metal" | "plastic" | "cardboard" | "ewaste" | "paper" | "other",
  "subCategory": "string describing alloy, polymer grade, or material type (e.g. Copper / Brass, Iron / Steel, Aluminium, HDPE Rigid, PET Bottles, Corrugated Boxes, Printed Circuit Boards)",
  "condition": "clean" | "mixed" | "contaminated",
  "quantity": number or null,
  "unit": "kg" | "ton",
  "confidence": number between 0.70 and 0.99,
  "reasoning": "brief 1-sentence technical explanation of why this classification was assigned",
  "source": "llama-3.3-70b"
}

Rule:
- "contaminated" if words like rust, grease, oil, dirty, burnt, or unsorted appear.
- "mixed" if multiple grades, varieties, or mixed scrap appear.
- "clean" if sorted, pure, clean offcuts, or unadulterated.
Output ONLY the JSON object.`;

  const raw = await callOpenRouter([
    { role: 'system', content: 'You are an industrial scrap classification AI that strictly responds in valid JSON.' },
    { role: 'user', content: prompt },
  ]);

  const parsed = cleanJson(raw);
  parsed.source = 'llama-3.3-70b';
  return parsed;
};

/**
 * 2. Smart Price Estimation using LLaMA
 */
const estimatePriceWithLLaMA = async ({ category, subCategory, quantity = 1, unit = 'kg', condition = 'clean', baseRatePerKg = 40 }) => {
  const prompt = `You are a commodity scrap valuation expert for industrial clusters in western India (Gujarat: Ahmedabad, Vadodara, Surat, Rajkot).
Analyze the fair procurement price for this scrap lot:
- Material Category: ${category}
- Sub-type / Alloy: ${subCategory || 'Standard Grade'}
- Batch Quantity: ${quantity} ${unit}
- Purity / Condition: ${condition}
- Historical Regional Baseline Rate: ₹${baseRatePerKg}/kg

Consider:
- Physical condition: Clean = +0% deduction; Mixed = -10% deduction for sorting overhead; Contaminated = -25% deduction for cleaning/degreasing losses.
- Bulk lot discount: Lots >= 1000 kg (or >= 1 ton) receive a -3% wholesale incentive.
- Standard market tolerance: +/- 8% spread around the estimated benchmark price.

Output ONLY a valid JSON object matching this exact schema:
{
  "estimatedPrice": number (fair price per ${unit}, rounded to 2 decimals),
  "low": number (lower bound fair range per ${unit}),
  "high": number (upper bound fair range per ${unit}),
  "unit": "${unit}",
  "baseRatePerKg": ${baseRatePerKg},
  "explanation": "concise 2-sentence market explanation detailing baseline rate, grade adjustments, and fair procurement recommendation",
  "marketInsight": "brief note on current demand and regional industrial recycling trends",
  "source": "llama-3.3-70b"
}
Output ONLY the JSON object.`;

  const raw = await callOpenRouter([
    { role: 'system', content: 'You are an industrial scrap pricing AI that strictly responds in valid JSON.' },
    { role: 'user', content: prompt },
  ]);

  const parsed = cleanJson(raw);
  parsed.source = 'llama-3.3-70b';
  return parsed;
};

/**
 * 3. Natural Language Marketplace Search Parser using LLaMA
 * Converts buyer natural language prompts into structured query filters.
 */
const parseMarketplaceQueryWithLLaMA = async (queryText) => {
  const prompt = `You are an intelligent search assistant for the Fluxora Industrial Scrap Marketplace.
A buyer entered this natural language search request: "${queryText}"

Convert their request into structured marketplace filters. The valid categories are: "all", "metal", "plastic", "cardboard", "ewaste", "paper", "other".
Valid conditions are: "all", "clean", "mixed", "contaminated".
Valid Gujarat cities: "all", "Ahmedabad", "Vadodara", "Surat", "Rajkot", "Ankleshwar", "Bhavnagar", "Jamnagar", "Gandhinagar".

Output ONLY a valid JSON object matching this schema:
{
  "search": "specific keyword for search (or empty string)",
  "category": "metal" | "plastic" | "cardboard" | "ewaste" | "paper" | "other" | "all",
  "condition": "clean" | "mixed" | "contaminated" | "all",
  "city": "string name of city or 'all'",
  "maxPrice": number or null,
  "summary": "1-sentence friendly confirmation of what filters were applied",
  "source": "llama-3.3-70b"
}
Output ONLY the JSON object.`;

  const raw = await callOpenRouter([
    { role: 'system', content: 'You are a search query parser that strictly responds in valid JSON.' },
    { role: 'user', content: prompt },
  ]);

  const parsed = cleanJson(raw);
  parsed.source = 'llama-3.3-70b';
  return parsed;
};

module.exports = {
  callOpenRouter,
  classifyWithLLaMA,
  estimatePriceWithLLaMA,
  parseMarketplaceQueryWithLLaMA,
};
