# Fluxora — Use Case Diagram & Actor Specifications

## 1. Actors in Fluxora

1. **Seller (Industrial Scrap Generator):**
   - Manufacturing companies, fabrication facilities, automotive component makers, and mills looking to liquidate scrap without middleman commission.
2. **Buyer (Recycler / Scrap Dealer):**
   - Certified recyclers, foundries, smelters, and re-processors seeking consistent raw scrap supplies nearby.
3. **Administrator:**
   - Platform overseer responsible for KYC document reviews, user status verification, and listing moderation.
4. **Guest / Public Visitor:**
   - Browses marketplace catalog, views recyclers directory, and checks market price trends.

---

## 2. Mermaid Use Case Diagram

```mermaid
flowchart LR
    subgraph Actors["Platform Actors"]
        Guest(["Guest Visitor"])
        Seller(["🏭 Industrial Seller"])
        Buyer(["♻️ Certified Recycler"])
        Admin(["🛡️ Administrator"])
    end

    subgraph PublicUseCases["Public / Shared Use Cases"]
        UC1["Browse Scrap Catalog & Search Filters"]
        UC2["View Price Trend Charts & Forecasts"]
        UC3["View Verified Recyclers Directory"]
        UC4["Register & Authenticate (JWT)"]
    end

    subgraph SellerUseCases["Seller Dedicated Use Cases"]
        UC5["Create Listing with AI Auto-Classification"]
        UC6["Query AI Fair Price Suggestion"]
        UC7["Manage Active / Sold Inventory"]
        UC8["Review Inbound Offers & Counter-Negotiate"]
        UC9["Mark Deal Complete & View CO2 Impact"]
    end

    subgraph BuyerUseCases["Buyer Dedicated Use Cases"]
        UC10["Discover Nearby Lots (Haversine Radius Slider)"]
        UC11["Submit Digital Purchase Offer"]
        UC12["Accept or Decline Seller Counter-Offers"]
        UC13["Inspect Dispatch Yard on Google Maps"]
    end

    subgraph SharedComm["Notifications & Alerts"]
        UC14["Receive In-App Offer & Deal Notifications"]
    end

    subgraph AdminUseCases["Administration Use Cases"]
        UC15["Review & Verify User KYC Status"]
        UC16["Moderate / Remove Non-Compliant Listings"]
        UC17["Block Fraudulent Accounts"]
        UC18["Inspect Platform Volume & Category Distribution"]
    end

    Guest --> UC1
    Guest --> UC2
    Guest --> UC3
    Guest --> UC4

    Seller --> UC5
    Seller --> UC6
    Seller --> UC7
    Seller --> UC8
    Seller --> UC9
    Seller --> UC14

    Buyer --> UC10
    Buyer --> UC11
    Buyer --> UC12
    Buyer --> UC13
    Buyer --> UC14

    Admin --> UC15
    Admin --> UC16
    Admin --> UC17
    Admin --> UC18
```
