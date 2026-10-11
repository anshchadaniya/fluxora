# Fluxora — Data Flow Diagrams (DFD)

## 1. DFD Level 0 (Context Diagram)

The Level 0 context diagram demonstrates the high-level boundary of the Fluxora system interacting with its three external entities: **Industrial Seller**, **Scrap Recycler (Buyer)**, and **Platform Administrator**.

```mermaid
flowchart TD
    Seller(["🏭 Industrial Seller"])
    Buyer(["♻️ Recycler / Buyer"])
    Admin(["🛡️ Administrator"])
    FluxoraSystem[["0.0<br/>Fluxora Industrial Waste<br/>Marketplace System"]]

    Seller -->|Registration, Listings, Offer Responses, Deal Confirmations| FluxoraSystem
    FluxoraSystem -->|Price Suggestions, Inbound Offers, Deal Certificates, Impact Badges| Seller

    Buyer -->|Registration, Search Filters, Offers/Counters| FluxoraSystem
    FluxoraSystem -->|Listings Catalog, Nearby Yards, Offer Statuses, Environmental Slips| Buyer

    Admin -->|Verification Approvals, Listing Moderation Actions, Block Directives| FluxoraSystem
    FluxoraSystem -->|Platform Metrics, KYC Queue, Category Distribution Analytics| Admin
```

---

## 2. DFD Level 1 (Detailed Subsystem Flow)

The Level 1 diagram breaks the central process down into major subprocesses and displays data store interactions.

```mermaid
flowchart LR
    Seller(["Seller"])
    Buyer(["Buyer"])
    Admin(["Admin"])

    P1["1.0<br/>Authentication & Profile Management"]
    P2["2.0<br/>Listing & AI Classification Management"]
    P3["3.0<br/>Discovery & Haversine Distance Search"]
    P4["4.0<br/>Offer Negotiation & Bidding"]
    P5["5.0<br/>Deal Finalization & Impact Calculation"]
    P6["6.0<br/>Administration & Verification"]

    DS_User[("D1: Users")]
    DS_Listing[("D2: Listings")]
    DS_Offer[("D3: Offers")]
    DS_Deal[("D4: Deals")]
    DS_Price[("D5: PriceHistory")]
    DS_Notif[("D6: Notifications")]

    %% Auth Flows
    Seller -->|Credentials| P1
    Buyer -->|Credentials| P1
    Admin -->|Credentials| P1
    P1 <-->|Read / Write Profile & JWT| DS_User

    %% Listing Flows
    Seller -->|Scrap Specs & Photos| P2
    P2 <-->|Fetch Benchmark Averages| DS_Price
    P2 -->|Write New Listing| DS_Listing

    %% Search Flows
    Buyer -->|Search Keywords, City, Radius| P3
    P3 <-->|Query Active Lots| DS_Listing
    P3 -->|Sorted by Distance| Buyer

    %% Offer Flows
    Buyer -->|Submit Offer| P4
    P4 -->|Store Bid| DS_Offer
    P4 -->|Create Notification| DS_Notif
    P4 -->|Notify Seller| Seller
    Seller -->|Accept / Counter / Reject| P4

    %% Deal Flows
    P4 -->|Trigger Acceptance| P5
    P5 -->|Mark Sold| DS_Listing
    P5 -->|Record Confirmed Deal & LCA Impact| DS_Deal
    P5 -->|Certificate| Seller
    P5 -->|Certificate| Buyer

    %% Admin Flows
    Admin -->|Verify / Reject / Moderate| P6
    P6 <-->|Update Verification| DS_User
    P6 <-->|Moderate Status| DS_Listing
```
