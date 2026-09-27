export interface Address {
  id: string;
  userId: number;

  fullName: string;
  phone: string;

  addressLine: string;
  city: string;
  state: string;
  pincode: string;

  landmark?: string;

  isDefault: boolean;

  createdAt: string;
  updatedAt: string;
}