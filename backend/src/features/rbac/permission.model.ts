import mongoose from 'mongoose';
import { permissionSchema } from './permission.schema';

export interface IPermission {
  _id: mongoose.Types.ObjectId;
  societyId: mongoose.Types.ObjectId;
  resource: string;
  action: string;
  description: string;
  createdAt: Date;
}

const Permission = mongoose.model<IPermission>('Permission', permissionSchema);

export default Permission;
