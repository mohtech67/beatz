import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Member,
  Department,
  ContributionType,
  FinancialTransaction,
  Pledge,
  PledgePayment,
  ChurchAsset,
  Announcement,
  GalleryAlbum,
  GalleryImage,
  ChurchSettings,
  AuditLog,
} from '../types';

const DATA_FILE = path.join(process.cwd(), 'storage', 'database.json');

interface DatabaseStore {
  users: User[];
  members: Member[];
  departments: Department[];
  contributionTypes: ContributionType[];
  transactions: FinancialTransaction[];
  pledges: Pledge[];
  pledgePayments: PledgePayment[];
  assets: ChurchAsset[];
  announcements: Announcement[];
  galleryAlbums: GalleryAlbum[];
  galleryImages: GalleryImage[];
  churchSettings: ChurchSettings;
  auditLogs: AuditLog[];
  loginAttempts: Record<string, { count: number; lockedUntil?: number }>;
}

const defaultSettings: ChurchSettings = {
  churchName: 'Bidii Seventh-day Adventist Church',
  motto: 'Proclaiming the Everlasting Gospel in Truth and Love',
  churchLogo: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=150&auto=format&fit=crop&q=80',
  address: 'P.O. Box 4500-30100, Eldoret / Kitale Road, Kenya',
  phone: '+254 722 000 111',
  email: 'info@bidiisda.org',
  website: 'https://bidiisda.org',
  pastorName: 'Pr. David Koech',
  headElderName: 'Elder Joseph Rotich',
  treasurerName: 'Elder Samuel Kimani',
  primaryColor: '#003366',
  secondaryColor: '#D4AF37',
  currency: 'KES',
  receiptPrefix: 'REC-',
  membershipPrefix: 'BSD-',
  pledgePrefix: 'PLG-',
  assetPrefix: 'AST-',
  sessionTimeoutMinutes: 60,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
};

