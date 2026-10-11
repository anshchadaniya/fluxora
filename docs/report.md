# FLUXORA: SMART INDUSTRIAL WASTE MARKETPLACE
## Comprehensive Final Year College Project Report

---

### Abstract
Rapid industrialization across developing economies generates enormous quantities of recyclable byproduct waste—including metal offcuts, polymer scrap, packaging cardboard, and obsolete electronic assets. However, the secondary raw material supply chain remains plagued by informational asymmetry, opaque pricing, and exploitative intermediaries. **Fluxora** is an end-to-end B2B digital marketplace engineered to connect manufacturing plants directly with certified recyclers and re-processors. Developed on the MERN stack (MongoDB, Express.js, React, Node.js) with an algorithmic artificial intelligence engine, Fluxora eliminates middleman commissions, standardizes market pricing through historical moving averages, accelerates proximity discovery using the mathematical Haversine formula, and quantifies environmental sustainability by calculating Life Cycle Assessment (LCA) Scope-3 carbon savings.

---

### 1. Introduction
Industrial manufacturing inherently produces solid surplus byproducts. In industrial clusters such as Gujarat (Vadodara, Ahmedabad, Surat, and Rajkot), thousands of small-to-medium enterprises (SMEs) generate recurring scrap. Currently, this scrap is sold through unorganized, informal channels where scrap generators have little bargaining power and zero visibility into fair market rates. 

Fluxora introduces a structured, digital-first marketplace designed specifically for B2B scrap transactions. It automates cataloging, bidding, price estimation, communications, and green impact reporting within a free-tier, beginner-readable architecture.

---

### 2. Problem Statement
The secondary industrial materials sector suffers from four systemic deficiencies:
1. **Absence of a Centralized Scrap Exchange:** No single verified platform exists for manufacturers to list industrial scrap lots.
2. **High Intermediary Margins:** Unorganized scrap dealers capture up to 30–40% of the material value, reducing revenues for scrap generators while driving up raw material costs for recyclers.
3. **Price Opadity & Information Asymmetry:** Sellers have no access to historical commodity pricing or grade-adjusted valuation standards.
4. **Lack of Trust & Fraud Risk:** Trading with unverified entities often leads to payment defaults, weighment fraud, and non-compliance with environmental norms.
5. **No Quantifiable Sustainability Tracking:** Enterprises lack formal documentation proving their circular waste redirection for ESG and environmental compliance.

---

### 3. Existing System
The existing methodology relies entirely on informal, offline transactions:
- **Phone Calls & Physical Visits:** Industrial plant managers contact a small circle of local scrap dealers.
- **Subjective Spot Quotes:** Scrap dealers inspect yards and offer subjective prices based on visual inspection with arbitrary deductions.
- **Paper Slips & Manual Ledgers:** Negotiations and weight receipts are recorded on paper slips or verbal agreements.
- **Restricted Local Trading:** Waste cannot be easily matched with distant buyers who might offer significantly higher prices.

---

### 4. Limitations of the Existing System
- **Severe Financial Inefficiency:** Industries lose significant scrap revenue to local brokers.
- **Inventory Congestion:** Scrap accumulation occupies valuable production floor space.
- **Regulatory & Environmental Non-Compliance:** Unverified buyers may dump non-recyclable fractions illegally into municipal landfills.
- **Zero Real-Time Negotiation Capability:** Haggling is slow, manual, and unrecorded.

---

### 5. Proposed System — Fluxora
Fluxora replaces fragmented offline transactions with a unified digital ecosystem:
- **Open, Searchable Marketplace:** Categorized listings for Metals, Plastics, Cardboard, E-Waste, Paper, and Miscellaneous scrap.
- **Admin Verification (KYC):** Industrial sellers and recycling firms undergo administrative approval, receiving a public "Verified" badge.
- **Algorithmic Smart Pricing:** An embedded AI engine computes fair-market rates based on 3-month moving averages, condition discounts (clean, mixed, contaminated), and bulk volume discounts.
- **Proximity Discovery:** Mathematical Haversine calculations compute yard distances in kilometers without requiring paid third-party maps.
- **Structured Offer & Counter-Offer Workflow:** Digital proposals, instant price countering, and formal deal completion.
- **LCA Carbon Abatement Calculator:** Automatic computation of kilograms of CO₂ emissions prevented per completed transaction.

---

### 6. Objectives of the Project
1. Develop a modern full-stack web application adhering to clean architectural separation (`frontend/` and `backend/`).
2. Guarantee 100% free-tier operation without mandatory paid cloud subscriptions or third-party API keys.
3. Implement algorithmic AI features in pure JavaScript that run locally with microsecond latency.
4. Ensure robust data validation, role-based access control, and password hashing.
5. Provide comprehensive viva documentation and Gujarat-specific seed data for live evaluation.

---

### 7. Core Features & Capabilities

