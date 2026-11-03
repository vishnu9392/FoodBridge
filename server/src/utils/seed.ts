import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/User';
import { Donation } from '../models/Donation';
import { Pickup } from '../models/Pickup';

export async function seedDemoData(): Promise<boolean> {
  console.log('🌱 Starting FoodBridge demo database initialization...');

  const connected = await connectDatabase();
  if (!connected) {
    console.error('❌ Cannot seed database: MongoDB Atlas is not connected.');
    return false;
  }

  try {
    // Clean up existing demo accounts & records idempotently
    const demoEmails = [
      'donor@foodbridge.demo',
      'recipient@foodbridge.demo',
      'restaurant@foodbridge.demo',
    ];

    await Pickup.deleteMany({ isDemo: true });
    await Donation.deleteMany({ isDemo: true });
    await User.deleteMany({ email: { $in: demoEmails } });

    console.log('🧹 Cleaned previous demo records safely (real user data preserved).');

    // Create Demo Users with bcryptjs hash
    const salt = await bcrypt.genSalt(10);
    const demoPasswordHash = await bcrypt.hash('FoodBridge@Demo2026', salt);

    const demoDonor = await User.create({
      name: 'FoodBridge Demo Donor',
      email: 'donor@foodbridge.demo',
      phone: '+1-555-0101',
      passwordHash: demoPasswordHash,
      role: 'donor',
      organization: 'Metro Community Kitchen & Bakery',
      address: '108 Grand Avenue, Metro City',
      bio: 'Leading community kitchen dedicated to preparing wholesome meals and redistributing daily surplus to local shelters.',
      isDemo: true,
    });

    const demoRecipient = await User.create({
      name: 'FoodBridge Demo Recipient',
      email: 'recipient@foodbridge.demo',
      phone: '+1-555-0102',
      passwordHash: demoPasswordHash,
      role: 'recipient',
      organization: 'Hope Community Shelter & Food Bank',
      address: '24 St. Jude Plaza, Metro City',
      bio: 'Non-profit emergency shelter serving nutritious meals and care packages daily to families and individuals in need.',
      isDemo: true,
    });

    const restaurantDonor = await User.create({
      name: 'FoodBridge Restaurant Donor',
      email: 'restaurant@foodbridge.demo',
      phone: '+1-555-0103',
      passwordHash: demoPasswordHash,
      role: 'donor',
      organization: 'Bella Trattoria & Artisan Pantry',
      address: '45 Ocean Boulevard, Waterfront',
      bio: 'Artisan Italian restaurant committed to zero food waste through sustainable daily surplus donations.',
      isDemo: true,
    });

    console.log('👤 Created demo accounts:');
    console.log('   Donor:      donor@foodbridge.demo       / FoodBridge@Demo2026');
    console.log('   Recipient:  recipient@foodbridge.demo   / FoodBridge@Demo2026');
    console.log('   Restaurant: restaurant@foodbridge.demo  / FoodBridge@Demo2026');

    // Create 16 Diverse Demo Food Donations
    const now = Date.now();
    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000);
    const fourHoursAgo = new Date(now - 4 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    // Varied expiry timestamps: mix of urgent (<24h) and fresh (>24h)
    const exp6h = new Date(now + 6 * 60 * 60 * 1000);    // Expiring soon (urgent)
    const exp10h = new Date(now + 10 * 60 * 60 * 1000);  // Expiring soon (urgent)
    const exp16h = new Date(now + 16 * 60 * 60 * 1000);  // Expiring soon (urgent)
    const exp20h = new Date(now + 20 * 60 * 60 * 1000);  // Expiring soon (urgent)
    const exp36h = new Date(now + 36 * 60 * 60 * 1000);  // Fresh (>24h)
    const exp2d = new Date(now + 2 * 24 * 60 * 60 * 1000); // Fresh
    const exp3d = new Date(now + 3 * 24 * 60 * 60 * 1000); // Fresh
    const exp4d = new Date(now + 4 * 24 * 60 * 60 * 1000); // Fresh
    const exp5d = new Date(now + 5 * 24 * 60 * 60 * 1000); // Fresh

    const demoDonationSpecs = [
      {
        donor: demoDonor._id,
        foodName: 'Vegetable Biryani with Raita',
        category: 'Cooked Meals',
        quantity: 35,
        unit: 'portions',
        prepDate: twoHoursAgo,
        expiryDate: exp8h(8),
        location: {
          address: '108 Grand Avenue, Main Kitchen Gate',
          locality: 'Downtown',
          city: 'Metro City',
          landmark: 'Opposite Central Park',
          coordinates: { latitude: 28.6139, longitude: 77.2090 },
        },
        description: 'Fragrant basmati rice cooked with fresh seasonal vegetables, saffron, and aromatic spices. Freshly packed in food-grade insulated containers.',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian', 'Halal', 'Nut-Free'],
      },
      {
        donor: demoDonor._id,
        foodName: 'Fresh Chapati Packs (Whole Wheat)',
        category: 'Bakery & Bread',
        quantity: 80,
        unit: 'items',
        prepDate: twoHoursAgo,
        expiryDate: exp16h,
        location: {
          address: '108 Grand Avenue, Loading Dock B',
          locality: 'Downtown',
          city: 'Metro City',
          landmark: 'Rear Delivery Bay',
          coordinates: { latitude: 28.6145, longitude: 77.2085 },
        },
        description: 'Freshly pressed soft whole wheat chapatis stacked in hygienic parchment wraps (10 per pack). Ready to reheat and serve.',
        imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian', 'Vegan', 'Dairy-Free'],
      },
      {
        donor: demoDonor._id,
        foodName: 'Steamed Idli and Mixed Veg Sambar',
        category: 'Cooked Meals',
        quantity: 40,
        unit: 'portions',
        prepDate: twoHoursAgo,
        expiryDate: exp6h,
        location: {
          address: '108 Grand Avenue, Dispatch counter',
          locality: 'Downtown',
          city: 'Metro City',
          landmark: 'City Center South',
          coordinates: { latitude: 28.6132, longitude: 77.2095 },
        },
        description: 'Traditional fluffy steamed rice cakes with lentil and vegetable stew, seasoned with mustard seeds and fresh curry leaves.',
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      },
      {
        donor: restaurantDonor._id,
        foodName: 'Homestyle Vegetable Curry & Basmati Rice',
        category: 'Cooked Meals',
        quantity: 25,
        unit: 'portions',
        prepDate: fourHoursAgo,
        expiryDate: exp10h,
        location: {
          address: '45 Ocean Boulevard, Kitchen Rear',
          locality: 'Waterfront',
          city: 'Metro City',
          landmark: 'Harbor Gate 3',
          coordinates: { latitude: 28.6250, longitude: 77.2150 },
        },
        description: 'Rich tomato and coconut vegetable curry prepared with potatoes, peas, cauliflower, and carrots accompanied by steamed rice.',
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian', 'Gluten-Free', 'Halal'],
      },
      {
        donor: demoDonor._id,
        foodName: 'Artisanal Sourdough & Multigrain Loaves',
        category: 'Bakery & Bread',
        quantity: 24,
        unit: 'items',
        prepDate: fourHoursAgo,
        expiryDate: exp2d,
        location: {
          address: '108 Grand Avenue, Bakery Section',
          locality: 'Downtown',
          city: 'Metro City',
          landmark: 'North Courtyard',
          coordinates: { latitude: 28.6140, longitude: 77.2088 },
        },
        description: 'Freshly baked naturally fermented sourdough and seed-crusted multigrain bread loaves. Sealed in breathable paper bread sacks.',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian', 'Vegan'],
      },
      {
        donor: restaurantDonor._id,
        foodName: 'Assorted Bakery Pastries & Croissants',
        category: 'Bakery & Bread',
        quantity: 30,
        unit: 'items',
        prepDate: twoHoursAgo,
        expiryDate: exp20h,
        location: {
          address: '45 Ocean Boulevard, Cafe Entrance',
          locality: 'Waterfront',
          city: 'Metro City',
          landmark: 'Marina Walkway',
          coordinates: { latitude: 28.6255, longitude: 77.2140 },
        },
        description: 'Golden butter croissants, cinnamon swirls, and fruit danishes baked this morning. Boxed in catering pastry trays.',
        imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian'],
      },
      {
        donor: demoDonor._id,
        foodName: 'Fresh Seasonal Fruits Basket',
        category: 'Fresh Produce',
        quantity: 18,
        unit: 'kg',
        prepDate: oneDayAgo,
        expiryDate: exp3d,
        location: {
          address: '108 Grand Avenue, Pantry Bay',
          locality: 'Downtown',
          city: 'Metro City',
          landmark: 'Civic Center East',
          coordinates: { latitude: 28.6135, longitude: 77.2102 },
        },
        description: 'Sweet crisp red apples, ripe bananas, sweet oranges, and fresh pears carefully sorted and packed in wooden crates.',
        imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Nut-Free'],
      },
      {
        donor: demoDonor._id,
        foodName: 'Fresh Farm Green Vegetables',
        category: 'Fresh Produce',
        quantity: 22,
        unit: 'kg',
        prepDate: oneDayAgo,
        expiryDate: exp4d,
        location: {
          address: '108 Grand Avenue, Produce Cold Storage',
          locality: 'Downtown',
          city: 'Metro City',
          landmark: 'Metro Central Depot',
          coordinates: { latitude: 28.6142, longitude: 77.2098 },
        },
        description: 'Crisp bell peppers, fresh cucumbers, ripe tomatoes, zucchini, and washed spinach leaves stored in temperature-controlled crates.',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      },
      {
        donor: restaurantDonor._id,
        foodName: 'Organic Whole Milk Packets (1 Litre)',
        category: 'Dairy & Eggs',
        quantity: 20,
        unit: 'litres',
        prepDate: twoHoursAgo,
        expiryDate: exp36h,
        location: {
          address: '45 Ocean Boulevard, Refrigerator Unit 2',
          locality: 'Waterfront',
          city: 'Metro City',
          landmark: 'Pier 4 entrance',
          coordinates: { latitude: 28.6260, longitude: 77.2160 },
        },
        description: 'Pasteurized, sealed full-cream organic milk packets refrigerated at 3°C. Perfect for emergency relief kitchens and children.',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian', 'Gluten-Free'],
      },
      {
        donor: restaurantDonor._id,
        foodName: 'Fresh Greek Yogurt Containers',
        category: 'Dairy & Eggs',
        quantity: 24,
        unit: 'items',
        prepDate: fourHoursAgo,
        expiryDate: exp5d,
        location: {
          address: '45 Ocean Boulevard, Dairy Chiller',
          locality: 'Waterfront',
          city: 'Metro City',
          landmark: 'Bayside Market Lane',
          coordinates: { latitude: 28.6248, longitude: 77.2145 },
        },
        description: 'Sealed 200g natural Greek yogurt cups with probiotic cultures, stored continuously at 4°C. Excellent protein source.',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian', 'Gluten-Free'],
      },
      {
        donor: demoDonor._id,
        foodName: 'Packaged Whole Grain Granola & Oat Snacks',
        category: 'Packaged & Canned',
        quantity: 45,
        unit: 'boxes',
        prepDate: oneDayAgo,
        expiryDate: exp5d,
        location: {
          address: '108 Grand Avenue, Dry Storage',
          locality: 'Downtown',
          city: 'Metro City',
          landmark: 'South Logistics Dock',
          coordinates: { latitude: 28.6138, longitude: 77.2075 },
        },
        description: 'Individually wrapped oats, dried cranberry, and honey snack bars in factory sealed boxes. Shelf-stable and highly nutritious.',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian', 'Dairy-Free'],
      },
      {
        donor: restaurantDonor._id,
        foodName: 'Cold-Pressed Fresh Orange & Citrus Juice',
        category: 'Beverages',
        quantity: 25,
        unit: 'litres',
        prepDate: twoHoursAgo,
        expiryDate: exp24h(24),
        location: {
          address: '45 Ocean Boulevard, Juice Bar Depot',
          locality: 'Waterfront',
          city: 'Metro City',
          landmark: 'South Pier Hub',
          coordinates: { latitude: 28.6258, longitude: 77.2155 },
        },
        description: '100% pure cold-pressed Valencia orange juice without added sugars or preservatives. Bottled in 1-litre chilled bottles.',
        imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian', 'Vegan', 'Gluten-Free'],
      },
      {
        donor: demoDonor._id,
        foodName: 'Nutritious Rice & Dal Khichdi Meal Boxes',
        category: 'Cooked Meals',
        quantity: 30,
        unit: 'boxes',
        prepDate: twoHoursAgo,
        expiryDate: exp8h(9),
        location: {
          address: '108 Grand Avenue, Hot Service Table',
          locality: 'Downtown',
          city: 'Metro City',
          landmark: 'Civic Food Station',
          coordinates: { latitude: 28.6146, longitude: 77.2094 },
        },
        description: 'Gentle, comforting rice and yellow moong dal cooked with cumin, turmeric, and clarified butter. Packed in thermal meal boxes.',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian', 'Gluten-Free', 'Nut-Free'],
      },
      {
        donor: restaurantDonor._id,
        foodName: 'Artisan Veggie & Cheese Panini Sandwiches',
        category: 'Cooked Meals',
        quantity: 20,
        unit: 'items',
        prepDate: twoHoursAgo,
        expiryDate: exp10h,
        location: {
          address: '45 Ocean Boulevard, Deli Counter',
          locality: 'Waterfront',
          city: 'Metro City',
          landmark: 'Waterfront Food Court',
          coordinates: { latitude: 28.6265, longitude: 77.2138 },
        },
        description: 'Grilled ciabatta sandwiches with mozzarella, pesto, sun-dried tomatoes, and crisp arugula. Separately foil-wrapped.',
        imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian'],
      },
      {
        donor: demoDonor._id,
        foodName: 'Wholesome Breakfast Boxes (Oats, Fruit & Egg)',
        category: 'Cooked Meals',
        quantity: 22,
        unit: 'boxes',
        prepDate: twoHoursAgo,
        expiryDate: exp8h(7),
        location: {
          address: '108 Grand Avenue, Morning Prep Station',
          locality: 'Downtown',
          city: 'Metro City',
          landmark: 'Station Square 1',
          coordinates: { latitude: 28.6130, longitude: 77.2082 },
        },
        description: 'Balanced breakfast boxes containing hard-boiled eggs, rolled oats with cinnamon, and fresh sliced fruit cups.',
        imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Dairy-Free', 'Nut-Free'],
      },
      {
        donor: restaurantDonor._id,
        foodName: 'Fresh Mediterranean Salad Bowls',
        category: 'Fresh Produce',
        quantity: 26,
        unit: 'portions',
        prepDate: twoHoursAgo,
        expiryDate: exp16h,
        location: {
          address: '45 Ocean Boulevard, Salad Bar',
          locality: 'Waterfront',
          city: 'Metro City',
          landmark: 'Bayside Gardens',
          coordinates: { latitude: 28.6252, longitude: 77.2148 },
        },
        description: 'Fresh romaine lettuce, kalamata olives, cherry tomatoes, cucumbers, and crumbled feta cheese with olive oil dressing on the side.',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
        dietaryInfo: ['Vegetarian', 'Gluten-Free'],
      },
    ];

    const createdDonations = [];
    for (const spec of demoDonationSpecs) {
      const created = await Donation.create({
        ...spec,
        status: 'available',
        reservedQuantity: 0,
        isDemo: true,
      });
      createdDonations.push(created);
    }

    console.log(`📦 Seeded ${createdDonations.length} demo donations across all food categories.`);

    // Seed 3 realistic demo pickup requests
    // 1. Pending pickup on Biryani
    const pendingPickup = await Pickup.create({
      donation: createdDonations[0]._id,
      recipient: demoRecipient._id,
      donor: demoDonor._id,
      status: 'pending',
      requestedQuantity: 10,
      notes: 'For Hope Shelter evening dinner distribution. Our volunteer van will pick up at 6:30 PM.',
      preferredDate: new Date().toISOString().slice(0, 10),
      preferredTime: '18:30',
      isDemo: true,
    });

    // 2. Approved pickup on Chapati Packs (reservedQuantity = 20)
    createdDonations[1].reservedQuantity = 20;
    await createdDonations[1].save();

    const approvedPickup = await Pickup.create({
      donation: createdDonations[1]._id,
      recipient: demoRecipient._id,
      donor: demoDonor._id,
      status: 'approved',
      requestedQuantity: 20,
      notes: 'Approved! Please arrive at Rear Delivery Bay. Staff will assist loading directly into your vehicle.',
      preferredDate: new Date().toISOString().slice(0, 10),
      preferredTime: '19:00',
      approvedAt: new Date(),
      isDemo: true,
    });

    // 3. Completed pickup on Sourdough bread
    createdDonations[4].reservedQuantity = 10;
    createdDonations[4].status = 'available';
    await createdDonations[4].save();

    const completedPickup = await Pickup.create({
      donation: createdDonations[4]._id,
      recipient: demoRecipient._id,
      donor: demoDonor._id,
      status: 'completed',
      requestedQuantity: 10,
      notes: 'Successfully collected and served with hot soup at lunch service. Thank you for eliminating waste!',
      preferredDate: new Date(now - 12 * 60 * 60 * 1000).toISOString().slice(0, 10),
      preferredTime: '12:00',
      approvedAt: new Date(now - 14 * 60 * 60 * 1000),
      completedAt: new Date(now - 11 * 60 * 60 * 1000),
      isDemo: true,
    });

    console.log('🤝 Seeded 3 demo pickup workflows (pending, approved, completed).');
    console.log('✅ Demo database initialization completed successfully!');
    return true;
  } catch (err) {
    console.error('❌ Error during demo database seeding:', err);
    return false;
  }
}

// Helpers
function exp8h(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function exp24h(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// Run standalone if invoked directly
if (require.main === module) {
  seedDemoData()
    .then((success) => {
      disconnectDatabase();
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      console.error(err);
      disconnectDatabase();
      process.exit(1);
    });
}
