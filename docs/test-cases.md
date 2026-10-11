# Fluxora — Manual Test Cases & Quality Assurance Matrix

| Test ID | Module | Test Scenario / Action | Input Data | Expected Output | Actual Result | Status |
|---|---|---|---|---|---|---|
| **TC-01** | Auth | Register seller with valid details | Name, email, password, company, Vadodara | Account created, 201 response, JWT token stored, redirected to dashboard | As expected | **PASS** |
| **TC-02** | Auth | Register with existing email | Duplicate email | 400 Bad Request: "Email is already registered" | As expected | **PASS** |
| **TC-03** | Auth | Login with incorrect password | Valid email, wrong password | 401 Unauthorized: "Invalid email or password" | As expected | **PASS** |
| **TC-04** | Auth | Blocked user login attempt | Blocked account credentials | 403 Forbidden: "Account has been suspended" | As expected | **PASS** |
| **TC-05** | Auth | Empty form state & role toggle | Switch Seller/Buyer on Register | Fields start empty, role selection highlights cleanly | As expected | **PASS** |
| **TC-06** | Listings | Create listing with valid attributes | Title, category, quantity, price, clean grade, photos | 201 Created: listing saved with status "active" | As expected | **PASS** |
| **TC-07** | Listings | Image upload handling | JPG image < 5 MB | File uploaded to backend storage & path populated in images array | As expected | **PASS** |
| **TC-08** | Listings | Marketplace search filtering | Keyword: "Copper", category: "metal" | Only matching copper metal lots returned | As expected | **PASS** |
| **TC-09** | Listings | City filter test | City: "Vadodara" | Only listings located in Vadodara returned | As expected | **PASS** |
| **TC-10** | Location | Nearby Haversine discovery | Center Ahmedabad, radius 50 km | Only listings within 50 km returned with distanceKm values | As expected | **PASS** |
| **TC-11** | Location | Open in Google Maps fallback | Click "Maps" on listing card | Opens https://maps.google.com/?q=lat,lng in new tab | As expected | **PASS** |
| **TC-12** | Offers | Buyer submits offer | Offered rate: ₹470, quantity: 850 kg | Offer saved as "pending", seller receives notification | As expected | **PASS** |
| **TC-13** | Offers | Seller offers on own listing | Seller clicks Make Offer on own post | Rejected: "You cannot make an offer on your own listing" | As expected | **PASS** |
| **TC-14** | Offers | Seller counters an offer | Counter price: ₹475/kg | Offer status becomes "countered", buyer notified | As expected | **PASS** |
| **TC-15** | Offers | Seller accepts an offer | Click "Accept & Create Deal" | Offer becomes "accepted", listing status becomes "sold", Deal created | As expected | **PASS** |
| **TC-16** | Deals | Mark deal completed | Seller clicks "Mark Deal Completed" | Deal status becomes "completed", LCA CO₂ savings recorded | As expected | **PASS** |
| **TC-17** | AI | Smart price estimation | Metal, Copper, 850 kg, clean | Returns calculated benchmark ₹475 with low-high spread | As expected | **PASS** |
| **TC-18** | AI | Material classifier | Description: "hdpe blue drum 1200kg" | Returns category: plastic, subCategory: HDPE Rigid, quantity: 1200 | As expected | **PASS** |
| **TC-19** | Admin | Verify pending industrial user | Click "Verify" in Admin panel | User verificationStatus becomes "verified", badge displayed | As expected | **PASS** |
| **TC-20** | Admin | Moderate listing removal | Click "Remove Listing" | Listing status toggles to "removed" and is hidden from public market | As expected | **PASS** |
