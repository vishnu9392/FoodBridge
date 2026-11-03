import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User, IUser, UserRole } from '../models/User';
import { generateToken } from '../utils/jwt';
import { validateEmail, validatePassword, validatePhone } from '../utils/validation';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, email, phone, password, role, organization, address, bio } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Full name is required.' });
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      res.status(400).json({ success: false, message: emailValidation.error });
      return;
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.valid) {
      res.status(400).json({ success: false, message: phoneValidation.error });
      return;
    }

    const passValidation = validatePassword(password);
    if (!passValidation.valid) {
      res.status(400).json({ success: false, message: passValidation.error });
      return;
    }

    const allowedRoles: UserRole[] = ['donor', 'recipient'];
    const userRole: UserRole = allowedRoles.includes(role) ? role : 'recipient';

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      passwordHash,
      role: userRole,
      organization: organization ? organization.trim() : '',
      address: address ? address.trim() : '',
      bio: bio ? bio.trim() : '',
    });

    const token = generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        organization: newUser.organization,
        address: newUser.address,
        bio: newUser.bio,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Both email and password are required to log in.',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select('+passwordHash');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
      return;
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        organization: user.organization,
        address: user.address,
        bio: user.bio,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User profile not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { name, phone, organization, address, bio } = req.body;
    const updates: Partial<IUser> = {};

    if (name && name.trim()) updates.name = name.trim();
    if (phone && phone.trim()) {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.valid) {
        res.status(400).json({ success: false, message: phoneValidation.error });
        return;
      }
      updates.phone = phone.trim();
    }
    if (organization !== undefined) updates.organization = organization.trim();
    if (address !== undefined) updates.address = address.trim();
    if (bio !== undefined) updates.bio = bio.trim();

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password and new password are both required.',
      });
      return;
    }

    const passValidation = validatePassword(newPassword);
    if (!passValidation.valid) {
      res.status(400).json({ success: false, message: passValidation.error });
      return;
    }

    const user = await User.findById(req.user.id).select('+passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({
        success: false,
        message: 'Current password does not match.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err) {
    next(err);
  }
}
