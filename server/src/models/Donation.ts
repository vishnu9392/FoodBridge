import mongoose, { Document, Schema, Types } from 'mongoose';

export type FoodCategory =
  | 'Cooked Meals'
  | 'Bakery & Bread'
  | 'Fresh Produce'
  | 'Dairy & Eggs'
  | 'Packaged & Canned'
  | 'Beverages'
  | 'Other';

export type QuantityUnit = 'kg' | 'portions' | 'boxes' | 'items' | 'litres';

export type DonationStatus = 'available' | 'reserved' | 'completed' | 'expired' | 'cancelled';

export interface IDonationLocation {
  address: string;
  locality?: string;
  city: string;
  state?: string;
  postalCode?: string;
  landmark?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface IDonation extends Document {
  donor: Types.ObjectId;
  foodName: string;
  category: FoodCategory;
  quantity: number;
  reservedQuantity: number;
  unit: QuantityUnit;
  prepDate: Date;
  expiryDate: Date;
  location: IDonationLocation;
  description: string;
  imageUrl: string;
  dietaryInfo: string[];
  status: DonationStatus;
  isDemo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    donor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor reference is required'],
      index: true,
    },
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: [120, 'Food name cannot exceed 120 characters'],
    },
    category: {
      type: String,
      enum: [
        'Cooked Meals',
        'Bakery & Bread',
        'Fresh Produce',
        'Dairy & Eggs',
        'Packaged & Canned',
        'Beverages',
        'Other',
      ],
      required: [true, 'Food category is required'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be greater than zero'],
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Reserved quantity cannot be negative'],
    },
    unit: {
      type: String,
      enum: ['kg', 'portions', 'boxes', 'items', 'litres'],
      default: 'portions',
      required: true,
    },
    prepDate: {
      type: Date,
      required: [true, 'Preparation date and time is required'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date and time is required'],
      index: true,
    },
    location: {
      address: {
        type: String,
        required: [true, 'Pickup address is required'],
        trim: true,
      },
      locality: {
        type: String,
        trim: true,
        default: '',
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        index: true,
      },
      state: {
        type: String,
        trim: true,
        default: '',
      },
      postalCode: {
        type: String,
        trim: true,
        default: '',
      },
      landmark: {
        type: String,
        trim: true,
        default: '',
      },
      coordinates: {
        latitude: {
          type: Number,
          default: null,
        },
        longitude: {
          type: Number,
          default: null,
        },
      },
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    imageUrl: {
      type: String,
      trim: true,
      default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    },
    dietaryInfo: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'completed', 'expired', 'cancelled'],
      default: 'available',
      index: true,
    },
    isDemo: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Helpful compound index for listing available food sorted by expiry
DonationSchema.index({ status: 1, expiryDate: 1 });
DonationSchema.index({ category: 1, status: 1 });

export const Donation = mongoose.model<IDonation>('Donation', DonationSchema);
