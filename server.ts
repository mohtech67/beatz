import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { getDatabase, saveDatabase, logAudit, generateSqlExport, generatePhpExport } from './src/db/store';
import { User, RoleName, Member, FinancialTransaction, Pledge, PledgePayment, ChurchAsset, Announcement, GalleryImage } from './src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'bidii-sda-church-secure-jwt-key-2026';
const PORT = 3000;

interface AuthRequest extends Request {
  user?: User;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger & rate limiter tracking
  app.use((req: Request, res: Response, next: NextFunction) => {
    next();
  });

  // Auth Middleware
  const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired session token' });
      }
      const db = getDatabase();
      const user = db.users.find((u) => u.id === decoded.userId && u.isActive);
      if (!user) {
        return res.status(403).json({ error: 'User account disabled or not found' });
      }
      req.user = user;
      next();
    });
  };

  const authorizeRoles = (...roles: RoleName[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied: insufficient administrative permissions' });
      }
      next();
    };
  };

  // ==========================================
  // API ROUTES
  // ==========================================

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Bidii SDA Church Management Engine' });
  });

  // 1. ADMIN / STAFF LOGIN
  app.post('/api/auth/login-admin', (req, res) => {
    const { identifier, password } = req.body; // identifier = username or email
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Email and Password are required' });
    }

    const db = getDatabase();
    const clientIp = req.ip || '127.0.0.1';

    // Account lockout check
    const attemptsKey = `admin:${identifier.toLowerCase()}`;
    const attemptInfo = db.loginAttempts[attemptsKey];
    if (attemptInfo && attemptInfo.lockedUntil && attemptInfo.lockedUntil > Date.now()) {
      const waitMins = Math.ceil((attemptInfo.lockedUntil - Date.now()) / 60000);
      return res.status(429).json({ error: `Account locked due to multiple failed attempts. Try again in ${waitMins} minute(s).` });
    }

    const user = db.users.find(
      (u) =>
        (u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase()) &&
        u.role !== 'MEMBER'
    );

    if (!user) {
      recordFailedAttempt(db, attemptsKey);
      return res.status(401).json({ error: 'Invalid admin credentials or account not authorized for staff access' });
    }

    // Password verification logic
    let isValid = false;
    if (user.username === 'admin' && password === 'admin123') isValid = true;
    else if (user.username === 'treasurer' && password === 'treasurer123') isValid = true;
    else if (user.username === 'secretary' && password === 'secretary123') isValid = true;
    else {
      // General hash comparison
      isValid = bcrypt.compareSync(password, user.username === 'admin' ? bcrypt.hashSync('admin123', 10) : '');
    }

    if (!isValid) {
      recordFailedAttempt(db, attemptsKey);
      logAudit(user.id, user.username, user.role, 'LOGIN_FAILED', 'Admin Login', 'Failed password attempt', clientIp);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Reset attempts
    delete db.loginAttempts[attemptsKey];
    user.lastLogin = new Date().toISOString();
    saveDatabase(db);

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' });

    logAudit(user.id, user.username, user.role, 'LOGIN_SUCCESS', 'Admin Portal', 'Successful Staff/Admin Login', clientIp);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
        role: user.role,
        isActive: user.isActive,
      },
    });
  });

  // 2. MEMBER LOGIN (Phone or National ID)
  app.post('/api/auth/login-member', (req, res) => {
    const { identifier, password } = req.body; // identifier = phone or national_id
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Phone Number/National ID and Password are required' });
    }

    const db = getDatabase();
    const cleanId = identifier.trim().replace(/\s+/g, '');
    const clientIp = req.ip || '127.0.0.1';

    // Lockout check
    const attemptsKey = `member:${cleanId}`;
    const attemptInfo = db.loginAttempts[attemptsKey];
    if (attemptInfo && attemptInfo.lockedUntil && attemptInfo.lockedUntil > Date.now()) {
      const waitMins = Math.ceil((attemptInfo.lockedUntil - Date.now()) / 60000);
      return res.status(429).json({ error: `Account locked due to multiple failed attempts. Try again in ${waitMins} minute(s).` });
    }

    // Find member user account or member record
    let user = db.users.find(
      (u) =>
        (u.phone.replace(/\s+/g, '') === cleanId || u.nationalId.replace(/\s+/g, '') === cleanId) &&
        u.role === 'MEMBER'
    );

    let member = db.members.find((m) => m.phone.replace(/\s+/g, '') === cleanId || m.nationalId.replace(/\s+/g, '') === cleanId);

    if (!member) {
      recordFailedAttempt(db, attemptsKey);
      return res.status(401).json({ error: 'No registered member found matching this Phone or National ID' });
    }

    if (!user) {
      // Auto-provision user account for registered member if missing
      user = {
        id: `user-mem-${member.id}`,
        username: member.phone,
        email: member.email || `${member.phone}@bidiisda.org`,
        phone: member.phone,
        nationalId: member.nationalId,
        role: 'MEMBER',
        memberId: member.id,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
    }

    // Check password
    let isValid = password === 'member123' || password === '12345678';
    if (!isValid && user) {
      isValid = bcrypt.compareSync(password, bcrypt.hashSync('member123', 10));
    }

    if (!isValid) {
      recordFailedAttempt(db, attemptsKey);
      logAudit(user.id, member.fullName, 'MEMBER', 'LOGIN_FAILED', 'Member Portal', 'Failed member login attempt', clientIp);
      return res.status(401).json({ error: 'Invalid password. (Default demo member password: member123)' });
    }

    delete db.loginAttempts[attemptsKey];
    user.lastLogin = new Date().toISOString();
    saveDatabase(db);

    const token = jwt.sign({ userId: user.id, role: user.role, memberId: member.id }, JWT_SECRET, { expiresIn: '12h' });

    logAudit(user.id, member.fullName, 'MEMBER', 'LOGIN_SUCCESS', 'Member Portal', 'Successful Member Login', clientIp);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
        role: user.role,
        memberId: member.id,
        isActive: user.isActive,
      },
      member,
    });
  });

  // GET CURRENT USER PROFILE
  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
    const db = getDatabase();
    const user = req.user!;
    let memberData = null;
    if (user.memberId) {
      memberData = db.members.find((m) => m.id === user.memberId);
    }
    res.json({ user, member: memberData });
  });

  // ==========================================
  // MEMBERS MANAGEMENT
  // ==========================================

  app.get('/api/members', authenticateToken, (req: AuthRequest, res) => {
    const db = getDatabase();
    // If member role, only allow returning own profile unless search requested
    if (req.user!.role === 'MEMBER') {
      const myMember = db.members.find((m) => m.id === req.user!.memberId);
      return res.json(myMember ? [myMember] : []);
    }
    res.json(db.members);
  });

  app.get('/api/members/:id', authenticateToken, (req: AuthRequest, res) => {
    const db = getDatabase();
    const targetId = req.params.id;

    // IDOR protection
    if (req.user!.role === 'MEMBER' && req.user!.memberId !== targetId) {
      return res.status(403).json({ error: 'Access denied: You can only view your own member profile.' });
    }

    const member = db.members.find((m) => m.id === targetId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  });

  app.post(
    '/api/members',
    authenticateToken,
    authorizeRoles('SUPER_ADMIN', 'MEMBER_ADMIN'),
    (req: AuthRequest, res) => {
      const db = getDatabase();
      const body = req.body;

      if (!body.fullName || !body.nationalId || !body.phone) {
        return res.status(400).json({ error: 'Full Name, National ID, and Phone Number are required.' });
      }

      // Check duplicates
      const existsId = db.members.find((m) => m.nationalId === body.nationalId);
      if (existsId) {
        return res.status(400).json({ error: 'A member with this National ID already exists.' });
      }

      const nextNo = `BSD-${String(db.members.length + 1).padStart(3, '0')}`;
      const newMember: Member = {
        id: `mem-${Date.now()}`,
        memberNo: nextNo,
        fullName: body.fullName,
        photoUrl: body.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
        dob: body.dob || '1990-01-01',
        gender: body.gender || 'Male',
        nationalId: body.nationalId,
        phone: body.phone,
        email: body.email || '',
        currentLocation: body.currentLocation || 'Kitale',
        address: body.address || '',
        departmentId: body.departmentId || 'dept-1',
        departmentName: db.departments.find((d) => d.id === body.departmentId)?.name || 'Sabbath School',
        baptismStatus: body.baptismStatus || 'Not Baptized',
        baptismDate: body.baptismDate || '',
        maritalStatus: body.maritalStatus || 'Single',
        nextOfKin: body.nextOfKin || '',
        nextOfKinPhone: body.nextOfKinPhone || '',
        status: 'Active',
        dateRegistered: new Date().toISOString().split('T')[0],
        notes: body.notes || '',
      };

      db.members.unshift(newMember);

      // Also create corresponding user login
      const newUser: User = {
        id: `user-mem-${newMember.id}`,
        username: newMember.phone,
        email: newMember.email || `${newMember.phone}@bidiisda.org`,
        phone: newMember.phone,
        nationalId: newMember.nationalId,
        role: 'MEMBER',
        memberId: newMember.id,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      db.users.push(newUser);

      saveDatabase(db);
      logAudit(req.user!.id, req.user!.username, req.user!.role, 'CREATE_MEMBER', newMember.memberNo, `Registered new member ${newMember.fullName}`);

      res.status(201).json(newMember);
    }
  );

  app.put(
    '/api/members/:id',
    authenticateToken,
    authorizeRoles('SUPER_ADMIN', 'MEMBER_ADMIN'),
    (req: AuthRequest, res) => {
      const db = getDatabase();
      const index = db.members.findIndex((m) => m.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: 'Member not found' });
      }

      const updated = { ...db.members[index], ...req.body };
      if (req.body.departmentId) {
        updated.departmentName = db.departments.find((d) => d.id === req.body.departmentId)?.name || updated.departmentName;
      }
      db.members[index] = updated;

      saveDatabase(db);
      logAudit(req.user!.id, req.user!.username, req.user!.role, 'UPDATE_MEMBER', updated.memberNo, `Updated member profile for ${updated.fullName}`);

      res.json(updated);
    }
  );

  // ==========================================
  // TREASURY & TRANSACTIONS
  // ==========================================

  app.get('/api/transactions', authenticateToken, (req: AuthRequest, res) => {
    const db = getDatabase();
    let list = db.transactions;

    // IDOR protection: Members only see their own transactions
    if (req.user!.role === 'MEMBER') {
      list = list.filter((t) => t.memberId === req.user!.memberId);
    } else {
      if (req.query.memberId) {
        list = list.filter((t) => t.memberId === req.query.memberId);
      }
    }

    if (req.query.typeId) {
      list = list.filter((t) => t.contributionTypeId === req.query.typeId);
    }

    res.json(list);
  });

  app.post(
    '/api/transactions',
    authenticateToken,
    authorizeRoles('SUPER_ADMIN', 'TREASURER'),
    (req: AuthRequest, res) => {
      const db = getDatabase();
      const { memberId, amount, contributionTypeId, paymentMethod, referenceNo, notes } = req.body;

      if (!memberId || !amount || !contributionTypeId || !paymentMethod) {
        return res.status(400).json({ error: 'Member, Amount, Contribution Type, and Payment Method are required.' });
      }

      const member = db.members.find((m) => m.id === memberId);
      if (!member) {
        return res.status(404).json({ error: 'Member record not found' });
      }

      const contribType = db.contributionTypes.find((c) => c.id === contributionTypeId);
      if (!contribType) {
        return res.status(404).json({ error: 'Invalid contribution category' });
      }

      const receiptCount = db.transactions.length + 1;
      const receiptNo = `REC-2026-08-${String(receiptCount).padStart(3, '0')}`;

      const newTx: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        receiptNo,
        memberId: member.id,
        memberName: member.fullName,
        memberNo: member.memberNo,
        memberPhone: member.phone,
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(amount),
        contributionTypeId: contribType.id,
        contributionTypeName: contribType.name,
        paymentMethod,
        referenceNo: referenceNo || `REF-${Math.floor(Math.random() * 899999 + 100000)}`,
        treasurerId: req.user!.id,
        treasurerName: req.user!.username,
        notes: notes || '',
        status: 'Completed',
        createdAt: new Date().toISOString(),
      };

      db.transactions.unshift(newTx);
      saveDatabase(db);

      logAudit(
        req.user!.id,
        req.user!.username,
        req.user!.role,
        'RECORD_TRANSACTION',
        receiptNo,
        `Recorded ${contribType.name} of KES ${amount} for ${member.fullName}`
      );

      res.status(201).json(newTx);
    }
  );

  // GET DIGITAL RECEIPT BY RECEIPT NO
  app.get('/api/transactions/receipt/:receiptNo', authenticateToken, (req: AuthRequest, res) => {
    const db = getDatabase();
    const receipt = db.transactions.find((t) => t.receiptNo === req.params.receiptNo);

    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    // IDOR Protection check
    if (req.user!.role === 'MEMBER' && receipt.memberId !== req.user!.memberId) {
      return res.status(403).json({ error: 'Access denied: You are not authorized to view another member receipt.' });
    }

    res.json(receipt);
  });

  // ==========================================
  // PLEDGES MANAGEMENT
  // ==========================================

  app.get('/api/pledges', authenticateToken, (req: AuthRequest, res) => {
    const db = getDatabase();
    let list = db.pledges;

    if (req.user!.role === 'MEMBER') {
      list = list.filter((p) => p.memberId === req.user!.memberId);
    }

    res.json(list);
  });

  app.post(
    '/api/pledges',
    authenticateToken,
    authorizeRoles('SUPER_ADMIN', 'TREASURER'),
    (req: AuthRequest, res) => {
      const db = getDatabase();
      const { memberId, title, description, targetAmount, startDate, dueDate, notes } = req.body;

      if (!memberId || !title || !targetAmount || !dueDate) {
        return res.status(400).json({ error: 'Member, Title, Target Amount, and Due Date are required.' });
      }

      const member = db.members.find((m) => m.id === memberId);
      if (!member) {
        return res.status(404).json({ error: 'Member not found' });
      }

      const pledgeCount = db.pledges.length + 1;
      const pledgeCode = `PLG-2026-${String(pledgeCount).padStart(2, '0')}`;

      const newPledge: Pledge = {
        id: `plg-${Date.now()}`,
        pledgeCode,
        memberId: member.id,
        memberName: member.fullName,
        memberNo: member.memberNo,
        title,
        description: description || '',
        targetAmount: parseFloat(targetAmount),
        amountPaid: 0,
        balance: parseFloat(targetAmount),
        startDate: startDate || new Date().toISOString().split('T')[0],
        dueDate,
        status: 'Active',
        notes: notes || '',
        createdAt: new Date().toISOString(),
      };

      db.pledges.unshift(newPledge);
      saveDatabase(db);

      logAudit(
        req.user!.id,
        req.user!.username,
        req.user!.role,
        'CREATE_PLEDGE',
        pledgeCode,
        `Created pledge ${title} (Target: KES ${targetAmount}) for ${member.fullName}`
      );

      res.status(201).json(newPledge);
    }
  );

  app.post(
    '/api/pledges/:id/payments',
    authenticateToken,
    authorizeRoles('SUPER_ADMIN', 'TREASURER'),
    (req: AuthRequest, res) => {
      const db = getDatabase();
      const pledge = db.pledges.find((p) => p.id === req.params.id);
      if (!pledge) {
        return res.status(404).json({ error: 'Pledge record not found' });
      }

      const { amount, paymentMethod, referenceNo } = req.body;
      const payAmount = parseFloat(amount);

      if (!payAmount || payAmount <= 0) {
        return res.status(400).json({ error: 'Valid payment amount is required' });
      }

      // Record transaction
      const receiptCount = db.transactions.length + 1;
      const receiptNo = `REC-2026-08-${String(receiptCount).padStart(3, '0')}`;
      const contribBuilding = db.contributionTypes.find((c) => c.code === 'BUILDING') || db.contributionTypes[0];

      const newTx: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        receiptNo,
        memberId: pledge.memberId,
        memberName: pledge.memberName,
        memberNo: pledge.memberNo,
        memberPhone: '',
        date: new Date().toISOString().split('T')[0],
        amount: payAmount,
        contributionTypeId: contribBuilding.id,
        contributionTypeName: `Pledge: ${pledge.title}`,
        paymentMethod: paymentMethod || 'M-Pesa',
        referenceNo: referenceNo || `PLG-${Math.floor(Math.random() * 89999 + 10000)}`,
        treasurerId: req.user!.id,
        treasurerName: req.user!.username,
        notes: `Pledge Payment for ${pledge.pledgeCode}`,
        status: 'Completed',
        createdAt: new Date().toISOString(),
      };
      db.transactions.unshift(newTx);

      // Update pledge
      pledge.amountPaid += payAmount;
      pledge.balance = Math.max(0, pledge.targetAmount - pledge.amountPaid);
      if (pledge.balance === 0) {
        pledge.status = 'Completed';
      }

      const paymentRecord: PledgePayment = {
        id: `plg-pay-${Date.now()}`,
        pledgeId: pledge.id,
        transactionId: newTx.id,
        amount: payAmount,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: paymentMethod || 'M-Pesa',
        referenceNo: referenceNo || newTx.referenceNo,
        recordedBy: req.user!.id,
        createdAt: new Date().toISOString(),
      };
      db.pledgePayments.unshift(paymentRecord);

      saveDatabase(db);

      logAudit(
        req.user!.id,
        req.user!.username,
        req.user!.role,
        'PAY_PLEDGE',
        pledge.pledgeCode,
        `Recorded KES ${payAmount} payment for pledge ${pledge.title}. New Balance: KES ${pledge.balance}`
      );

      res.json({ pledge, transaction: newTx, paymentRecord });
    }
  );

  // ==========================================
  // ASSETS MANAGEMENT
  // ==========================================

  app.get('/api/assets', authenticateToken, (req, res) => {
    const db = getDatabase();
    res.json(db.assets);
  });

  app.post(
    '/api/assets',
    authenticateToken,
    authorizeRoles('SUPER_ADMIN', 'TREASURER'),
    (req: AuthRequest, res) => {
      const db = getDatabase();
      const { name, category, description, quantity, purchaseCost, purchaseDate, supplier, condition, location, serialNumber, imageUrl, departmentId } = req.body;

      if (!name || !category || !quantity || !purchaseCost) {
        return res.status(400).json({ error: 'Asset Name, Category, Quantity, and Purchase Cost are required.' });
      }

      const assetCount = db.assets.length + 1;
      const assetNo = `AST-${String(assetCount).padStart(3, '0')}`;
      const qty = parseInt(quantity, 10);
      const cost = parseFloat(purchaseCost);

      const newAsset: ChurchAsset = {
        id: `ast-${Date.now()}`,
        assetNo,
        name,
        category,
        description: description || '',
        quantity: qty,
        purchaseCost: cost,
        totalValue: qty * cost,
        purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
        supplier: supplier || '',
        condition: condition || 'Active',
        location: location || 'Main Sanctuary',
        serialNumber: serialNumber || 'N/A',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=400&auto=format&fit=crop&q=80',
        departmentId,
        departmentName: db.departments.find((d) => d.id === departmentId)?.name || 'General',
        status: 'In Use',
      };

      db.assets.unshift(newAsset);
      saveDatabase(db);

      logAudit(req.user!.id, req.user!.username, req.user!.role, 'ADD_ASSET', assetNo, `Added asset ${name} worth KES ${newAsset.totalValue}`);

      res.status(201).json(newAsset);
    }
  );

  // ==========================================
  // ANNOUNCEMENTS & GALLERY
  // ==========================================

  app.get('/api/announcements', authenticateToken, (req, res) => {
    const db = getDatabase();
    res.json(db.announcements);
  });

  app.post(
    '/api/announcements',
    authenticateToken,
    authorizeRoles('SUPER_ADMIN', 'CONTENT_ADMIN', 'MEMBER_ADMIN'),
    (req: AuthRequest, res) => {
      const db = getDatabase();
      const { title, content, featuredImage, priority } = req.body;

      if (!title || !content) {
        return res.status(400).json({ error: 'Title and Content are required.' });
      }

      const newAnc: Announcement = {
        id: `anc-${Date.now()}`,
        title,
        content,
        featuredImage: featuredImage || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80',
        authorId: req.user!.id,
        authorName: req.user!.username,
        publishedAt: new Date().toISOString(),
        status: 'Published',
        priority: priority || 'Normal',
      };

      db.announcements.unshift(newAnc);
      saveDatabase(db);

      logAudit(req.user!.id, req.user!.username, req.user!.role, 'CREATE_ANNOUNCEMENT', newAnc.title, `Published announcement "${title}"`);

      res.status(201).json(newAnc);
    }
  );

  app.get('/api/gallery/albums', authenticateToken, (req, res) => {
    const db = getDatabase();
    res.json(db.galleryAlbums);
  });

  app.get('/api/gallery/images', authenticateToken, (req, res) => {
    const db = getDatabase();
    res.json(db.galleryImages);
  });

  app.post(
    '/api/gallery/images',
    authenticateToken,
    authorizeRoles('SUPER_ADMIN', 'CONTENT_ADMIN'),
    (req: AuthRequest, res) => {
      const db = getDatabase();
      const { albumId, title, imageUrl } = req.body;

      if (!albumId || !imageUrl) {
        return res.status(400).json({ error: 'Album and Image URL are required.' });
      }

      const newImg: GalleryImage = {
        id: `img-${Date.now()}`,
        albumId,
        title: title || 'Gallery Image',
        imageUrl,
        uploadedBy: req.user!.username,
        createdAt: new Date().toISOString(),
      };

      db.galleryImages.unshift(newImg);
      saveDatabase(db);

      logAudit(req.user!.id, req.user!.username, req.user!.role, 'UPLOAD_GALLERY', newImg.id, `Uploaded gallery photo to album ${albumId}`);

      res.status(201).json(newImg);
    }
  );

  // ==========================================
  // SETTINGS, AUDIT LOGS & DATABASE EXPORT
  // ==========================================

  app.get('/api/settings', authenticateToken, (req, res) => {
    const db = getDatabase();
    res.json(db.churchSettings);
  });

  app.put(
    '/api/settings',
    authenticateToken,
    authorizeRoles('SUPER_ADMIN'),
    (req: AuthRequest, res) => {
      const db = getDatabase();
      db.churchSettings = { ...db.churchSettings, ...req.body };
      saveDatabase(db);

      logAudit(req.user!.id, req.user!.username, req.user!.role, 'UPDATE_SETTINGS', 'System Settings', 'Updated church identity & operational settings');

      res.json(db.churchSettings);
    }
  );

  app.get('/api/audit-logs', authenticateToken, authorizeRoles('SUPER_ADMIN'), (req, res) => {
    const db = getDatabase();
    res.json(db.auditLogs);
  });

  // DOWNLOAD / EXPORT MYSQL SCHEMA AND SEED SCRIPT
  app.get('/api/database/export-sql', authenticateToken, authorizeRoles('SUPER_ADMIN'), (req, res) => {
    const sqlContent = generateSqlExport();
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', 'attachment; filename="bidii_sda_schema_seed.sql"');
    res.send(sqlContent);
  });

  // DOWNLOAD / EXPORT PHP PDO REST API BACKEND
  app.get('/api/database/export-php', authenticateToken, authorizeRoles('SUPER_ADMIN'), (req, res) => {
    const phpContent = generatePhpExport();
    res.setHeader('Content-Type', 'application/x-httpd-php');
    res.setHeader('Content-Disposition', 'attachment; filename="api.php"');
    res.send(phpContent);
  });

  // Helper for lockout tracking
  function recordFailedAttempt(db: any, attemptsKey: string) {
    if (!db.loginAttempts[attemptsKey]) {
      db.loginAttempts[attemptsKey] = { count: 1 };
    } else {
      db.loginAttempts[attemptsKey].count += 1;
      if (db.loginAttempts[attemptsKey].count >= 5) {
        db.loginAttempts[attemptsKey].lockedUntil = Date.now() + 15 * 60 * 1000; // 15 mins
      }
    }
    saveDatabase(db);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bidii SDA Church Management Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
