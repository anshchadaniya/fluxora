# Fluxora — REST API Specification

Base URL: `http://localhost:5000/api`  
All protected routes require standard Bearer token header: `Authorization: Bearer <JWT_TOKEN>`.

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /auth/register`
- **Description:** Registers a new seller or buyer.
- **Request Body:**
  ```json
  {
    "name": "Ramesh Patel",
    "email": "ramesh@patelcastings.com",
    "password": "password123",
    "role": "seller",
    "companyName": "Patel Precision Castings Pvt Ltd",
    "phone": "+91 98251 11001",
    "city": "Vadodara"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Account registered successfully",
    "data": {
      "_id": "6701b2a48f9a2",
      "name": "Ramesh Patel",
      "email": "ramesh@patelcastings.com",
      "role": "seller",
      "verificationStatus": "pending",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
    }
  }
  ```

### `POST /auth/login`
- **Request Body:**
  ```json
  { "email": "seller1@test.com", "password": "password123" }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "_id": "6701b2a48f9a2",
      "name": "Rajesh Patel",
      "role": "seller",
      "token": "eyJhbGciOiJIUzI1Ni..."
    }
  }
  ```

### `GET /auth/me`
- **Access:** Private
- **Response (200):** Complete authenticated User object.

### `PUT /auth/profile`
- **Access:** Private
- **Request Body:** `{ "name": "...", "companyName": "...", "phone": "..." }`

---

## 2. Scrap Listings Endpoints (`/api/listings`)

### `GET /listings`
- **Parameters:** `search`, `category`, `condition`, `city`, `minPrice`, `maxPrice`, `sort`, `page`, `limit`.
- **Response (200):**
  ```json
  {
    "success": true,
    "total": 25,
    "page": 1,
    "pages": 3,
    "count": 12,
    "data": [
      {
        "_id": "6701b33f1c",
        "title": "Industrial Heavy Copper Wiring & Busbars",
        "category": "metal",
        "quantity": 850,
        "unit": "kg",
        "pricePerUnit": 480,
        "estimatedPrice": 475,
        "condition": "clean",
        "city": "Vadodara",
        "status": "active"
      }
    ]
  }
  ```

### `GET /listings/nearby`
- **Parameters:** `lat=23.0225&lng=72.5714&radiusKm=100`
- **Response (200):**
  ```json
  {
    "success": true,
    "center": { "lat": 23.0225, "lng": 72.5714 },
    "radiusKm": 100,
    "count": 14,
    "data": [
      {
        "_id": "6701b33f1c",
        "title": "Baled Clean Corrugated Cardboard Boxes",
        "city": "Ahmedabad",
        "distanceKm": 4.2
      }
    ]
  }
  ```

### `GET /listings/:id`
- **Access:** Public (increments views counter).

### `POST /listings`
- **Access:** Private (Seller/Admin, `multipart/form-data` with up to 4 images).

---

## 3. Offers Endpoints (`/api/offers`)

### `POST /offers`
- **Access:** Private (Buyer)
- **Request Body:**
  ```json
  {
    "listingId": "6701b33f1c",
    "offeredPrice": 470,
    "quantity": 850,
    "message": "Can pick up tomorrow from Vadodara GIDC."
  }
  ```
- **Response (201):** `{ "success": true, "message": "Offer submitted successfully", "data": { ... } }`

### `GET /offers/received`
- **Access:** Private (Seller). Returns incoming bids with populated listing & buyer profile.

### `GET /offers/sent`
- **Access:** Private (Buyer). Returns bids placed by logged-in buyer.

### `PUT /offers/:id/accept`
- **Access:** Private (Seller). Marks offer accepted, creates confirmed `Deal`, sets listing status to `sold`.

### `PUT /offers/:id/counter`
- **Request Body:** `{ "counterPrice": 475 }`

---

## 4. Deals & Impact Endpoints (`/api/deals`, `/api/impact`)

### `GET /deals`
- **Access:** Private. Returns deals involving the user.

### `PUT /deals/:id/complete`
- **Access:** Private (Seller or Admin). Marks deal `completed`, calculates final verified CO₂ emissions savings.

### `GET /impact/me`
- **Access:** Private. Returns user cumulative kilograms recycled and CO₂ abated.

### `GET /impact/platform`
- **Access:** Public. Returns platform-wide circular economy statistics.

---

## 5. Algorithmic AI Endpoints (`/api/ai`)

### `POST /ai/estimate-price`
- **Request Body:**
  ```json
  {
    "category": "metal",
    "subCategory": "Copper / Brass",
    "quantity": 850,
    "unit": "kg",
    "condition": "clean"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "estimatedPrice": 475,
      "low": 437,
      "high": 513,
      "unit": "kg",
      "baseRatePerKg": 475,
      "explanation": "Base rate ₹475/kg based on recent market trends. Adjusted for clean (+0%). Estimated fair market range: ₹437 - ₹513 per kg."
    }
  }
  ```

### `POST /ai/classify`
- **Request Body:** `{ "text": "old copper busbar 500kg with slight oil" }`
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      "category": "metal",
      "subCategory": "Copper / Brass",
      "condition": "contaminated",
      "quantity": 500,
      "unit": "kg",
      "confidence": 0.9
    }
  }
  ```

---

## 6. Admin Endpoints (`/api/admin`)

- `GET /admin/stats`: User counts, active listings, completed deals, category distribution.
- `GET /admin/users?status=pending`: List users awaiting review.
- `PUT /admin/users/:id/verify`: Approve user and assign verified badge.
- `PUT /admin/users/:id/block`: Toggle user suspension.
- `GET /admin/listings`: List all platform listings.
- `PUT /admin/listings/:id/remove`: Toggle listing removal/moderation.
