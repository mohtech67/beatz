export type RoleName = 'SUPER_ADMIN' | 'TREASURER' | 'MEMBER_ADMIN' | 'CONTENT_ADMIN' | 'MEMBER';

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  nationalId: string;
  role: RoleName;
  memberId?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Member {
  id: string;
  memberNo: string;
  fullName: string;
  photoUrl?: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  nationalId: string;
  phone: string;
  email: string;
  currentLocation: string;
  address: string;
  departmentId: string;
  departmentName?: string;
  baptismStatus: 'Baptized' | 'Not Baptized' | 'Pending';
  baptismDate?: string;
  maritalStatus: 'Single' | 'Married' | 'Widowed' | 'Divorced';
  nextOfKin: string;
  nextOfKinPhone: string;
  status: 'Active' | 'Inactive' | 'Transferred';
  dateRegistered: string;
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  memberCount?: number;
}

export interface ContributionType {
  id: string;
  name: string;
  code: string;
  isDefault?: boolean;
  description: string;
}

export type PaymentMethod = 'Cash' | 'M-Pesa' | 'Bank' | 'Cheque' | 'Other';

export interface FinancialTransaction {
  id: string;
  receiptNo: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  memberPhone: string;
  date: string;
  amount: number;
  contributionTypeId: string;
  contributionTypeName: string;
  paymentMethod: PaymentMethod;
  referenceNo: string;
  treasurerId: string;
  treasurerName: string;
  notes?: string;
  status: 'Completed' | 'Reversed';
  createdAt: string;
}

export type PledgeStatus = 'Active' | 'Completed' | 'Overdue' | 'Cancelled';

export interface Pledge {
  id: string;
  pledgeCode: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  title: string;
  description: string;
  targetAmount: number;
  amountPaid: number;
  balance: number;
  startDate: string;
  dueDate: string;
  status: PledgeStatus;
  notes?: string;
  createdAt: string;
}

export interface PledgePayment {
  id: string;
  pledgeId: string;
  transactionId?: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  referenceNo: string;
  recordedBy: string;
  createdAt: string;
}

export type AssetCondition = 'Active' | 'Damaged' | 'Under Maintenance' | 'Lost' | 'Disposed';

export interface ChurchAsset {
  id: string;
  assetNo: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  purchaseCost: number;
  totalValue: number;
  purchaseDate: string;
  supplier: string;
  condition: AssetCondition;
  location: string;
  serialNumber: string;
  imageUrl?: string;
  departmentId?: string;
  departmentName?: string;
  status: 'In Use' | 'Storage' | 'Retired';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  featuredImage?: string;
  authorId: string;
  authorName: string;
  publishedAt: string;
  status: 'Published' | 'Draft' | 'Archived';
  priority: 'Normal' | 'High' | 'Urgent';
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  createdAt: string;
  imageCount?: number;
}

export interface GalleryImage {
  id: string;
  albumId: string;
  title: string;
  imageUrl: string;
  uploadedBy: string;
  createdAt: string;
}

export interface ChurchSettings {
  churchName: string;
  motto: string;
  churchLogo: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  pastorName: string;
  headElderName: string;
  treasurerName: string;
  primaryColor: string;
  secondaryColor: string;
  currency: string;
  receiptPrefix: string;
  membershipPrefix: string;
  pledgePrefix: string;
  assetPrefix: string;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  target: string;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface FinancialStats {
  totalTithe: number;
  totalOffering: number;
  totalOtherContributions: number;
  totalPledgePaid: number;
  totalOutstandingPledges: number;
  totalAssetsValue: number;
  totalTransactionsCount: number;
  monthlyBreakdown: { month: string; tithe: number; offering: number; other: number }[];
}

export interface MembershipStats {
  totalMembers: number;
  activeMembers: number;
  maleMembers: number;
  femaleMembers: number;
  baptizedMembers: number;
  unbaptizedMembers: number;
  byDepartment: { department: string; count: number }[];
}
