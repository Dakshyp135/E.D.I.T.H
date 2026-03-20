export enum UserRole {
  BENEFACTOR = 'BENEFACTOR',
  NOMINEE = 'NOMINEE',
  WITNESS = 'WITNESS'
}

export enum AssetCategory {
  SOCIAL = 'Social Media',
  FINANCIAL = 'Financial Accounts',
  LEGAL = 'Legal Documents',
  PERSONAL = 'Personal Files',
  CRYPTO = 'Crypto Wallets',
  GAMING = 'Gaming Accounts',
  HEIRLOOM = 'Physical Items'
}

export enum VerificationStatus {
  PENDING = 'Pending',
  VERIFIED = 'Verified',
  REJECTED = 'Rejected'
}

export enum AccountStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  DECEASED = 'Deceased'
}

export type Permission = 'VIEW' | 'TRANSFER' | 'MANAGE';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  handle?: string;
  description: string;
  password?: string;
  attachments?: string[]; 
  assignedNomineeIds: string[];
  status: 'Locked' | 'Assigned';
}

export interface Nominee {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  priority: number; // 1 = Primary, 2 = Secondary, etc.
  verificationStatus: VerificationStatus;
  securityKey: string;
}

export interface Witness {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  aadharNumber?: string;
  securityKey: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: AccountStatus;
  witnessThreshold?: number;
  description?: string;
  profileImage?: string;
}

export interface Memory {
  id: string;
  title: string;
  type: 'image' | 'video' | 'letter';
  contentUrl?: string;
  description: string;
  date: string;
}