import mongoose from 'mongoose';
import { userSchema } from './user.schema';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  societyId: mongoose.Types.ObjectId;
  roles: mongoose.Types.ObjectId[];
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const User = mongoose.model<IUser>('User', userSchema);

export default User;
