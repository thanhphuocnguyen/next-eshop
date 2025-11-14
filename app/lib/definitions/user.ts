export type UserModel = {
  id: string;
  roleId: string;
  roleCode: string;
  username: string;
  firstName: string;
  locked: boolean;
  avatarImageId?: string;
  avatarUrl?: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt?: Date;
  verifiedEmail?: boolean;
  verifiedPhone?: boolean;
  updatedAt?: Date;
  passwordChangedAt?: Date;
  lastLoginAt?: Date;
  addresses?: AddressModel[];
};

export type AddressModel = {
  id: string;
  phone: string;
  street: string;
  ward?: string;
  district: string;
  city: string;
  isDefault: boolean;
};
