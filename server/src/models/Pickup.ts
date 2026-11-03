import mongoose, { Document, Schema, Types } from 'mongoose';

export type PickupStatus = 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';

export interface IPickup extends Document {
  donation: Types.ObjectId;
  recipient: Types.ObjectId;
  donor: Types.ObjectId;
  status: PickupStatus;
  requestedQuantity: number;
  notes?: string;
  preferredDate?: string;
  preferredTime?: string;
  requestedPickupTime?: Date;
  approvedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  isDemo?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PickupSchema = new Schema<IPickup>(
  {
    donation: {
      type: Schema.Types.ObjectId,
      ref: 'Donation',
      required: [true, 'Donation reference is required'],
      index: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient reference is required'],
      index: true,
    },
    donor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor reference is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
      index: true,
    },
    requestedQuantity: {
      type: Number,
      required: [true, 'Requested quantity is required'],
      min: [0.1, 'Requested quantity must be greater than zero'],
      default: 1,
    },
    preferredDate: {
      type: String,
      trim: true,
    },
    preferredTime: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    requestedPickupTime: {
      type: Date,
    },
    approvedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: '',
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

// Indexes for fast lookup by user and active pickup status
PickupSchema.index({ recipient: 1, status: 1 });
PickupSchema.index({ donor: 1, status: 1 });
PickupSchema.index({ donation: 1, status: 1 });

export const Pickup = mongoose.model<IPickup>('Pickup', PickupSchema);
