# Fluxora — Project Presentation Outline (12 Slides)

---

### Slide 1: Title & Introduction
- **Project Title:** Fluxora — Smart Industrial Waste Marketplace
- **Subtitle:** Facilitating Transparent B2B Scrap Trading, Fair Market Pricing & Carbon Abatement
- **Domain:** Circular Economy, Full-Stack Web Engineering, Applied Algorithmic Intelligence
- **Presenters:** Final Year Engineering Project Team

---

### Slide 2: Problem Statement
- **Lack of Centralized Discovery:** Industries lack a trusted, verified channel to liquidate recurring manufacturing scrap.
- **Middleman Exploitation:** Unorganized brokers monopolize local yards, cutting seller margins and inflating recycler acquisition costs.
- **Opaque Market Valuation:** Absence of transparent benchmark pricing creates unfair trades.
- **Fragmented Environmental Auditing:** Zero automated mechanisms to calculate and report carbon emission reductions from scrap recycling.

---

### Slide 3: Existing System
- **Manual, Offline Operation:** Factory managers contact informal local scrap dealers via phone calls.
- **Arbitrary Spot Pricing:** Dealers quote subjective rates with no verifiable market trends.
- **Paper Slips & Cash Records:** Zero digital documentation or traceable transaction records.
- **Limited Geographic Reach:** Generators only trade within a 5 km local perimeter, missing higher bids in nearby industrial hubs.

---

### Slide 4: Limitations of Existing System
- **Severe Financial Leakage:** Up to 30–40% value lost to intermediaries.
- **High Fraud & Default Risk:** No KYC verification for scrap dealers.
- **Industrial Scrap Hoarding:** Material sits idle in factory yards taking up valuable floor space.
- **Absence of ESG Compliance:** Inability to produce verified Life Cycle Assessment (LCA) recycling certificates.

---

### Slide 5: Proposed System — Fluxora
- **Direct B2B Marketplace:** Digital platform connecting factories directly with certified recyclers across Gujarat.
- **Democratized Price Discovery:** Algorithmic smart pricing based on 12-month rolling trends.
- **End-to-End Negotiation Lifecycle:** Digital listings $\rightarrow$ bids $\rightarrow$ counter-offers $\rightarrow$ confirmed deals.
- **Automated LCA Carbon Auditing:** Immediate Scope-3 CO₂ reduction calculations.

---

### Slide 6: Project Objectives
- Build an accessible, zero-cost architecture operating on free-tier services without paid API dependencies.
- Implement an algorithmic AI engine for fair-market price recommendations and automated material classification.
- Enable geographic proximity discovery using the Haversine formula across Gujarat industrial belts (Vadodara, Ahmedabad, Surat, Rajkot).
- Streamline digital negotiations and transaction certification.

---

### Slide 7: Core Features
- **Public & Recycler Discovery:** Filterable catalog, city filters, and interactive map with Google Maps directions.
- **Seller Management:** Listing creation with AI auto-fill, image uploads, price suggestion, and offers inbox.
- **Buyer Workflow:** Nearby search radius slider, bidding, counter-offer acceptance, and deal slips.
- **AI Tools:** Fair-price estimator, material classifier, Recharts 3-month moving average forecast.
- **Admin Governance:** KYC verification badges, listing moderation, and platform metrics.

---

### Slide 8: Technology Stack
- **Frontend:** React 18 (Vite), Tailwind CSS, React Router v6, Recharts, React Hot Toast
- **Backend:** Node.js, Express.js (REST API)
- **Database:** MongoDB with Mongoose ODM
- **Authentication & Security:** JWT (7-day validity), bcrypt password hashing, role-based middleware
- **Zero-Key Fallback Design:** Local disk upload fallback, mathematical Haversine calculations, algorithmic rule-based AI

---

### Slide 9: System Architecture
- **3-Tier Distributed Architecture:** Clean separation of Presentation (React), Logic (Express API), and Persistence (MongoDB).
- **Decoupled Algorithmic Services:** Independent modules for price estimation, keyword classification, and LCA carbon factors.
- *(Insert Mermaid Architecture Diagram from docs/architecture.md)*

---

### Slide 10: Database Design
- **Normalized 6-Collection Schema:** Users, Listings, Offers, Deals, PriceHistory, Notifications.
- **Integrity through References:** Bidirectional linking using Mongoose ObjectIds and `populate()` queries.
- *(Insert Mermaid ER Diagram from docs/er-diagram.md)*

---

### Slide 11: Future Scope & Enhancements
- **Escrow Payment Integration:** Milestone-based automated payout upon delivery weighment confirmation.
- **IoT Smart Weighing Scales:** Direct serial integration for fraud-proof tare and gross weight verification.
- **Logistics & Fleet Aggregation:** On-demand booking of commercial scrap flatbeds and dumpers.
- **Deep Learning Vision:** Convolutional Neural Networks (CNN) for automated contamination detection from scrap photos.

---

### Slide 12: Conclusion & Q&A
- **Summary:** Fluxora replaces unorganized scrap hoarding with a digital, transparent, and sustainable trading ecosystem.
- **Viva Ready:** Fully functional full-stack prototype with seeded demo accounts, complete API test cases, and zero external costs.
- **Thank you!** Questions & Discussion.
