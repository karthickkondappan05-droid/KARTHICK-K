export interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  district: string;
  houseType: string;
  bhk: number;
  amenities: string[];
  imageUrl: string;
  roomImages?: string[];
  description: string;
  ownerId?: string;
  createdAt: any;
}

export interface UserProfile {
  budgetMin: number;
  budgetMax: number;
  preferredLocation: string;
  preferredDistrict: string;
  preferredHouseType: string;
  preferredBhk: number;
  requiredAmenities: string[];
  favorites: string[];
  sqftMin: number;
  sqftMax: number;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}