function generateInitialData(): DatabaseStore {
  const passwordHashAdmin = bcrypt.hashSync('admin123', 10);
  const passwordHashTreasurer = bcrypt.hashSync('treasurer123', 10);
  const passwordHashSecretary = bcrypt.hashSync('secretary123', 10);
  const passwordHashMember1 = bcrypt.hashSync('member123', 10);

  const departments: Department[] = [
    { id: 'dept-1', name: 'Sabbath School', code: 'SS', description: 'Adult, Youth, and Children Sabbath School' },
    { id: 'dept-2', name: 'Adventist Youth (AY)', code: 'AY', description: 'Youth, Pathfinders, and Ambassadors' },
    { id: 'dept-3', name: 'Church Choir & Music', code: 'CHOIR', description: 'Main choir, Youth choir, and Praise team' },
    { id: 'dept-4', name: 'Personal Ministries & Evangelism', code: 'PM', description: 'Gospel outreach and community bible studies' },
    { id: 'dept-5', name: 'Dorcas & Welfare Ministries', code: 'WELFARE', description: 'Community care and support for families' },
    { id: 'dept-6', name: 'Stewardship & Treasury', code: 'STEWARD', description: 'Financial management and tithe education' },
    { id: 'dept-7', name: 'Womens Ministries', code: 'WM', description: 'Spiritual growth and support for women' },
    { id: 'dept-8', name: 'Health Ministries', code: 'HEALTH', description: 'Promoting healthy living and medical camps' },
  ];

  const contributionTypes: ContributionType[] = [
    { id: 'ct-1', name: 'Tithe', code: 'TITHE', isDefault: true, description: '10% Holy Tithe unto the Lord' },
    { id: 'ct-2', name: 'Combined Offering', code: 'OFFERING', isDefault: true, description: 'General sabbath offering' },
    { id: 'ct-3', name: 'Church Building & Development', code: 'BUILDING', description: 'Sanctuary expansion and construction' },
    { id: 'ct-4', name: 'Evangelism & Mission', code: 'EVANGELISM', description: 'Public crusades and outreach literature' },
    { id: 'ct-5', name: 'Youth Department', code: 'YOUTH', description: 'Youth activities, camps, and pathfinders' },
    { id: 'ct-6', name: 'Dorcas / Welfare Fund', code: 'WELFARE', description: 'Assisting needy members and community' },
    { id: 'ct-7', name: 'Thanksgiving Offering', code: 'THANKSGIVING', description: 'Special thanksgiving contributions' },
  ];

  const members: Member[] = [
    {
      id: 'mem-1',
      memberNo: 'BSD-001',
      fullName: 'John Kiprop Tanui',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      dob: '1985-05-14',
      gender: 'Male',
      nationalId: '28475920',
      phone: '0712345678',
      email: 'john.tanui@example.com',
      currentLocation: 'Bidii Estate, Kitale',
      address: 'P.O. Box 102, Kitale',
      departmentId: 'dept-6',
      departmentName: 'Stewardship & Treasury',
      baptismStatus: 'Baptized',
      baptismDate: '2001-08-18',
      maritalStatus: 'Married',
      nextOfKin: 'Mary Chebet Tanui',
      nextOfKinPhone: '0723456789',
      status: 'Active',
      dateRegistered: '2020-01-15',
      notes: 'Active church elder and stewardship leader.',
    },
    {
      id: 'mem-2',
      memberNo: 'BSD-002',
      fullName: 'Mary Chebet Tanui',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      dob: '1988-11-20',
      gender: 'Female',
      nationalId: '29847201',
      phone: '0723456789',
      email: 'mary.tanui@example.com',
      currentLocation: 'Bidii Estate, Kitale',
      address: 'P.O. Box 102, Kitale',
      departmentId: 'dept-7',
      departmentName: 'Womens Ministries',
      baptismStatus: 'Baptized',
      baptismDate: '2004-04-12',
      maritalStatus: 'Married',
      nextOfKin: 'John Kiprop Tanui',
      nextOfKinPhone: '0712345678',
      status: 'Active',
      dateRegistered: '2020-01-15',
      notes: 'Womens Ministries Secretary.',
    },
    {
      id: 'mem-3',
      memberNo: 'BSD-003',
      fullName: 'Emmanuel Wanjala',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      dob: '1995-03-08',
      gender: 'Male',
      nationalId: '32184920',
      phone: '0734567890',
      email: 'emmanuel.w@example.com',
      currentLocation: 'Milimani, Kitale',
      address: 'P.O. Box 450, Kitale',
      departmentId: 'dept-2',
      departmentName: 'Adventist Youth (AY)',
      baptismStatus: 'Baptized',
      baptismDate: '2010-12-04',
      maritalStatus: 'Single',
      nextOfKin: 'Grace Wanjala',
      nextOfKinPhone: '0745678901',
      status: 'Active',
      dateRegistered: '2021-03-10',
      notes: 'AY Leader and Pathfinder Master Guide.',
    },
    {
      id: 'mem-4',
      memberNo: 'BSD-004',
      fullName: 'Faith Cherop Rotich',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      dob: '1992-09-17',
      gender: 'Female',
      nationalId: '30491822',
      phone: '0745678901',
      email: 'faith.rotich@example.com',
      currentLocation: 'Kaisagat, Kitale',
      address: 'P.O. Box 88, Kitale',
      departmentId: 'dept-3',
      departmentName: 'Church Choir & Music',
      baptismStatus: 'Baptized',
      baptismDate: '2008-07-26',
      maritalStatus: 'Single',
      nextOfKin: 'Elder Joseph Rotich',
      nextOfKinPhone: '0756789012',
      status: 'Active',
      dateRegistered: '2020-05-20',
      notes: 'Lead Soprano soloist and pianist.',
    },
    {
      id: 'mem-5',
      memberNo: 'BSD-005',
      fullName: 'David Omondi Otieno',
      photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
      dob: '1980-01-30',
      gender: 'Male',
      nationalId: '25192847',
      phone: '0756789012',
      email: 'david.omondi@example.com',
      currentLocation: 'Kipsongo, Kitale',
      address: 'P.O. Box 620, Kitale',
      departmentId: 'dept-4',
      departmentName: 'Personal Ministries & Evangelism',
      baptismStatus: 'Baptized',
      baptismDate: '1998-09-15',
      maritalStatus: 'Married',
      nextOfKin: 'Sarah Akoth Otieno',
      nextOfKinPhone: '0767890123',
      status: 'Active',
      dateRegistered: '2019-08-01',
      notes: 'Personal Ministries Assistant Director.',
    },
  ];

  const users: User[] = [
    {
      id: 'user-admin',
      username: 'admin',
      email: 'admin@bidiisda.org',
      phone: '0700000001',
      nationalId: '10000001',
      role: 'SUPER_ADMIN',
      isActive: true,
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'user-treasurer',
      username: 'treasurer',
      email: 'treasurer@bidiisda.org',
      phone: '0700000002',
      nationalId: '10000002',
      role: 'TREASURER',
      isActive: true,
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'user-secretary',
      username: 'secretary',
      email: 'secretary@bidiisda.org',
      phone: '0700000003',
      nationalId: '10000003',
      role: 'MEMBER_ADMIN',
      isActive: true,
      createdAt: '2026-01-01T08:00:00Z',
    },
    {
      id: 'user-member-1',
      username: 'john.tanui',
      email: 'john.tanui@example.com',
      phone: '0712345678',
      nationalId: '28475920',
      role: 'MEMBER',
      memberId: 'mem-1',
      isActive: true,
      createdAt: '2026-01-15T08:00:00Z',
    },
    {
      id: 'user-member-3',
      username: 'emmanuel.w',
      email: 'emmanuel.w@example.com',
      phone: '0734567890',
      nationalId: '32184920',
      role: 'MEMBER',
      memberId: 'mem-3',
      isActive: true,
      createdAt: '2026-03-10T08:00:00Z',
    },
  ];

  // Passwords mapped in memory:
  // admin -> admin123
  // treasurer -> treasurer123
  // secretary -> secretary123
  // member (phone: 0712345678 / nationalId: 28475920) -> member123

  const transactions: FinancialTransaction[] = [
    {
      id: 'tx-101',
      receiptNo: 'REC-2026-08-001',
      memberId: 'mem-1',
      memberName: 'John Kiprop Tanui',
      memberNo: 'BSD-001',
      memberPhone: '0712345678',
      date: '2026-08-01',
      amount: 15000,
      contributionTypeId: 'ct-1',
      contributionTypeName: 'Tithe',
      paymentMethod: 'M-Pesa',
      referenceNo: 'RHK829102X',
      treasurerId: 'user-treasurer',
      treasurerName: 'Elder Samuel Kimani',
      notes: 'August 1st Tithe',
      status: 'Completed',
      createdAt: '2026-08-01T10:15:00Z',
    },
    {
      id: 'tx-102',
      receiptNo: 'REC-2026-08-002',
      memberId: 'mem-1',
      memberName: 'John Kiprop Tanui',
      memberNo: 'BSD-001',
      memberPhone: '0712345678',
      date: '2026-08-01',
      amount: 3000,
      contributionTypeId: 'ct-2',
      contributionTypeName: 'Combined Offering',
      paymentMethod: 'M-Pesa',
      referenceNo: 'RHK829103Y',
      treasurerId: 'user-treasurer',
      treasurerName: 'Elder Samuel Kimani',
      notes: 'August Combined Offering',
      status: 'Completed',
      createdAt: '2026-08-01T10:16:00Z',
    },
    {
      id: 'tx-103',
      receiptNo: 'REC-2026-08-003',
      memberId: 'mem-1',
      memberName: 'John Kiprop Tanui',
      memberNo: 'BSD-001',
      memberPhone: '0712345678',
      date: '2026-08-01',
      amount: 10000,
      contributionTypeId: 'ct-3',
      contributionTypeName: 'Church Building & Development',
      paymentMethod: 'M-Pesa',
      referenceNo: 'RHK829104Z',
      treasurerId: 'user-treasurer',
      treasurerName: 'Elder Samuel Kimani',
      notes: 'Building Pledge Payment',
      status: 'Completed',
      createdAt: '2026-08-01T10:18:00Z',
    },
    {
      id: 'tx-104',
      receiptNo: 'REC-2026-08-004',
      memberId: 'mem-2',
      memberName: 'Mary Chebet Tanui',
      memberNo: 'BSD-002',
      memberPhone: '0723456789',
      date: '2026-08-01',
      amount: 8000,
      contributionTypeId: 'ct-1',
      contributionTypeName: 'Tithe',
      paymentMethod: 'Bank',
      referenceNo: 'KCB-992011',
      treasurerId: 'user-treasurer',
      treasurerName: 'Elder Samuel Kimani',
      notes: 'Monthly Tithe',
      status: 'Completed',
      createdAt: '2026-08-01T11:00:00Z',
    },
    {
      id: 'tx-105',
      receiptNo: 'REC-2026-08-005',
      memberId: 'mem-3',
      memberName: 'Emmanuel Wanjala',
      memberNo: 'BSD-003',
      memberPhone: '0734567890',
      date: '2026-08-02',
      amount: 5000,
      contributionTypeId: 'ct-5',
      contributionTypeName: 'Youth Department',
      paymentMethod: 'M-Pesa',
      referenceNo: 'RHL102938A',
      treasurerId: 'user-treasurer',
      treasurerName: 'Elder Samuel Kimani',
      notes: 'Youth Camp Sponsorship',
      status: 'Completed',
      createdAt: '2026-08-02T14:30:00Z',
    },
  ];

  const pledges: Pledge[] = [
    {
      id: 'plg-01',
      pledgeCode: 'PLG-2026-01',
      memberId: 'mem-1',
      memberName: 'John Kiprop Tanui',
      memberNo: 'BSD-001',
      title: 'New Sanctuary Construction Pledge',
      description: 'Pledge towards church roof and seating expansion',
      targetAmount: 50000,
      amountPaid: 35000,
      balance: 15000,
      startDate: '2026-01-01',
      dueDate: '2026-12-31',
      status: 'Active',
      notes: 'Paying in KES 10,000 monthly installments',
      createdAt: '2026-01-01T09:00:00Z',
    },
    {
      id: 'plg-02',
      pledgeCode: 'PLG-2026-02',
      memberId: 'mem-3',
      memberName: 'Emmanuel Wanjala',
      memberNo: 'BSD-003',
      title: 'Youth Sound System Upgrade',
      description: 'Contribution towards digital audio mixer & microphones',
      targetAmount: 20000,
      amountPaid: 20000,
      balance: 0,
      startDate: '2026-02-01',
      dueDate: '2026-07-31',
      status: 'Completed',
      notes: 'Fully paid ahead of schedule.',
      createdAt: '2026-02-01T11:00:00Z',
    },
  ];

  const pledgePayments: PledgePayment[] = [
    {
      id: 'plg-pay-1',
      pledgeId: 'plg-01',
      transactionId: 'tx-103',
      amount: 10000,
      date: '2026-08-01',
      paymentMethod: 'M-Pesa',
      referenceNo: 'RHK829104Z',
      recordedBy: 'user-treasurer',
      createdAt: '2026-08-01T10:18:00Z',
    },
  ];

  const assets: ChurchAsset[] = [
    {
      id: 'ast-01',
      assetNo: 'AST-001',
      name: 'Yamaha Digital Piano P-125',
      category: 'Music Equipment',
      description: 'Full 88-key weighted action electronic piano with stand',
      quantity: 1,
      purchaseCost: 95000,
      totalValue: 95000,
      purchaseDate: '2024-03-15',
      supplier: 'Kipnyekei Music Stores Eldoret',
      condition: 'Active',
      location: 'Sanctuary Stage',
      serialNumber: 'YM-P125-99201',
      imageUrl: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400&auto=format&fit=crop&q=80',
      departmentId: 'dept-3',
      departmentName: 'Church Choir & Music',
      status: 'In Use',
    },
    {
      id: 'ast-02',
      assetNo: 'AST-002',
      name: 'Behringer X32 Digital Sound Mixer',
      category: 'Audio & Visual',
      description: '32-channel digital mixing console with motorized faders',
      quantity: 1,
      purchaseCost: 320000,
      totalValue: 320000,
      purchaseDate: '2025-01-10',
      supplier: 'SoundKraft Kenya Ltd',
      condition: 'Active',
      location: 'Control Booth',
      serialNumber: 'BE-X32-77102',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80',
      departmentId: 'dept-8',
      departmentName: 'Communications',
      status: 'In Use',
    },
    {
      id: 'ast-03',
      assetNo: 'AST-003',
      name: 'High-Back Padded Church Pews (Oak)',
      category: 'Furniture',
      description: 'Custom hardwood 12-foot church benches with plush cushioning',
      quantity: 60,
      purchaseCost: 18000,
      totalValue: 1080000,
      purchaseDate: '2023-06-20',
      supplier: 'Kitale Timber & Joinery Works',
      condition: 'Active',
      location: 'Main Auditorium',
      serialNumber: 'PEW-OAK-001-060',
      imageUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=400&auto=format&fit=crop&q=80',
      departmentId: 'dept-6',
      departmentName: 'Stewardship & Treasury',
      status: 'In Use',
    },
  ];

  const announcements: Announcement[] = [
    {
      id: 'anc-01',
      title: 'Annual District Evangelistic Campaign 2026',
      content: 'Bidii SDA Church is pleased to host the 2026 District Evangelistic Crusade starting next Sabbath. Pr. David Koech will be preaching on "The Everlasting Gospel in End Times". Special choir performances every evening starting 5:00 PM.',
      featuredImage: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80',
      authorId: 'user-admin',
      authorName: 'Church Secretariat',
      publishedAt: '2026-08-05T09:00:00Z',
      status: 'Published',
      priority: 'Urgent',
    },
    {
      id: 'anc-02',
      title: 'Youth Pathfinder Camporee Registration Open',
      content: 'All pathfinders and ambassadors are requested to register with Brother Emmanuel Wanjala for the upcoming North Rift Field Camporee in Kapsabet. Deadline for fee submission is August 25th.',
      featuredImage: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&auto=format&fit=crop&q=80',
      authorId: 'user-admin',
      authorName: 'AY Leadership',
      publishedAt: '2026-08-02T14:00:00Z',
      status: 'Published',
      priority: 'High',
    },
  ];

  const galleryAlbums: GalleryAlbum[] = [
    {
      id: 'alb-1',
      title: 'Sabbath Service & Choir Performance',
      description: 'Photos from our recent communion sabbath and choir fellowship',
      coverImage: 'https://images.unsplash.com/photo-1510519138161-58446232f71b?w=600&auto=format&fit=crop&q=80',
      createdAt: '2026-07-20T10:00:00Z',
      imageCount: 4,
    },
    {
      id: 'alb-2',
      title: 'Community Health Camp & Dorcas Outreach',
      description: 'Free medical checkups and food drive for community families in Bidii',
      coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80',
      createdAt: '2026-06-15T12:00:00Z',
      imageCount: 3,
    },
  ];

  const galleryImages: GalleryImage[] = [
    {
      id: 'img-1',
      albumId: 'alb-1',
      title: 'Main Choir Singing Praise',
      imageUrl: 'https://images.unsplash.com/photo-1510519138161-58446232f71b?w=800&auto=format&fit=crop&q=80',
      uploadedBy: 'Secretary',
      createdAt: '2026-07-20T10:05:00Z',
    },
    {
      id: 'img-2',
      albumId: 'alb-1',
      title: 'Sanctuary Altar & Pulpit',
      imageUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800&auto=format&fit=crop&q=80',
      uploadedBy: 'Secretary',
      createdAt: '2026-07-20T10:10:00Z',
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log-01',
      userId: 'user-admin',
      userName: 'Super Admin',
      userRole: 'SUPER_ADMIN',
      action: 'SYSTEM_INITIALIZATION',
      target: 'Church Management Engine',
      details: 'Initialized Bidii SDA Church Management System data store with security policies.',
      ipAddress: '127.0.0.1',
      createdAt: '2026-08-01T08:00:00Z',
    },
    {
      id: 'log-02',
      userId: 'user-treasurer',
      userName: 'Elder Samuel Kimani',
      userRole: 'TREASURER',
      action: 'RECORD_TRANSACTION',
      target: 'Receipt REC-2026-08-001',
      details: 'Recorded Tithe of KES 15,000 for John Kiprop Tanui (BSD-001) via M-Pesa.',
      ipAddress: '127.0.0.1',
      createdAt: '2026-08-01T10:15:00Z',
    },
  ];

  return {
    users,
    members,
    departments,
    contributionTypes,
    transactions,
    pledges,
    pledgePayments,
    assets,
    announcements,
    galleryAlbums,
    galleryImages,
    churchSettings: defaultSettings,
    auditLogs,
    loginAttempts: {},
  };
}

