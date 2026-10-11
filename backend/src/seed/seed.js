const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Offer = require('../models/Offer');
const Deal = require('../models/Deal');
const PriceHistory = require('../models/PriceHistory');
const Notification = require('../models/Notification');
const { calculateImpact } = require('../services/impact');

const CITIES = {
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Vadodara: { lat: 22.3072, lng: 73.1812 },
  Surat: { lat: 21.1702, lng: 72.8311 },
  Rajkot: { lat: 22.3039, lng: 70.8022 },
};

const seedDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/fluxora';
  console.log(`\n🌱 Connecting to MongoDB: ${uri}...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✓ Connected to MongoDB');

    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      Offer.deleteMany({}),
      Deal.deleteMany({}),
      PriceHistory.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('✓ Database wiped clean');

    // 1. Create Admin
    console.log('👤 Seeding Users...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@fluxora.com',
      password: 'admin123',
      role: 'admin',
      companyName: 'Fluxora HQ Gujarat',
      phone: '9876500001',
      city: 'Ahmedabad',
      state: 'Gujarat',
      location: CITIES.Ahmedabad,
      verificationStatus: 'verified',
    });

    // 2. Create 5 Sellers
    const sellers = await User.create([
      {
        name: 'Rajesh Patel',
        email: 'seller1@test.com',
        password: 'password123',
        role: 'seller',
        companyName: 'Patel Precision Castings Pvt Ltd',
        phone: '9825111001',
        city: 'Vadodara',
        state: 'Gujarat',
        location: CITIES.Vadodara,
        verificationStatus: 'verified',
      },
      {
        name: 'Amit Shah',
        email: 'seller2@test.com',
        password: 'password123',
        role: 'seller',
        companyName: 'Gujarat Packaging Industries',
        phone: '9825222002',
        city: 'Ahmedabad',
        state: 'Gujarat',
        location: CITIES.Ahmedabad,
        verificationStatus: 'verified',
      },
      {
        name: 'Dharmesh Desai',
        email: 'seller3@test.com',
        password: 'password123',
        role: 'seller',
        companyName: 'Surat Textiles & Polymer Mills',
        phone: '9825333003',
        city: 'Surat',
        state: 'Gujarat',
        location: CITIES.Surat,
        verificationStatus: 'pending',
      },
      {
        name: 'Kirit Vora',
        email: 'seller4@test.com',
        password: 'password123',
        role: 'seller',
        companyName: 'Saurashtra Auto Components',
        phone: '9825444004',
        city: 'Rajkot',
        state: 'Gujarat',
        location: CITIES.Rajkot,
        verificationStatus: 'verified',
      },
      {
        name: 'Nilesh Mehta',
        email: 'seller5@test.com',
        password: 'password123',
        role: 'seller',
        companyName: 'Mehta Fabrication & Sheet Metal',
        phone: '9825555005',
        city: 'Vadodara',
        state: 'Gujarat',
        location: CITIES.Vadodara,
        verificationStatus: 'pending',
      },
    ]);

    // 3. Create 5 Buyers / Recyclers
    const buyers = await User.create([
      {
        name: 'Vikram Green Recyclers',
        email: 'buyer1@test.com',
        password: 'password123',
        role: 'buyer',
        companyName: 'Vikram Green Eco Smelters',
        phone: '9898166001',
        city: 'Ahmedabad',
        state: 'Gujarat',
        location: CITIES.Ahmedabad,
        verificationStatus: 'verified',
      },
      {
        name: 'Baroda Polymers & Scrap',
        email: 'buyer2@test.com',
        password: 'password123',
        role: 'buyer',
        companyName: 'Baroda Plastic Granules Ltd',
        phone: '9898277002',
        city: 'Vadodara',
        state: 'Gujarat',
        location: CITIES.Vadodara,
        verificationStatus: 'verified',
      },
      {
        name: 'Diamond City Paper Pulpers',
        email: 'buyer3@test.com',
        password: 'password123',
        role: 'buyer',
        companyName: 'Surat Eco Fibers & Pulp',
        phone: '9898388003',
        city: 'Surat',
        state: 'Gujarat',
        location: CITIES.Surat,
        verificationStatus: 'pending',
      },
      {
        name: 'Rajkot E-Waste Recoveries',
        email: 'buyer4@test.com',
        password: 'password123',
        role: 'buyer',
        companyName: 'GreenTech Metal & PCB Refiners',
        phone: '9898499004',
        city: 'Rajkot',
        state: 'Gujarat',
        location: CITIES.Rajkot,
        verificationStatus: 'verified',
      },
      {
        name: 'Apex Industrial Scrap Dealers',
        email: 'buyer5@test.com',
        password: 'password123',
        role: 'buyer',
        companyName: 'Apex Resource Recovery Corp',
        phone: '9898500005',
        city: 'Ahmedabad',
        state: 'Gujarat',
        location: CITIES.Ahmedabad,
        verificationStatus: 'pending',
      },
    ]);

    console.log(`✓ Seeded 1 Admin, ${sellers.length} Sellers, ${buyers.length} Buyers`);

    // 4. Seed 12 Months Price History
    console.log('📈 Seeding 12 Months Price History...');
    const months = [
      '2024-11', '2024-12', '2025-01', '2025-02', '2025-03', '2025-04',
      '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10',
    ];

    const categoryBaseRates = {
      metal: { sub: 'Copper / Brass / Steel', base: 42 },
      plastic: { sub: 'HDPE / PET / LDPE', base: 28 },
      cardboard: { sub: 'Corrugated Packaging Boxes', base: 14 },
      ewaste: { sub: 'Printed Circuit Boards & IT', base: 65 },
      paper: { sub: 'Office Shredded & Kraft', base: 12 },
      other: { sub: 'Industrial Waste Assorted', base: 18 },
    };

    const priceRecords = [];
    for (const [cat, info] of Object.entries(categoryBaseRates)) {
      months.forEach((m, idx) => {
        const trendCurve = Math.sin(idx * 0.5) * 4 + (idx * 0.3);
        const price = Math.round((info.base + trendCurve) * 10) / 10;
        priceRecords.push({
          category: cat,
          subCategory: info.sub,
          month: m,
          avgPricePerKg: price,
        });
      });
    }
    await PriceHistory.insertMany(priceRecords);
    console.log(`✓ Seeded ${priceRecords.length} historical price points`);

    // 5. Seed 25 Listings across Gujarat
    console.log('📦 Seeding 25 Scrap Listings...');
    const demoListingData = [
      {
        seller: sellers[0]._id,
        title: 'Industrial Heavy Copper Wiring & Busbars',
        description: 'Clean high-grade electrical copper offcuts and stripped busbars from machine retrofit. Unalloyed 99% pure.',
        category: 'metal',
        subCategory: 'Copper / Brass',
        quantity: 850,
        unit: 'kg',
        pricePerUnit: 480,
        estimatedPrice: 475,
        condition: 'clean',
        city: 'Vadodara',
        location: CITIES.Vadodara,
        views: 45,
      },
      {
        seller: sellers[1]._id,
        title: 'Baled Clean Corrugated Cardboard Boxes',
        description: 'Double wall packaging boxes compressed in hydraulic bales. Dry stored indoors, zero moisture.',
        category: 'cardboard',
        subCategory: 'Corrugated Boxes',
        quantity: 3,
        unit: 'ton',
        pricePerUnit: 14000,
        estimatedPrice: 13500,
        condition: 'clean',
        city: 'Ahmedabad',
        location: CITIES.Ahmedabad,
        views: 82,
      },
      {
        seller: sellers[2]._id,
        title: 'HDPE Chemical Drums (Triple Rinsed)',
        description: '200-litre blue HDPE containers, cleaned and degreased. Suitable for direct granulating and pelletizing.',
        category: 'plastic',
        subCategory: 'HDPE Rigid',
        quantity: 1200,
        unit: 'kg',
        pricePerUnit: 34,
        estimatedPrice: 32,
        condition: 'clean',
        city: 'Surat',
        location: CITIES.Surat,
        views: 31,
      },
      {
        seller: sellers[3]._id,
        title: 'Automotive Stamping Sheet Metal Offcuts',
        description: 'Cold rolled steel trimmings from press shop. Bundled in steel strapping, minimal oil coating.',
        category: 'metal',
        subCategory: 'Iron / Steel',
        quantity: 5,
        unit: 'ton',
        pricePerUnit: 36000,
        estimatedPrice: 35000,
        condition: 'mixed',
        city: 'Rajkot',
        location: CITIES.Rajkot,
        views: 64,
      },
      {
        seller: sellers[4]._id,
        title: 'Decommissioned Server Racks & Telecom PCBs',
        description: 'High-yield telecommunication server motherboards, gold-pinned connector backplanes, and rack frames.',
        category: 'ewaste',
        subCategory: 'Printed Circuit Boards (PCBs)',
        quantity: 420,
        unit: 'kg',
        pricePerUnit: 180,
        estimatedPrice: 175,
        condition: 'clean',
        city: 'Vadodara',
        location: CITIES.Vadodara,
        views: 93,
      },
      {
        seller: sellers[0]._id,
        title: 'Cast Iron Machine Bed Scraps & Lathe Borings',
        description: 'Heavy grey iron broken castings and clean dry turning chips from CNC machine workshop.',
        category: 'metal',
        subCategory: 'Iron / Steel',
        quantity: 2500,
        unit: 'kg',
        pricePerUnit: 38,
        estimatedPrice: 36,
        condition: 'clean',
        city: 'Vadodara',
        location: CITIES.Vadodara,
        views: 29,
      },
      {
        seller: sellers[1]._id,
        title: 'Post-Consumer Transparent PET Bottle Bales',
        description: 'Sorted transparent beverage bottles washed and pressed. Minimal label contamination.',
        category: 'plastic',
        subCategory: 'PET Bottles',
        quantity: 4,
        unit: 'ton',
        pricePerUnit: 38000,
        estimatedPrice: 36500,
        condition: 'clean',
        city: 'Ahmedabad',
        location: CITIES.Ahmedabad,
        views: 110,
      },
      {
        seller: sellers[2]._id,
        title: 'Polypropylene (PP) Woven Sacks Scrap',
        description: 'Disused unprinted packaging bags from fertilizer and polymer logistics plant.',
        category: 'plastic',
        subCategory: 'Mixed Plastic',
        quantity: 900,
        unit: 'kg',
        pricePerUnit: 22,
        estimatedPrice: 20,
        condition: 'mixed',
        city: 'Surat',
        location: CITIES.Surat,
        views: 19,
      },
      {
        seller: sellers[3]._id,
        title: 'Aluminium Extrusion Section Trimmings 6063',
        description: 'Clean anodized window and door section profile cuts. No iron bolts or plastic inserts attached.',
        category: 'metal',
        subCategory: 'Aluminium',
        quantity: 1100,
        unit: 'kg',
        pricePerUnit: 165,
        estimatedPrice: 160,
        condition: 'clean',
        city: 'Rajkot',
        location: CITIES.Rajkot,
        views: 74,
      },
      {
        seller: sellers[4]._id,
        title: 'Shredded White Office Records & Ledger Books',
        description: 'Confidential corporate files cross-shredded to 4mm strips. Excellent brightness, ready for paper mills.',
        category: 'paper',
        subCategory: 'Office & Kraft Paper',
        quantity: 1800,
        unit: 'kg',
        pricePerUnit: 16,
        estimatedPrice: 15,
        condition: 'clean',
        city: 'Vadodara',
        location: CITIES.Vadodara,
        views: 40,
      },
      {
        seller: sellers[0]._id,
        title: 'Used Lead-Acid Forklift Batteries',
        description: 'Factory material handling battery cells intact in acid-proof containers. Sold to certified smelters only.',
        category: 'ewaste',
        subCategory: 'Industrial Batteries',
        quantity: 1500,
        unit: 'kg',
        pricePerUnit: 92,
        estimatedPrice: 88,
        condition: 'mixed',
        city: 'Vadodara',
        location: CITIES.Vadodara,
        views: 57,
      },
      {
        seller: sellers[1]._id,
        title: 'LDPE Shrink Film Wrap Bundles',
        description: 'Warehouse pallet unwrap transparent low-density polyethylene film. Compacted into dense bundles.',
        category: 'plastic',
        subCategory: 'LDPE Films',
        quantity: 2,
        unit: 'ton',
        pricePerUnit: 29000,
        estimatedPrice: 28000,
        condition: 'clean',
        city: 'Ahmedabad',
        location: CITIES.Ahmedabad,
        views: 38,
      },
      {
        seller: sellers[2]._id,
        title: 'Textile Factory Mill Spools & Plastic Cones',
        description: 'Rigid polypropylene and ABS cones and bobbin tubes from weaving machinery.',
        category: 'plastic',
        subCategory: 'Mixed Plastic',
        quantity: 750,
        unit: 'kg',
        pricePerUnit: 24,
        estimatedPrice: 23,
        condition: 'clean',
        city: 'Surat',
        location: CITIES.Surat,
        views: 22,
      },
      {
        seller: sellers[3]._id,
        title: 'Mild Steel Punching Discs & Web Scraps',
        description: 'Clean stamping rejects from fabrication line. High density, easy loading via magnet crane.',
        category: 'metal',
        subCategory: 'Iron / Steel',
        quantity: 6,
        unit: 'ton',
        pricePerUnit: 34000,
        estimatedPrice: 33000,
        condition: 'clean',
        city: 'Rajkot',
        location: CITIES.Rajkot,
        views: 48,
      },
      {
        seller: sellers[4]._id,
        title: 'Disassembled Electric Motor Copper Windings',
        description: 'Burned stator coils burned free of varnish. Pure copper wire bundle scrap.',
        category: 'metal',
        subCategory: 'Copper / Brass',
        quantity: 620,
        unit: 'kg',
        pricePerUnit: 490,
        estimatedPrice: 480,
        condition: 'clean',
        city: 'Vadodara',
        location: CITIES.Vadodara,
        views: 89,
      },
      {
        seller: sellers[0]._id,
        title: 'Demolition Rebar & Structural Steel Beams',
        description: 'TMT bar cuts and angle pieces from plant shed expansion. Minor surface rust, high tensile grade.',
        category: 'metal',
        subCategory: 'Iron / Steel',
        quantity: 8,
        unit: 'ton',
        pricePerUnit: 31000,
        estimatedPrice: 30000,
        condition: 'contaminated',
        city: 'Vadodara',
        location: CITIES.Vadodara,
        views: 33,
      },
      {
        seller: sellers[1]._id,
        title: 'Rigid PVC Pipe Cuts & Drainage Conduit Ends',
        description: 'Plumbing manufacturer offcuts, grey schedule 40 PVC segments without solvent cement.',
        category: 'plastic',
        subCategory: 'PVC Scraps',
        quantity: 1300,
        unit: 'kg',
        pricePerUnit: 26,
        estimatedPrice: 25,
        condition: 'clean',
        city: 'Ahmedabad',
        location: CITIES.Ahmedabad,
        views: 27,
      },
      {
        seller: sellers[2]._id,
        title: 'Defective Industrial Kraft Paper Reels',
        description: 'Water damaged end reels of multi-layer kraft paper. Ideal for recycled fluting medium.',
        category: 'cardboard',
        subCategory: 'Corrugated Packaging Boxes',
        quantity: 2200,
        unit: 'kg',
        pricePerUnit: 11,
        estimatedPrice: 10,
        condition: 'contaminated',
        city: 'Surat',
        location: CITIES.Surat,
        views: 18,
      },
      {
        seller: sellers[3]._id,
        title: 'Brass Plumbing Fitting Turnings & Swarf',
        description: 'Golden yellow brass shavings collected under coolant filter, spun dry with centrifugal extractor.',
        category: 'metal',
        subCategory: 'Copper / Brass',
        quantity: 550,
        unit: 'kg',
        pricePerUnit: 360,
        estimatedPrice: 350,
        condition: 'clean',
        city: 'Rajkot',
        location: CITIES.Rajkot,
        views: 61,
      },
      {
        seller: sellers[4]._id,
        title: 'UPS Inverters & Industrial Power Supply Units',
        description: 'Obsolete 3-phase plant backup units containing copper transformers and aluminium heatsinks.',
        category: 'ewaste',
        subCategory: 'IT & Office Equipment',
        quantity: 980,
        unit: 'kg',
        pricePerUnit: 55,
        estimatedPrice: 52,
        condition: 'mixed',
        city: 'Vadodara',
        location: CITIES.Vadodara,
        views: 44,
      },
      {
        seller: sellers[0]._id,
        title: 'Used Conveyor Rubber Belts with Fabric Core',
        description: 'Multi-ply rubber belt pieces from foundry sand plant. Can be shredded into rubber crumb.',
        category: 'other',
        subCategory: 'Industrial Rubber Belting',
        quantity: 3500,
        unit: 'kg',
        pricePerUnit: 8,
        estimatedPrice: 7,
        condition: 'mixed',
        city: 'Vadodara',
        location: CITIES.Vadodara,
        views: 15,
      },
      {
        seller: sellers[1]._id,
        title: 'Aluminium Radiators & Heat Exchangers',
        description: 'Automotive and HVAC tube radiators free of cooling fluids, mechanically sorted.',
        category: 'metal',
        subCategory: 'Aluminium',
        quantity: 800,
        unit: 'kg',
        pricePerUnit: 145,
        estimatedPrice: 140,
        condition: 'clean',
        city: 'Ahmedabad',
        location: CITIES.Ahmedabad,
        views: 52,
      },
      {
        seller: sellers[2]._id,
        title: 'Assorted Polyester Yarn Waste & Thread Scraps',
        description: 'Clean synthetic filament waste baled from Surat textile powerlooms.',
        category: 'other',
        subCategory: 'Textile Waste',
        quantity: 1600,
        unit: 'kg',
        pricePerUnit: 19,
        estimatedPrice: 18,
        condition: 'clean',
        city: 'Surat',
        location: CITIES.Surat,
        views: 26,
      },
      {
        seller: sellers[3]._id,
        title: 'Defective Induction Motor Castings (Rejects)',
        description: 'Cast iron housings with porosity defects. Virgin melt charge ready for cupola furnace.',
        category: 'metal',
        subCategory: 'Iron / Steel',
        quantity: 4,
        unit: 'ton',
        pricePerUnit: 37000,
        estimatedPrice: 36000,
        condition: 'clean',
        city: 'Rajkot',
        location: CITIES.Rajkot,
        views: 67,
      },
      {
        seller: sellers[4]._id,
        title: 'Obsolete CRT Monitors & Office Desktops',
        description: 'Complete office computer sets collected during IT infrastructure upgrade. Assorted plastics and boards.',
        category: 'ewaste',
        subCategory: 'IT & Office Equipment',
        quantity: 1100,
        unit: 'kg',
        pricePerUnit: 42,
        estimatedPrice: 40,
        condition: 'mixed',
        city: 'Vadodara',
        location: CITIES.Vadodara,
        views: 39,
      },
    ];

    const listings = await Listing.create(demoListingData);
    console.log(`✓ Seeded ${listings.length} Gujarat scrap listings`);

    // 6. Seed Sample Offers & Deals
    console.log('🤝 Seeding Sample Offers & Deals...');
    const offer1 = await Offer.create({
      listing: listings[0]._id,
      buyer: buyers[0]._id,
      seller: listings[0].seller,
      offeredPrice: 470,
      quantity: 850,
      message: 'Can pick up tomorrow with our heavy transport truck from Vadodara GIDC.',
      status: 'pending',
    });

    const offer2 = await Offer.create({
      listing: listings[1]._id,
      buyer: buyers[2]._id,
      seller: listings[1].seller,
      offeredPrice: 13200,
      quantity: 3,
      message: 'We operate a kraft pulp mill in Surat and can buy your entire baled stock.',
      status: 'accepted',
    });

    // Mark listing[1] as sold
    listings[1].status = 'sold';
    await listings[1].save();

    // Create completed deal for offer2
    const impact = calculateImpact(listings[1].category, offer2.quantity, listings[1].unit);
    const deal1 = await Deal.create({
      listing: listings[1]._id,
      offer: offer2._id,
      seller: listings[1].seller,
      buyer: offer2.buyer,
      finalPrice: 13200,
      quantity: 3,
      status: 'completed',
      impact: {
        kgRecycled: impact.kgRecycled,
        co2SavedKg: impact.co2SavedKg,
      },
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    // Seed sample notifications
    await Notification.create([
      {
        user: listings[0].seller,
        text: `New offer of ₹470/kg received from Vikram Green Eco Smelters for "${listings[0].title}"`,
        link: '/seller/offers',
        isRead: false,
      },
      {
        user: buyers[2]._id,
        text: `Your offer for "${listings[1].title}" was accepted! Saved ${impact.co2SavedKg} kg CO₂ emissions.`,
        link: '/deals',
        isRead: true,
      },
    ]);

    console.log('✓ Seeded sample Offers, Deals, and Notifications');
    console.log('\n🎉 ALL DEMO DATA SUCCESSFULLY SEEDED!');
    console.log('--------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('  Admin:  admin@fluxora.com   / admin123');
    console.log('  Seller: seller1@test.com    / password123');
    console.log('  Buyer:  buyer1@test.com     / password123');
    console.log('--------------------------------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedDB();
