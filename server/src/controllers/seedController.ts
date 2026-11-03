import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Donation } from '../models/Donation';
import { Pickup } from '../models/Pickup';
import { getDatabaseStatus } from '../config/database';

export async function runDatabaseSeed(_req: Request, res: Response): Promise<void> {
  const dbStatus = getDatabaseStatus();

  if (!dbStatus.connected) {
    res.status(503).json({
      success: false,
      message:
        'MongoDB Atlas is not connected yet. Please paste your connection string into server/.env as MONGODB_URI=... and restart the server before seeding.',
    });
    return;
  }

  try {
    // Clear existing collections safely
    await Pickup.deleteMany({});
    await Donation.deleteMany({});
    await User.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const donorPasswordHash = await bcrypt.hash('donor123', salt);
    const recipientPasswordHash = await bcrypt.hash('shelter123', salt);

    const donorUser = await User.create({
      name: 'Chef Marco Rossi',
      email: 'donor@foodbridge.org',
      phone: '+1-555-0144',
      passwordHash: donorPasswordHash,
      role: 'donor',
      organization: 'Bella Vista Ristorante',
      address: '108 Grand Avenue, Metro City',
      bio: 'Authentic Italian trattoria committed to eliminating kitchen prep waste.',
    });

    const recipientUser = await User.create({
      name: 'Sister Mary Teresa',
      email: 'shelter@foodbridge.org',
      phone: '+1-555-0189',
      passwordHash: recipientPasswordHash,
      role: 'recipient',
      organization: 'Hope Community Kitchen & Shelter',
      address: '24 St. Jude Plaza, Metro City',
      bio: 'Non-profit meal center serving 250 hot meals daily to unhoused families.',
    });

    const now = Date.now();
    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000);
    const fourHoursLater = new Date(now + 4 * 60 * 60 * 1000); // Expiring soon
    const eightHoursLater = new Date(now + 8 * 60 * 60 * 1000); // Expiring soon
    const twentyHoursLater = new Date(now + 20 * 60 * 60 * 1000); // Expiring soon
    const twoDaysLater = new Date(now + 48 * 60 * 60 * 1000); // Fresh
    const fourDaysLater = new Date(now + 96 * 60 * 60 * 1000); // Fresh
    const sixDaysLater = new Date(now + 144 * 60 * 60 * 1000); // Fresh

    const d1 = await Donation.create({
      donor: donorUser._id,
      foodName: 'Warm Vegetable Pasta Primavera & Focaccia',
      category: 'Cooked Meals',
      quantity: 25,
      unit: 'portions',
      prepDate: twoHoursAgo,
      expiryDate: fourHoursLater,
      location: {
        address: '108 Grand Avenue, Kitchen Entrance',
        city: 'Metro City',
        landmark: 'Service Alley Door',
      },
      description: 'Hot prepared penne with zucchini, roasted bell peppers, and olive oil in deep aluminum trays.',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      dietaryInfo: ['Vegetarian', 'Halal', 'Nut-Free'],
      status: 'available',
    });

    const d2 = await Donation.create({
      donor: donorUser._id,
      foodName: 'Fresh Artisanal Sourdough & French Baguettes',
      category: 'Bakery & Bread',
      quantity: 35,
      unit: 'items',
      prepDate: twoHoursAgo,
      expiryDate: eightHoursLater,
      location: {
        address: '108 Grand Avenue, Rear Loading Bay',
        city: 'Metro City',
        landmark: 'Near City Hall',
      },
      description: 'Golden crust sourdough loaves and baguettes baked this morning. Sealed in food-grade baker bags.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      dietaryInfo: ['Vegetarian', 'Vegan'],
      status: 'available',
    });

    const d3 = await Donation.create({
      donor: donorUser._id,
      foodName: 'Organic Crisp Apples & Citrus Fruit Crates',
      category: 'Fresh Produce',
      quantity: 40,
      unit: 'kg',
      prepDate: twoHoursAgo,
      expiryDate: twoDaysLater,
      location: {
        address: '108 Grand Avenue, Front Counter',
        city: 'Metro City',
      },
      description: 'Washed and sorted seasonal orchard apples and oranges in wooden produce crates.',
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
      dietaryInfo: ['Vegan', 'Gluten-Free', 'Nut-Free'],
      status: 'available',
    });

    const d4 = await Donation.create({
      donor: donorUser._id,
      foodName: 'Pasteurized Whole Milk & Natural Yogurt Crates',
      category: 'Dairy & Eggs',
      quantity: 18,
      unit: 'litres',
      prepDate: twoHoursAgo,
      expiryDate: twentyHoursLater,
      location: {
        address: '108 Grand Avenue, Walk-In Chiller',
        city: 'Metro City',
      },
      description: 'Unopened dairy crates stored strictly at 2°C in walk-in chiller.',
      imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80',
      dietaryInfo: ['Vegetarian', 'Contains Dairy'],
      status: 'available',
    });

    const d5 = await Donation.create({
      donor: donorUser._id,
      foodName: 'Assorted Canned Soups & Steamed White Rice',
      category: 'Packaged & Canned',
      quantity: 50,
      unit: 'portions',
      prepDate: twoHoursAgo,
      expiryDate: fourDaysLater,
      location: {
        address: '108 Grand Avenue, Pantry Stockroom',
        city: 'Metro City',
      },
      description: 'Sealed vegetable broth cans and pre-portioned steam-table basmati rice boxes.',
      imageUrl: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=600&q=80',
      dietaryInfo: ['Vegetarian', 'Gluten-Free'],
      status: 'available',
    });

    const d6 = await Donation.create({
      donor: donorUser._id,
      foodName: 'Fresh Cold-Pressed Orange & Apple Juices',
      category: 'Beverages',
      quantity: 20,
      unit: 'litres',
      prepDate: twoHoursAgo,
      expiryDate: sixDaysLater,
      location: {
        address: '108 Grand Avenue, Beverage Fridge',
        city: 'Metro City',
      },
      description: '100% natural fruit juice bottled today, kept chilled at 3°C.',
      imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80',
      dietaryInfo: ['Vegan', 'Gluten-Free'],
      status: 'available',
    });

    // Create a Sample Completed Pickup
    await Pickup.create({
      donation: d3._id,
      recipient: recipientUser._id,
      donor: donorUser._id,
      status: 'completed',
      notes: 'Picked up via shelter van and distributed to family lunch program.',
      requestedPickupTime: twoHoursAgo,
      approvedAt: twoHoursAgo,
      completedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Demo dataset successfully loaded into MongoDB Atlas!',
      counts: {
        users: 2,
        donations: 6,
        pickups: 1,
      },
      demoCredentials: {
        donor: 'donor@foodbridge.org / donor123',
        recipient: 'shelter@foodbridge.org / shelter123',
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to seed database: ' + err.message,
    });
  }
}
