import mongoose from 'mongoose';
import { roleSchema } from './role.schema';

export interface IRole {
  _id: mongoose.Types.ObjectId;
  societyId: mongoose.Types.ObjectId;
  name: 'Super Admin' | 'Society Admin' | 'Resident' | 'Vendor';
  description: string;
  permissions: mongoose.Types.ObjectId[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const Role = mongoose.model<IRole>('Role', roleSchema);

export default Role;
