# Fluxora — Entity Relationship (ER) Diagram

Fluxora maintains **6 collections** in MongoDB designed for relational integrity via Mongoose ObjectIds while retaining document scalability.

```mermaid
erDiagram
    USER ||--o{ LISTING : "publishes (seller)"
    USER ||--o{ OFFER : "makes (buyer)"
    USER ||--o{ OFFER : "receives (seller)"
    USER ||--o{ DEAL : "participates"
    USER ||--o{ NOTIFICATION : "receives"

    LISTING ||--o{ OFFER : "receives bids"
    LISTING ||--o| DEAL : "converts to"

    OFFER ||--o| DEAL : "accepted into"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "seller | buyer | admin"
        string companyName
        string phone
        string city
        string state
        object location "lat, lng"
        string verificationStatus "pending | verified | rejected"
        boolean isBlocked
        Date createdAt
    }

    LISTING {
        ObjectId _id PK
        ObjectId seller FK
        string title
        string description
        string category "metal | plastic | cardboard | ewaste | paper | other"
        string subCategory
        number quantity
        string unit "kg | ton"
        number pricePerUnit
        number estimatedPrice
        string condition "clean | mixed | contaminated"
        string_array images
        string city
        object location "lat, lng"
        string status "active | sold | removed"
        number views
        Date createdAt
    }

    OFFER {
        ObjectId _id PK
        ObjectId listing FK
        ObjectId buyer FK
        ObjectId seller FK
        number offeredPrice
        number quantity
        string message
        string status "pending | accepted | rejected | countered"
        number counterPrice
        Date createdAt
    }

    DEAL {
        ObjectId _id PK
        ObjectId listing FK
        ObjectId offer FK
        ObjectId seller FK
        ObjectId buyer FK
        number finalPrice
        number quantity
        string status "confirmed | completed | cancelled"
        object impact "kgRecycled, co2SavedKg"
        Date completedAt
        Date createdAt
    }

    PRICE_HISTORY {
        ObjectId _id PK
        string category
        string subCategory
        string month "YYYY-MM"
        number avgPricePerKg
        Date createdAt
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK
        string text
        string link
        boolean isRead
        Date createdAt
    }
```

---

## Data Dictionary

| Collection | Cardinality & Relationships | Purpose |
|---|---|---|
| **User** | 1-to-N with Listings, Offers, Deals, Notifications | Manages profiles, authentication credentials, roles, and admin KYC status. |
| **Listing** | Belongs to 1 Seller; 1-to-N with Offers; 1-to-1 with Deals | Stores scrap lot specifications, condition, GPS location, and asking prices. |
| **Offer** | Belongs to 1 Listing, 1 Buyer, and 1 Seller | Tracks digital bidding, price negotiations, and counter-proposals. |
| **Deal** | Belongs to 1 Listing, 1 Offer, 1 Seller, and 1 Buyer | Records verified transactions, finalized prices, and LCA carbon savings. |
| **PriceHistory** | Standalone benchmark timeseries | 12-month historical rates per category used for AI price estimation & Recharts trends. |
| **Notification** | Belongs to 1 User | Push alert feed for bid notifications, acceptance, and system updates. |
