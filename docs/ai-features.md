# Fluxora — Algorithmic & Zero-Cost AI Features Explained

Fluxora is engineered with **4 core intelligent features** designed to run on free environments without requiring paid external LLM subscriptions. They provide high practical value for scrap trading while remaining fully explainable during a college viva.

---

## 1. Smart Price Estimation Engine (`priceEstimator.js`)

### Problem Solved
In traditional scrap yards, pricing is completely opaque. Sellers often get underquoted because they do not know current market trends or standard volume discounts.

### How It Works (Algorithmic Logic)
1. **Historical Moving Baseline:** The engine queries the `PriceHistory` collection for the 3 most recent monthly records corresponding to the chosen material category (and subCategory if specified).
2. **Condition Adjustment:**
   - **Clean Grade:** Multiplier = `1.00` (+0% deduction, pristine virgin offcuts).
   - **Mixed Grade:** Multiplier = `0.90` (-10% deduction for sorting overhead).
   - **Contaminated Grade:** Multiplier = `0.75` (-25% deduction for cleaning/degreasing losses).
3. **Volume Bulk Incentive:**
   - If total weight is $\ge 1,000$ kg (or 1 metric ton), a bulk wholesale discount of -3% is applied (`factor = 0.97`).
4. **Tolerance Range:** The model returns a fair trading spread bounded at $\pm 8\%$ of the calculated unit price.
5. **Human Explanation:** Returns a plain-English explanation detailing exactly why that benchmark was recommended.

---

## 2. Scrap Material Classifier (`classifier.js`)

### Problem Solved
Factory scrap managers often do not know technical polymer codes (HDPE vs LDPE vs PET) or metallurgical classifications when typing short notes (e.g. *"old copper wire 500kg with slight grease"*).

### How It Works
1. **Rule-Based Tokenizer:** Analyzes input strings against a dictionary of industrial scrap keywords.
2. **Category & Sub-Type Mapping:**
   - Words like *"wire"*, *"busbar"*, *"copper"* map directly to `metal` & `Copper / Brass`.
   - Words like *"drum"*, *"pipe"*, *"hdpe"* map to `plastic` & `HDPE Rigid`.
   - Words like *"pcb"*, *"battery"*, *"motherboard"* map to `ewaste`.
3. **Condition & Quantity Extraction:**
   - Regex matches detect volume keywords (`500kg`, `3 ton`).
   - Words like *"grease"*, *"rust"*, *"oil"* flag the lot as `contaminated`.
4. **Zero-Key Execution:** Runs 100% locally in microsecond execution time.

---

## 3. Market Trend Analysis & Moving Average (`trendService.js`)

### Problem Solved
Scrap commodities fluctuate based on industrial demand. Recyclers need to anticipate price direction to decide whether to buy now or hold.

### How It Works
1. Pulls 12 consecutive months of historical scrap rates per category from `PriceHistory`.
2. Computes the month-over-month (MoM) percentage delta:
   $$\text{Change \%} = \frac{\text{Price}_{\text{current}} - \text{Price}_{\text{previous}}}{\text{Price}_{\text{previous}}} \times 100$$
3. **Simple Moving Average (SMA-3) Forecasting:**
   $$\hat{P}_{t+1} = \frac{P_t + P_{t-1} + P_{t-2}}{3}$$
   Provides a conservative, smoothed estimate of next month's price displayed dynamically on the interactive Recharts graph.

---

## 4. Environmental LCA Impact Calculator (`impact.js`)

### Problem Solved
Modern manufacturers need verified Scope-3 carbon emission reduction metrics to satisfy corporate ESG audits and pollution control standards.

### How It Works
Applies scientific Life Cycle Assessment (LCA) virgin material displacement multipliers:
- **Metal (Steel / Copper / Aluminium):** $1.5\text{ kg CO}_2\text{ saved per kg recycled}$
- **Plastics (PET / HDPE):** $1.8\text{ kg CO}_2\text{ saved per kg recycled}$
- **Cardboard / Kraft Paper:** $0.9\text{ kg CO}_2\text{ saved per kg recycled}$
- **E-Waste & Batteries:** $2.0\text{ kg CO}_2\text{ saved per kg recycled}$

Calculated automatically upon deal completion and credited to both buyer and seller sustainability dashboards.

---

## 5. Meta LLaMA 3.3 70B Cloud AI Integration (`openRouterService.js`)

### Architecture
Fluxora implements a **Hybrid AI Strategy**:
- **Primary AI (when `OPENROUTER_API_KEY` is configured):** Meta LLaMA 3.3 70B via OpenRouter API.
- **Graceful Fallback:** If internet is disconnected or API key is absent, all features seamlessly fall back to deterministic local rule-based algorithms.

### Supported LLaMA Capabilities:
1. **Intelligent Material Classification (`classifyWithLLaMA`):** Extracts category, polymer/alloy subCategory, contamination condition, and explains its technical metallurgical/chemical reasoning.
2. **Context-Aware Fair Price Valuation (`estimatePriceWithLLaMA`):** Combines historical regional rates with physical contamination deductions and wholesale lot discounts to generate fair buying/selling spreads and Gujarat regional market insights.
3. **Natural Language Scrap Search Parser (`parseMarketplaceQueryWithLLaMA`):** Converts free-form buyer prompts (e.g. *"Clean copper wire in Vadodara under 450 rs"*) into structured database query filters (`category`, `condition`, `city`, `maxPrice`).