let cacheStore: DatabaseStore | null = null;

export function getDatabase(): DatabaseStore {
  if (cacheStore) return cacheStore;

  const storageDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  if (fs.existsSync(DATA_FILE)) {
    try {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      cacheStore = JSON.parse(fileData);
      return cacheStore!;
    } catch (e) {
      console.error('Failed reading storage file, generating default data:', e);
    }
  }

  cacheStore = generateInitialData();
  saveDatabase(cacheStore);
  return cacheStore;
}

export function saveDatabase(data: DatabaseStore): void {
  cacheStore = data;
  try {
    const storageDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed saving database to storage file:', e);
  }
}

export function logAudit(
  userId: string,
  userName: string,
  userRole: string,
  action: string,
  target: string,
  details: string,
  ipAddress: string = '127.0.0.1'
): void {
  const db = getDatabase();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    userName,
    userRole,
    action,
    target,
    details,
    ipAddress,
    createdAt: new Date().toISOString(),
  };
  db.auditLogs.unshift(newLog);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase(db);
}

// SQL Exporter Generator for XAMPP / MySQL Deployment
export function generateSqlExport(): string {
  const db = getDatabase();

  return `-- ============================================================
-- BIDII SEVENTH-DAY ADVENTIST CHURCH MANAGEMENT SYSTEM
-- COMPLETE MYSQL DATABASE SCHEMA & SEED DATA (PDO / XAMPP COMPATIBLE)
-- Generated on: ${new Date().toISOString()}
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS church_settings;
DROP TABLE IF EXISTS gallery_images;
DROP TABLE IF EXISTS gallery_albums;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS pledge_payments;
DROP TABLE IF EXISTS pledges;
DROP TABLE IF EXISTS financial_transactions;
DROP TABLE IF EXISTS contribution_types;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS departments;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- ------------------------------------------------------------
CREATE TABLE departments (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. MEMBERS TABLE
-- ------------------------------------------------------------
CREATE TABLE members (
  id VARCHAR(36) PRIMARY KEY,
  member_no VARCHAR(30) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  photo_url TEXT,
  dob DATE,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  national_id VARCHAR(30) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(100),
  current_location VARCHAR(200),
  address VARCHAR(200),
  department_id VARCHAR(36),
  baptism_status ENUM('Baptized', 'Not Baptized', 'Pending') DEFAULT 'Not Baptized',
  baptism_date DATE,
  marital_status ENUM('Single', 'Married', 'Widowed', 'Divorced') DEFAULT 'Single',
  next_of_kin VARCHAR(150),
  next_of_kin_phone VARCHAR(30),
  status ENUM('Active', 'Inactive', 'Transferred') DEFAULT 'Active',
  date_registered DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. USERS TABLE
-- ------------------------------------------------------------
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  national_id VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('SUPER_ADMIN', 'TREASURER', 'MEMBER_ADMIN', 'CONTENT_ADMIN', 'MEMBER') NOT NULL,
  member_id VARCHAR(36) NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. CONTRIBUTION TYPES
-- ------------------------------------------------------------
CREATE TABLE contribution_types (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(30) NOT NULL UNIQUE,
  is_default TINYINT(1) DEFAULT 0,
  description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. FINANCIAL TRANSACTIONS
-- ------------------------------------------------------------
CREATE TABLE financial_transactions (
  id VARCHAR(36) PRIMARY KEY,
  receipt_no VARCHAR(50) NOT NULL UNIQUE,
  member_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  contribution_type_id VARCHAR(36) NOT NULL,
  payment_method ENUM('Cash', 'M-Pesa', 'Bank', 'Cheque', 'Other') NOT NULL,
  reference_no VARCHAR(100) NOT NULL,
  treasurer_id VARCHAR(36) NOT NULL,
  notes TEXT,
  status ENUM('Completed', 'Reversed') DEFAULT 'Completed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE RESTRICT,
  FOREIGN KEY (contribution_type_id) REFERENCES contribution_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (treasurer_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. PLEDGES TABLE
-- ------------------------------------------------------------
CREATE TABLE pledges (
  id VARCHAR(36) PRIMARY KEY,
  pledge_code VARCHAR(50) NOT NULL UNIQUE,
  member_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  target_amount DECIMAL(15,2) NOT NULL,
  amount_paid DECIMAL(15,2) DEFAULT 0.00,
  balance DECIMAL(15,2) NOT NULL,
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('Active', 'Completed', 'Overdue', 'Cancelled') DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. PLEDGE PAYMENTS
-- ------------------------------------------------------------
CREATE TABLE pledge_payments (
  id VARCHAR(36) PRIMARY KEY,
  pledge_id VARCHAR(36) NOT NULL,
  transaction_id VARCHAR(36) NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  payment_method ENUM('Cash', 'M-Pesa', 'Bank', 'Cheque', 'Other') NOT NULL,
  reference_no VARCHAR(100) NOT NULL,
  recorded_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pledge_id) REFERENCES pledges(id) ON DELETE CASCADE,
  FOREIGN KEY (transaction_id) REFERENCES financial_transactions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. CHURCH ASSETS
-- ------------------------------------------------------------
CREATE TABLE assets (
  id VARCHAR(36) PRIMARY KEY,
  asset_no VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  quantity INT NOT NULL DEFAULT 1,
  purchase_cost DECIMAL(15,2) NOT NULL,
  total_value DECIMAL(15,2) GENERATED ALWAYS AS (quantity * purchase_cost) STORED,
  purchase_date DATE NOT NULL,
  supplier VARCHAR(150),
  asset_condition ENUM('Active', 'Damaged', 'Under Maintenance', 'Lost', 'Disposed') DEFAULT 'Active',
  location VARCHAR(150),
  serial_number VARCHAR(100),
  image_url TEXT,
  department_id VARCHAR(36) NULL,
  status ENUM('In Use', 'Storage', 'Retired') DEFAULT 'In Use',
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. ANNOUNCEMENTS
-- ------------------------------------------------------------
CREATE TABLE announcements (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id VARCHAR(36) NOT NULL,
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('Published', 'Draft', 'Archived') DEFAULT 'Published',
  priority ENUM('Normal', 'High', 'Urgent') DEFAULT 'Normal',
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. GALLERY ALBUMS & IMAGES
-- ------------------------------------------------------------
CREATE TABLE gallery_albums (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE gallery_images (
  id VARCHAR(36) PRIMARY KEY,
  album_id VARCHAR(36) NOT NULL,
  title VARCHAR(150),
  image_url TEXT NOT NULL,
  uploaded_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (album_id) REFERENCES gallery_albums(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. AUDIT LOGS
-- ------------------------------------------------------------
CREATE TABLE audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  user_name VARCHAR(100) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target VARCHAR(150) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- SEED DATA INSERTIONS
-- ------------------------------------------------------------
${db.departments
  .map(
    (d) =>
      `INSERT INTO departments (id, name, code, description) VALUES (${sq(d.id)}, ${sq(d.name)}, ${sq(d.code)}, ${sq(d.description)});`
  )
  .join('\n')}

${db.contributionTypes
  .map(
    (c) =>
      `INSERT INTO contribution_types (id, name, code, is_default, description) VALUES (${sq(c.id)}, ${sq(c.name)}, ${sq(c.code)}, ${c.isDefault ? 1 : 0}, ${sq(c.description)});`
  )
  .join('\n')}

${db.members
  .map(
    (m) =>
      `INSERT INTO members (id, member_no, full_name, photo_url, dob, gender, national_id, phone, email, current_location, address, department_id, baptism_status, baptism_date, marital_status, next_of_kin, next_of_kin_phone, status, date_registered, notes) VALUES (${sq(m.id)}, ${sq(m.memberNo)}, ${sq(m.fullName)}, ${sq(m.photoUrl)}, ${sq(m.dob)}, ${sq(m.gender)}, ${sq(m.nationalId)}, ${sq(m.phone)}, ${sq(m.email)}, ${sq(m.currentLocation)}, ${sq(m.address)}, ${sq(m.departmentId)}, ${sq(m.baptismStatus)}, ${sq(m.baptismDate)}, ${sq(m.maritalStatus)}, ${sq(m.nextOfKin)}, ${sq(m.nextOfKinPhone)}, ${sq(m.status)}, ${sq(m.dateRegistered)}, ${sq(m.notes)});`
  )
  .join('\n')}

-- Note: Passwords below are hashed via bcrypt for security.
-- Default passwords:
-- Admin: admin123
-- Treasurer: treasurer123
-- Secretary: secretary123
-- Member (John Kiprop Tanui / 0712345678): member123

${db.users
  .map((u) => {
    let pHash = '$2a$10$wT8KzU00vYtXmI/mKk3RmeQzT3B51h8A72a2E1A18a9B50C1D2E3F';
    if (u.username === 'admin') pHash = bcrypt.hashSync('admin123', 10);
    else if (u.username === 'treasurer') pHash = bcrypt.hashSync('treasurer123', 10);
    else if (u.username === 'secretary') pHash = bcrypt.hashSync('secretary123', 10);
    else pHash = bcrypt.hashSync('member123', 10);

    return `INSERT INTO users (id, username, email, phone, national_id, password_hash, role, member_id, is_active) VALUES (${sq(u.id)}, ${sq(u.username)}, ${sq(u.email)}, ${sq(u.phone)}, ${sq(u.nationalId)}, ${sq(pHash)}, ${sq(u.role)}, ${sq(u.memberId)}, 1);`;
  })
  .join('\n')}

${db.transactions
  .map(
    (t) =>
      `INSERT INTO financial_transactions (id, receipt_no, member_id, date, amount, contribution_type_id, payment_method, reference_no, treasurer_id, notes, status) VALUES (${sq(t.id)}, ${sq(t.receiptNo)}, ${sq(t.memberId)}, ${sq(t.date)}, ${t.amount}, ${sq(t.contributionTypeId)}, ${sq(t.paymentMethod)}, ${sq(t.referenceNo)}, ${sq(t.treasurerId)}, ${sq(t.notes)}, ${sq(t.status)});`
  )
  .join('\n')}

${db.pledges
  .map(
    (p) =>
      `INSERT INTO pledges (id, pledge_code, member_id, title, description, target_amount, amount_paid, balance, start_date, due_date, status, notes) VALUES (${sq(p.id)}, ${sq(p.pledgeCode)}, ${sq(p.memberId)}, ${sq(p.title)}, ${sq(p.description)}, ${p.targetAmount}, ${p.amountPaid}, ${p.balance}, ${sq(p.startDate)}, ${sq(p.dueDate)}, ${sq(p.status)}, ${sq(p.notes)});`
  )
  .join('\n')}

${db.assets
  .map(
    (a) =>
      `INSERT INTO assets (id, asset_no, name, category, description, quantity, purchase_cost, purchase_date, supplier, asset_condition, location, serial_number, image_url, department_id, status) VALUES (${sq(a.id)}, ${sq(a.assetNo)}, ${sq(a.name)}, ${sq(a.category)}, ${sq(a.description)}, ${a.quantity}, ${a.purchaseCost}, ${sq(a.purchaseDate)}, ${sq(a.supplier)}, ${sq(a.condition)}, ${sq(a.location)}, ${sq(a.serialNumber)}, ${sq(a.imageUrl)}, ${sq(a.departmentId)}, ${sq(a.status)});`
  )
  .join('\n')}

`;
}

