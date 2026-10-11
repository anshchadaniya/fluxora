# Fluxora — Top 25 Final Year Viva Questions & Answers

### 1. What is the core problem Fluxora solves?
**Answer:** Fluxora eliminates middlemen and opaque pricing in industrial scrap trading. It connects factories generating scrap directly with certified recyclers, providing transparent fair-market prices, digital offer negotiations, nearby discovery, and verified CO₂ impact tracking.

### 2. Why did you choose the MERN stack over alternatives like Django or Spring Boot?
**Answer:** MERN uses a single language (JavaScript) across the entire stack, enabling JSON-native document serialization between React and MongoDB. It supports event-driven asynchronous I/O in Node.js, making API responses fast, modular, and lightweight for cloud and free-tier hosting.

### 3. How does user authentication and role authorization work in Fluxora?
**Answer:** We use stateless JSON Web Tokens (JWT). On login, the server signs a token with the user ID and secret key using HMAC-SHA256 (7-day validity). Middleware intercepts requests, verifies the token, checks if the account is blocked, and ensures the user’s role (`seller`, `buyer`, or `admin`) is authorized for that endpoint.

### 4. How are passwords stored securely?
**Answer:** Passwords are never stored in plaintext. We use `bcryptjs` with salt rounds = 10 before saving to MongoDB using a Mongoose pre-save hook. Even if the database is exposed, original passwords cannot be reversed.

### 5. How does the Haversine nearby search work without an expensive geospatial database index?
**Answer:** We compute great-circle spherical distance directly in JavaScript using the Haversine formula based on Earth's mean radius of 6,371 km. This calculates the precise distance between user coordinates and scrap yards with zero external GIS plugins.

### 6. What happens if the Google Maps API key is missing or quota is exceeded?
**Answer:** Fluxora implements a graceful zero-key fallback: it displays an interactive card grid with computed distances in kilometers and provides direct links to `https://www.google.com/maps?q=lat,lng`, so navigation always works without payment.

### 7. How does the Smart Price Estimation engine calculate fair rates?
**Answer:** It queries the 3 most recent months from `PriceHistory` for that material, then adjusts for quality condition (clean: +0%, mixed: -10%, contaminated: -25%), and applies a -3% bulk volume incentive for lots over 1,000 kg. It returns the price along with a $\pm 8\%$ fair range and a textual rationale.

### 8. Does the AI material classifier require a paid OpenAI or Gemini API key?
**Answer:** No. It is built using rule-based natural language tokenization and keyword mapping in pure JavaScript. It extracts categories, sub-categories, volume, and contamination levels in microseconds with zero paid keys.

### 9. How does market trend forecasting work?
**Answer:** It uses a 3-month Simple Moving Average (SMA-3):
$$\hat{P}_{t+1} = \frac{P_t + P_{t-1} + P_{t-2}}{3}$$
This smooths historical volatility and provides a realistic price projection for next month, visualized via Recharts.

### 10. How do buyers and sellers negotiate pricing in Fluxora?
**Answer:** Buyers submit formal structured offers specifying bid price per unit, total quantity desired, and trade notes. Sellers can directly accept (which marks the listing as sold and creates a confirmed Deal) or issue instant counter-offers back to the buyer.

### 11. What is the full lifecycle of a commercial scrap transaction in Fluxora?
**Answer:** Listing Created (active) $\rightarrow$ Buyer submits Offer (pending) $\rightarrow$ Seller can Counter or Accept $\rightarrow$ When Accepted, a confirmed `Deal` is created and listing is marked `sold` $\rightarrow$ Seller marks Deal `completed` $\rightarrow$ Verified CO₂ savings are credited.

### 12. How does Fluxora calculate environmental impact (CO₂ savings)?
**Answer:** We use scientific Life Cycle Assessment (LCA) displacement factors: 1.5 kg CO₂ saved per kg of recycled metal, 1.8 kg per kg of plastic, 0.9 kg per kg of cardboard/paper, and 2.0 kg per kg of e-waste.

### 13. What is the purpose of the Admin role in your project?
**Answer:** The Admin enforces trust and regulatory compliance by reviewing seller and buyer credentials, granting verified badges, moderating or removing non-compliant listings, and blocking fraudulent actors.

### 14. What are Mongoose Virtuals and Populate, and where did you use them?
**Answer:** Mongoose `populate()` performs cross-collection reference joins. For example, when fetching a listing, we populate the `seller` field with their company name, phone, and verification status.

### 15. What prevents a seller from making offers on their own scrap listing?
**Answer:** Both the backend controller (`offerController.js`) and frontend UI check if `listing.seller === req.user._id`. The backend rejects self-bids with a 400 Bad Request error.

### 16. How does image uploading work without Cloudinary?
**Answer:** Multer checks for Cloudinary credentials. If missing, it saves uploaded files to the local `backend/uploads/` directory with unique timestamps and serves them statically via Express at `/uploads`.

### 17. What is the difference between SQL and NoSQL for this application?
**Answer:** Scrap listings have flexible attributes (metals have alloys, plastics have polymer types, batteries have chemical types). MongoDB's schema flexibility allows storing unstructured specifications and nested geographic objects without rigid schema migrations.

### 18. How did you structure the folders for clean team maintenance?
**Answer:** Separated cleanly into `frontend/` (Vite + React) and `backend/` (Express API + MongoDB), with a root `package.json` that runs both simultaneously using `concurrently`.

### 19. How is state managed on the client side?
**Answer:** Authentication and user sessions are managed globally through `AuthContext` via the React Context API. Component-level state is handled with `useState`, and URL query parameters manage marketplace filter synchronization.

### 20. What happens if a database connection error occurs?
**Answer:** In `db.js`, the connection uses a 5-second timeout and catches errors without killing the Node process. The server stays online to serve health check endpoints and logs clear instructions on how to start MongoDB or configure MongoDB Atlas.

### 21. What security measures have you implemented?
**Answer:**
- Password hashing with bcrypt.
- JWT expiry after 7 days.
- Role-based authorization middleware.
- Input validation and file-type restrictions on image uploads (5 MB limit).
- Account suspension (`isBlocked`) enforcement.
- CORS restricted to client origin.

### 22. What is the role of the seed script?
**Answer:** `npm run seed` populates realistic Gujarat industrial demo data: 1 admin, 5 sellers, 5 buyers, 25 scrap listings across Vadodara, Ahmedabad, Surat, and Rajkot, sample offers, completed deals, and 12 months of price history.

### 23. What are the main limitations of the current prototype?
**Answer:** Currently, physical delivery logistics and escrow fiat payments are handled offline between the parties after deal confirmation.

### 24. What is the future scope for Fluxora?
**Answer:** Integration with automated escrow payment gateways, IoT weighing scale connectivity, GPS live scrap transit tracking, and deep learning image recognition for automated scrap grade detection.