| Feature Module | Technical Implementation | Practical Benefit |
|---|---|---|
| **Authentication & Roles** | JWT + bcryptjs (7-day expiry) | Segregates Seller, Buyer, and Admin workspaces |
| **Material Catalog** | Mongoose schema with multi-photo upload | Rich listing attributes: quantity, unit, condition, location |
| **Nearby Discovery** | Haversine Great-Circle formula | Allows recyclers to filter scrap within 20–200 km |
| **AI Price Estimator** | 3-month moving average + condition multipliers | Provides transparent reference price range (±8%) |
| **AI Classifier** | Keyword tokenization & regex extraction | Auto-populates categories and quantities from description |
| **Market Trend Analytics** | 12-month historical timeseries + Recharts | Visualizes MoM rate fluctuations and SMA-3 predictions |
| **Negotiations & Deals** | Digital offer state machine (pending/accepted/countered) | Prevents self-bidding and generates deal slips |
| **Carbon Impact Tracker** | LCA emission displacement factors | Credits verified CO₂ savings to participant profiles |
| **Admin Panel** | Moderation controls & aggregator queries | Approves users, blocks accounts, removes listings |

---

### 8. Technology Stack

- **Frontend:**
  - **Framework:** React.js 18 initialized via Vite
  - **Styling:** Tailwind CSS 3
  - **Routing:** React Router DOM v6
  - **HTTP Client:** Axios (with request interceptor for JWT authorization)
  - **Visualizations:** Recharts (Responsive Area and Bar charts)
  - **Feedback:** React Hot Toast
- **Backend:**
  - **Runtime:** Node.js v18+
  - **Server Framework:** Express.js REST API
  - **Object Data Modeling:** Mongoose v8
  - **File Uploads:** Multer with dual-mode storage (Local `uploads/` disk fallback & Cloudinary)
  - **Security:** bcryptjs, jsonwebtoken, cors, dotenv
- **Database:**
  - **DBMS:** MongoDB (Local instance or free MongoDB Atlas cloud cluster)
  - **Collections:** User, Listing, Offer, Deal, PriceHistory, Notification

---

### 9. System Architecture & Component Design
Fluxora adopts a **3-Tier Distributed Architecture**:
1. **Presentation Layer:** Client-side Single Page Application (SPA) providing reactive interfaces for sellers, buyers, and administrators.
2. **Application / Service Layer:** RESTful Express server handling authentication, business logic, and algorithmic intelligence.
3. **Data Layer:** MongoDB document store maintaining referential integrity across users, listings, offers, and transaction records.

*(Refer to `docs/architecture.md` for complete Mermaid architecture diagrams)*

---

### 10. Database Schema Design
The data layer comprises 6 collections:
- **User:** Manages authentication credentials, company details, geographic coordinates, role, and verification status.
- **Listing:** Stores scrap material specifications, quantities, asking rates, AI benchmarks, contamination levels, and photos.
- **Offer:** Tracks buyer bids, messages, and seller counter-proposals.
- **Deal:** Stores confirmed commercial agreements, finalized prices, and calculated carbon savings.
- **PriceHistory:** Maintains 12-month historical benchmark rates across material categories.
- **Notification:** Manages user alerts for offers, negotiations, and approvals.

*(Refer to `docs/er-diagram.md` for complete entity relationship models)*

---

### 11. Implementation Details
- **Project Structure:**
  - `frontend/`: Single-page React application configured with Vite and Tailwind CSS.
  - `backend/`: REST API server with modular controllers, routes, middleware, and services.
  - `docs/`: Complete viva and report documentation.
- **Zero-Secret Resilience:**
  - If Cloudinary keys are absent, uploads are saved locally and served statically via `/uploads`.
  - If Google Maps key is omitted, listings provide interactive location cards and direct links to Google Maps coordinates.
  - If MongoDB is temporarily offline, the server logs a clear diagnostic tip and maintains service availability for health checks.

---

### 12. Testing & Quality Assurance
The application underwent rigorous manual quality assurance across 20 test cases encompassing registration, role validation, file upload limits, self-offer prevention, counter-negotiations, deal completion, and admin moderation. All test cases passed successfully.

*(Refer to `docs/test-cases.md` for the complete QA test matrix)*

---

### 13. Future Scope
1. **Automated Escrow Payments:** Integration with RBI-compliant digital escrow gateways to hold funds until delivery is verified.
2. **IoT Weighing Bridge Integration:** Direct serial connectivity with factory weighbridges to eliminate manual weighment tampering.
3. **Logistics & Fleet Aggregation:** Integration with commercial trucking APIs for on-demand scrap pickup.
4. **Computer Vision Classification:** Deep learning models (CNNs) trained on industrial scrap photos to automatically detect impurities and contamination grades.

---

### 14. Conclusion
Fluxora demonstrates that traditional, middleman-heavy industrial scrap trading can be modernized into a transparent, digital, and environmentally sustainable marketplace. By pairing a robust MERN stack with lightweight algorithmic AI and zero-cost fallbacks, the project provides a scalable, viva-ready solution for industrial waste monetization and circular economy acceleration.