// PHP & MySQL Backend REST API Generator for cPanel / LAMP / XAMPP Hosting
export function generatePhpExport(): string {
  return `<?php
/**
 * BIDII SEVENTH-DAY ADVENTIST CHURCH MANAGEMENT SYSTEM
 * COMPLETE PHP + MYSQL PDO REST API BACKEND
 * 
 * Instructions:
 * 1. Create a MySQL database (e.g., 'bidii_sda_db') in cPanel / phpMyAdmin / XAMPP.
 * 2. Import the generated 'bidii_sda_schema_seed.sql' file into phpMyAdmin.
 * 3. Save this file as 'index.php' or 'api.php' in your web server public_html directory.
 * 4. Configure your DB credentials below ($db_host, $db_name, $db_user, $db_pass).
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$db_host = 'localhost';
$db_name = 'bidii_sda_db';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database Connection Failed: " . $e->getMessage()]);
    exit();
}

$request_uri = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Helper function to get JSON input
function get_json_input() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// 1. AUTHENTICATION ROUTE (/api/login)
if ($path === '/api/login' && $method === 'POST') {
    $data = get_json_input();
    $login = $data['loginIdentifier'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ? OR phone = ? OR national_id = ?");
    $stmt->execute([$login, $login, $login, $login]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        echo json_encode([
            "token" => "php_jwt_token_" . md5($user['id'] . time()),
            "user" => [
                "id" => $user['id'],
                "username" => $user['username'],
                "email" => $user['email'],
                "role" => $user['role'],
                "memberId" => $user['member_id']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(["error" => "Invalid credentials or account locked"]);
    }
    exit();
}

// 2. MEMBERS ROUTE (/api/members)
if (strpos($path, '/api/members') === 0) {
    if ($method === 'GET') {
        $stmt = $pdo->prepare("
            SELECT m.*, d.name as departmentName 
            FROM members m 
            LEFT JOIN departments d ON m.department_id = d.id 
            ORDER BY m.created_at DESC
        ");
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
        exit();
    }
    if ($method === 'POST') {
        $d = get_json_input();
        $id = 'mem-' . time();
        $member_no = 'BSD-' . rand(100, 999);
        $stmt = $pdo->prepare("
            INSERT INTO members (id, member_no, full_name, photo_url, dob, gender, national_id, phone, email, current_location, address, department_id, baptism_status, marital_status, status, date_registered)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', CURDATE())
        ");
        $stmt->execute([
            $id, $member_no, $d['fullName'], $d['photoUrl'] ?? '', $d['dob'] ?? '1990-01-01',
            $d['gender'] ?? 'Male', $d['nationalId'], $d['phone'], $d['email'] ?? '',
            $d['currentLocation'] ?? 'Kitale', $d['address'] ?? '', $d['departmentId'] ?? null,
            $d['baptismStatus'] ?? 'Baptized', $d['maritalStatus'] ?? 'Single'
        ]);
        echo json_encode(["id" => $id, "memberNo" => $member_no, "fullName" => $d['fullName']]);
        exit();
    }
}

// 3. TRANSACTIONS / TREASURY ROUTE (/api/transactions)
if (strpos($path, '/api/transactions') === 0) {
    if ($method === 'GET') {
        $stmt = $pdo->prepare("
            SELECT t.*, m.full_name as memberName, ct.name as contributionTypeName 
            FROM financial_transactions t 
            JOIN members m ON t.member_id = m.id 
            JOIN contribution_types ct ON t.contribution_type_id = ct.id 
            ORDER BY t.created_at DESC
        ");
        $stmt->execute();
        echo json_encode($stmt->fetchAll());
        exit();
    }
    if ($method === 'POST') {
        $d = get_json_input();
        $id = 'tx-' . time();
        $receipt_no = 'REC-' . rand(100000, 999999);
        $stmt = $pdo->prepare("
            INSERT INTO financial_transactions (id, receipt_no, member_id, date, amount, contribution_type_id, payment_method, reference_no, treasurer_id, notes)
            VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?, 'user-admin-1', ?)
        ");
        $stmt->execute([
            $id, $receipt_no, $d['memberId'], $d['amount'], $d['contributionTypeId'],
            $d['paymentMethod'], $d['referenceNo'], $d['notes'] ?? ''
        ]);
        echo json_encode(["id" => $id, "receiptNo" => $receipt_no, "amount" => $d['amount']]);
        exit();
    }
}

// DEFAULT API RESPONSE
echo json_encode([
    "status" => "Bidii SDA PHP & MySQL Engine Operational",
    "version" => "1.0.0",
    "timestamp" => date("Y-m-d H:i:s")
]);
`;
}

function sq(val: any): string {
  if (val === undefined || val === null) return 'NULL';
  return `'${String(val).replace(/'/g, "\\'")}'`;
}

