'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AdminSettingsState,
  GenerationHistoryItem,
  LiveGenerationEvent,
  LoginAuditLog,
  MemoryAgentSkill,
  PackagePlan,
  SafeLearningPattern,
  SystemKnowledgeRule,
  Transaction,
  UserSession
} from '@/types';
import {
  DEFAULT_AI_AGENTS,
  DEFAULT_KNOWLEDGE_RULES,
  DEFAULT_LIVE_EVENTS,
  DEFAULT_LOGIN_LOGS,
  DEFAULT_MEMORY_SKILLS,
  DEFAULT_PACKAGES,
  DEFAULT_SAFE_LEARNING,
  DEFAULT_SETTINGS,
  DEFAULT_TRANSACTIONS,
  DEFAULT_USERS
} from '@/lib/storage';

export type MainView = 'login' | 'pricing' | 'checkout' | 'dashboard' | 'admin';

export type ToolTab =
  | 'tiktok_downloader'
  | 'tiktok_shop'
  | 'ide_konten'
  | 'video_to_prompt'
  | 'prompt_foto'
  | 'ekstraktor_frame'
  | 'auto_follback'
  | 'riwayat'
  | 'paket_akses'
  | 'pengaturan';

export type AdminTab =
  | 'ringkasan'
  | 'pemantau_realtime'
  | 'memory_skill'
  | 'injeksi_pengetahuan'
  | 'custom_ui_login'
  | 'monitoring_client'
  | 'log_login'
  | 'verifikasi_bayar'
  | 'manajemen_paket'
  | 'control_ui_user'
  | 'api_keys'
  | 'ai_agents'
  | 'safe_learning'
  | 'pengaturan_qris'
  | 'pengaturan_wa'
  | 'backup_restore';

interface SharedToolPayload {
  videoUrl?: string;
  videoTitle?: string;
  videoCaption?: string;
  videoDuration?: number;
  extractedFrameUrl?: string;
  conceptPrompt?: string;
}

interface AppContextType {
  // Navigation & Session
  currentView: MainView;
  setCurrentView: (view: MainView) => void;
  activeToolTab: ToolTab;
  setActiveToolTab: (tab: ToolTab) => void;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  currentUser: UserSession | null;
  loginWithCode: (code: string) => { success: boolean; message: string; role?: string };
  logout: () => void;
  quickSwitchToUser: (accessCode?: string) => void;
  quickSwitchToAdmin: () => void;

  // Checkout flow state
  selectedPlanForCheckout: PackagePlan | null;
  setSelectedPlanForCheckout: React.Dispatch<React.SetStateAction<PackagePlan | null>>;
  activeTransaction: Transaction | null;
  setActiveTransaction: React.Dispatch<React.SetStateAction<Transaction | null>>;
  createTransaction: (data: { customerName: string; whatsapp: string; email: string; plan: PackagePlan }) => Transaction;
  submitPaymentProof: (trxId: string, proofUrl: string) => void;
  findTransactionById: (trxId: string) => Transaction | undefined;

  // Inter-tool messaging / payload transfer
  sharedPayload: SharedToolPayload;
  setSharedPayload: React.Dispatch<React.SetStateAction<SharedToolPayload>>;
  sendToTool: (tool: ToolTab, payload: SharedToolPayload) => void;

  // Custom API Key for Gemini
  userApiKey: string;
  setUserApiKey: (key: string) => void;

  // Data Collections & Operations
  users: UserSession[];
  addUser: (user: Partial<UserSession>) => UserSession;
  updateUser: (accessCode: string, updates: Partial<UserSession>) => void;
  deleteUser: (accessCode: string) => void;
  extendUserDays: (accessCode: string, days: number) => void;

  transactions: Transaction[];
  approveTransaction: (trxId: string) => UserSession;
  rejectTransaction: (trxId: string) => void;

  packages: PackagePlan[];
  addPackage: (pkg: Partial<PackagePlan>) => void;
  updatePackage: (id: string, updates: Partial<PackagePlan>) => void;
  deletePackage: (id: string) => void;

  settings: AdminSettingsState;
  updateSettings: (updates: Partial<AdminSettingsState>) => void;
  resetSettingsToDefault: () => void;

  history: GenerationHistoryItem[];
  addHistoryItem: (item: Omit<GenerationHistoryItem, 'id' | 'createdAt'>) => void;
  clearHistory: () => void;
  deleteHistoryItem: (id: string) => void;

  memorySkills: MemoryAgentSkill[];
  addMemorySkill: (skill: Partial<MemoryAgentSkill>) => void;
  updateMemorySkill: (id: string, updates: Partial<MemoryAgentSkill>) => void;
  deleteMemorySkill: (id: string) => void;

  knowledgeRules: SystemKnowledgeRule[];
  addKnowledgeRule: (rule: Partial<SystemKnowledgeRule>) => void;
  deleteKnowledgeRule: (id: string) => void;

  aiAgents: typeof DEFAULT_AI_AGENTS;
  addAiAgent: (agent: { name: string; role: string; model: string }) => void;
  updateAiAgent: (id: string, updates: Partial<(typeof DEFAULT_AI_AGENTS)[0]>) => void;
  deleteAiAgent: (id: string) => void;

  safeLearning: SafeLearningPattern[];
  addSafeLearningPattern: (pattern: Partial<SafeLearningPattern>) => void;
  approveSafeLearning: (id: string) => void;
  rejectSafeLearning: (id: string) => void;
  runAutoTraining: () => { processed: number; approved: number; held: number };

  liveEvents: LiveGenerationEvent[];
  addLiveEvent: (event: Omit<LiveGenerationEvent, 'id' | 'timestamp'>) => void;
  clearLiveEvents: () => void;

  loginLogs: LoginAuditLog[];
  addLoginLog: (log: Omit<LoginAuditLog, 'id' | 'timestamp'>) => void;
  clearLoginLogs: () => void;

  // Backup & Restore
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonStr: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USERS: 'ts_users_v1',
  TRANSACTIONS: 'ts_transactions_v1',
  PACKAGES: 'ts_packages_v1',
  SETTINGS: 'ts_settings_v1',
  HISTORY: 'ts_history_v1',
  SKILLS: 'ts_skills_v1',
  RULES: 'ts_rules_v1',
  AGENTS: 'ts_agents_v1',
  SAFE_LEARNING: 'ts_safe_learning_v1',
  LIVE_EVENTS: 'ts_live_events_v1',
  LOGIN_LOGS: 'ts_login_logs_v1',
  CURRENT_SESSION: 'ts_current_session_v1',
  USER_API_KEY: 'ts_user_api_key_v1'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<MainView>('login');
  const [activeToolTab, setActiveToolTab] = useState<ToolTab>('tiktok_downloader');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('ringkasan');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PackagePlan | null>(null);
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);
  const [sharedPayload, setSharedPayload] = useState<SharedToolPayload>({});
  const [userApiKey, setUserApiKeyState] = useState<string>('');

  const setUserApiKey = (key: string) => {
    setUserApiKeyState(key);
    try {
      localStorage.setItem(STORAGE_KEYS.USER_API_KEY, key);
    } catch {}
  };

  // Collections state
  const [users, setUsers] = useState<UserSession[]>(DEFAULT_USERS);
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS);
  const [packages, setPackages] = useState<PackagePlan[]>(DEFAULT_PACKAGES);
  const [settings, setSettings] = useState<AdminSettingsState>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [memorySkills, setMemorySkills] = useState<MemoryAgentSkill[]>(DEFAULT_MEMORY_SKILLS);
  const [knowledgeRules, setKnowledgeRules] = useState<SystemKnowledgeRule[]>(DEFAULT_KNOWLEDGE_RULES);
  const [aiAgents, setAiAgents] = useState(DEFAULT_AI_AGENTS);
  const [safeLearning, setSafeLearning] = useState<SafeLearningPattern[]>(DEFAULT_SAFE_LEARNING);
  const [liveEvents, setLiveEvents] = useState<LiveGenerationEvent[]>(DEFAULT_LIVE_EVENTS);
  const [loginLogs, setLoginLogs] = useState<LoginAuditLog[]>(DEFAULT_LOGIN_LOGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const dedupeById = <T extends { id?: string; accessCode?: string }>(items: T[]): T[] => {
        if (!Array.isArray(items)) return [];
        const seen = new Set<string>();
        return items.filter((item, idx) => {
          const key = item.id || item.accessCode || `item_${idx}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };

      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      if (savedUsers) setUsers(dedupeById(JSON.parse(savedUsers)));

      const savedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (savedTransactions) setTransactions(dedupeById(JSON.parse(savedTransactions)));

      const savedPackages = localStorage.getItem(STORAGE_KEYS.PACKAGES);
      if (savedPackages) setPackages(dedupeById(JSON.parse(savedPackages)));

      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (savedHistory) setHistory(dedupeById(JSON.parse(savedHistory)));

      const savedSkills = localStorage.getItem(STORAGE_KEYS.SKILLS);
      if (savedSkills) setMemorySkills(dedupeById(JSON.parse(savedSkills)));

      const savedRules = localStorage.getItem(STORAGE_KEYS.RULES);
      if (savedRules) setKnowledgeRules(dedupeById(JSON.parse(savedRules)));

      const savedAgents = localStorage.getItem(STORAGE_KEYS.AGENTS);
      if (savedAgents) setAiAgents(dedupeById(JSON.parse(savedAgents)));

      const savedSafe = localStorage.getItem(STORAGE_KEYS.SAFE_LEARNING);
      if (savedSafe) setSafeLearning(dedupeById(JSON.parse(savedSafe)));

      const savedLive = localStorage.getItem(STORAGE_KEYS.LIVE_EVENTS);
      if (savedLive) setLiveEvents(dedupeById(JSON.parse(savedLive)));

      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGIN_LOGS);
      if (savedLogs) setLoginLogs(dedupeById(JSON.parse(savedLogs)));

      const savedApiKey = localStorage.getItem(STORAGE_KEYS.USER_API_KEY);
      if (savedApiKey) setUserApiKeyState(savedApiKey);

      const savedSession = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
      if (savedSession) {
        const user = JSON.parse(savedSession);
        // If user is globallensn@gmail.com ensure role is superadmin
        if (user.email === 'globallensn@gmail.com') {
          user.role = 'superadmin';
          user.name = 'Global Lens Admin';
        }
        setCurrentUser(user);
        setCurrentView(user.role === 'superadmin' ? 'admin' : 'dashboard');
      } else {
        // Halaman awal saat pertama kali dibuka (belum login)
        setCurrentUser(null);
        setCurrentView('login');
      }
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when state updates
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(memorySkills));
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(knowledgeRules));
      localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(aiAgents));
      localStorage.setItem(STORAGE_KEYS.SAFE_LEARNING, JSON.stringify(safeLearning));
      localStorage.setItem(STORAGE_KEYS.LIVE_EVENTS, JSON.stringify(liveEvents));
      localStorage.setItem(STORAGE_KEYS.LOGIN_LOGS, JSON.stringify(loginLogs));
    } catch (e) {
      console.warn('LocalStorage write error:', e);
    }
  }, [users, transactions, packages, settings, history, memorySkills, knowledgeRules, aiAgents, safeLearning, liveEvents, loginLogs, isLoaded]);

  // Auth methods
  const loginWithCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const cleanEmail = code.trim().toLowerCase();

    // Check for super admin passcode / email (Ahmad David - ahmaddavid0906@gmail.com)
    if (
      cleanEmail === 'ahmaddavid0906@gmail.com' ||
      cleanEmail === 'davidrohman037@gmail.com' ||
      cleanEmail === 'globallensn@gmail.com' ||
      cleanEmail === 'admin@satset.ai' ||
      cleanCode === 'ADMIN' ||
      cleanCode === 'SUPERADMIN' ||
      cleanCode === 'ADMIN-SATSET-999' ||
      cleanCode === 'SATSET-ADMIN-SUPER' ||
      cleanCode === 'ADMIN-AHMAD-DAVID'
    ) {
      const adminUser: UserSession = {
        accessCode: 'SATSET-ADMIN-SUPER',
        name: 'Ahmad David (Super Admin)',
        email: 'ahmaddavid0906@gmail.com',
        whatsapp: '+6289512345678',
        role: 'superadmin',
        planId: 'plan_lifetime',
        planName: 'Ultra VIP Lifetime (Super Admin Master)',
        status: 'aktif',
        expiresAt: '2099-12-31T23:59:59Z',
        daysRemaining: 9999,
        totalGenerations: 2450,
        createdAt: '2026-01-01T00:00:00Z'
      };
      setCurrentUser(adminUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(adminUser));
      setCurrentView('admin');

      addLoginLog({
        user: 'Ahmad David (ahmaddavid0906@gmail.com)',
        role: 'Super Admin',
        ip: '114.125.48.210',
        device: 'Desktop Browser (Secure Session)',
        status: 'SUCCESS',
        detail: 'Otorisasi Super Admin Master Berhasil'
      });

      return { success: true, message: 'Selamat datang kembali Super Admin Master (Ahmad David)!', role: 'superadmin' };
    }

    // Match in users list (by code or email)
    const foundUser = users.find(
      (u) =>
        u.accessCode.toUpperCase() === cleanCode ||
        u.email.toLowerCase() === cleanEmail
    );

    if (foundUser) {
      if (foundUser.status === 'suspended') {
        return { success: false, message: 'Akun Anda sedang ditangguhkan. Silakan hubungi admin via WhatsApp.' };
      }
      if (foundUser.status === 'expired') {
        return { success: false, message: 'Masa aktif Kode Akses telah habis. Silakan perpanjang paket lisensi Anda.' };
      }

      setCurrentUser(foundUser);
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(foundUser));
      setCurrentView(foundUser.role === 'superadmin' ? 'admin' : 'dashboard');

      addLoginLog({
        user: `${foundUser.name} (${foundUser.accessCode})`,
        role: foundUser.role,
        ip: '180.252.112.44',
        device: 'Desktop Browser',
        status: 'SUCCESS',
        detail: 'Otentikasi berhasil via Kode Akses'
      });

      return { success: true, message: `Selamat datang di Workspace, ${foundUser.name}!`, role: foundUser.role };
    }

    return {
      success: false,
      message: 'Kode Akses / Email tidak terdaftar atau belum aktif. Periksa kembali atau beli paket lisensi.'
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    setCurrentView('login');
  };

  const quickSwitchToUser = (accessCode?: string) => {
    const target = accessCode ? users.find((u) => u.accessCode === accessCode) : users.find(u => u.role === 'user') || DEFAULT_USERS[1];
    if (target) {
      setCurrentUser(target);
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(target));
      setCurrentView('dashboard');
    }
  };

  const quickSwitchToAdmin = () => {
    const adminUser = users.find((u) => u.role === 'superadmin') || DEFAULT_USERS[0];
    setCurrentUser(adminUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(adminUser));
    setCurrentView('admin');
  };

  // Inter-tool communication helper
  const sendToTool = (tool: ToolTab, payload: SharedToolPayload) => {
    setSharedPayload((prev) => ({ ...prev, ...payload }));
    setActiveToolTab(tool);
    setCurrentView('dashboard');
  };

  // Transactions & Checkout
  const createTransaction = (data: { customerName: string; whatsapp: string; email: string; plan: PackagePlan }): Transaction => {
    const randomHex = Math.floor(100000 + Math.random() * 900000).toString();
    const trxId = `TRX-${randomHex}-SAT`;
    const adminFee = 2500;
    const newTrx: Transaction = {
      id: trxId,
      customerName: data.customerName,
      whatsapp: data.whatsapp,
      email: data.email,
      planId: data.plan.id,
      planName: data.plan.name,
      price: data.plan.price,
      adminFee,
      total: data.plan.price + adminFee,
      status: 'pending',
      createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      issuedAccessCode: `SATSET-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setTransactions((prev) => [newTrx, ...prev]);
    setActiveTransaction(newTrx);
    return newTrx;
  };

  const submitPaymentProof = (trxId: string, proofUrl: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === trxId ? { ...t, proofUrl } : t))
    );
    if (activeTransaction && activeTransaction.id === trxId) {
      setActiveTransaction({ ...activeTransaction, proofUrl });
    }
  };

  const findTransactionById = (trxId: string) => {
    return transactions.find((t) => t.id.trim().toUpperCase() === trxId.trim().toUpperCase());
  };

  const approveTransaction = (trxId: string) => {
    const trx = transactions.find((t) => t.id === trxId);
    if (!trx) throw new Error('Transaksi tidak ditemukan');

    const generatedCode = trx.issuedAccessCode || `SATSET-${Math.floor(100000 + Math.random() * 900000)}`;
    const pkg = packages.find((p) => p.id === trx.planId) || packages[0];
    const durationDays = pkg ? pkg.durationDays : 30;

    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + durationDays);

    const newUser: UserSession = {
      accessCode: generatedCode,
      name: trx.customerName,
      email: trx.email,
      whatsapp: trx.whatsapp,
      role: 'user',
      planId: trx.planId,
      planName: trx.planName,
      status: 'aktif',
      expiresAt: expiresDate.toISOString(),
      daysRemaining: durationDays,
      totalGenerations: 0,
      createdAt: new Date().toISOString()
    };

    // Update transactions
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === trxId
          ? {
              ...t,
              status: 'approved',
              approvedAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
              issuedAccessCode: generatedCode
            }
          : t
      )
    );

    // Update user list
    setUsers((prev) => {
      const existing = prev.findIndex((u) => u.accessCode === generatedCode || u.email === trx.email);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = {
          ...updated[existing],
          planId: trx.planId,
          planName: trx.planName,
          status: 'aktif',
          daysRemaining: updated[existing].daysRemaining + durationDays,
          expiresAt: expiresDate.toISOString()
        };
        return updated;
      }
      return [newUser, ...prev];
    });

    return newUser;
  };

  const rejectTransaction = (trxId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === trxId ? { ...t, status: 'rejected' } : t))
    );
  };

  // User Management
  const addUser = (userData: Partial<UserSession>): UserSession => {
    const generatedCode = userData.accessCode || `SATSET-VIP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newUser: UserSession = {
      accessCode: generatedCode,
      name: userData.name || 'User Baru',
      email: userData.email || 'user@gmail.com',
      whatsapp: userData.whatsapp || '08123456789',
      role: userData.role || 'user',
      planId: userData.planId || 'plan_bulanan_vip',
      planName: userData.planName || 'Akses Bulanan (VIP)',
      status: userData.status || 'aktif',
      expiresAt: userData.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString(),
      daysRemaining: userData.daysRemaining ?? 30,
      totalGenerations: 0,
      createdAt: new Date().toISOString()
    };

    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (accessCode: string, updates: Partial<UserSession>) => {
    setUsers((prev) =>
      prev.map((u) => (u.accessCode === accessCode ? { ...u, ...updates } : u))
    );
    if (currentUser && currentUser.accessCode === accessCode) {
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(updated));
    }
  };

  const deleteUser = (accessCode: string) => {
    setUsers((prev) => prev.filter((u) => u.accessCode !== accessCode));
  };

  const extendUserDays = (accessCode: string, days: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.accessCode === accessCode) {
          const newRemaining = Math.max(0, u.daysRemaining + days);
          const newExpires = new Date(Date.now() + newRemaining * 86400000).toISOString();
          return { ...u, daysRemaining: newRemaining, expiresAt: newExpires, status: newRemaining > 0 ? 'aktif' : 'expired' };
        }
        return u;
      })
    );
  };

  // Packages Management
  const addPackage = (pkg: Partial<PackagePlan>) => {
    const newPkg: PackagePlan = {
      id: pkg.id || `plan_${Date.now()}`,
      name: pkg.name || 'Paket Baru',
      tagline: pkg.tagline || 'Deskripsi paket baru.',
      price: pkg.price || 99000,
      durationDays: pkg.durationDays || 30,
      badge: pkg.badge || '',
      targetCategory: pkg.targetCategory || 'Public (Calon Pembeli)',
      isPopular: !!pkg.isPopular,
      features: pkg.features || ['Akses Semua Fitur'],
      active: pkg.active ?? true
    };
    setPackages((prev) => [...prev, newPkg]);
  };

  const updatePackage = (id: string, updates: Partial<PackagePlan>) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  // Settings
  const updateSettings = (updates: Partial<AdminSettingsState>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const resetSettingsToDefault = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  // History
  const addHistoryItem = (item: Omit<GenerationHistoryItem, 'id' | 'createdAt'>) => {
    const newItem: GenerationHistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    };
    setHistory((prev) => [newItem, ...prev]);

    // Increment user usage counter
    if (currentUser) {
      updateUser(currentUser.accessCode, { totalGenerations: currentUser.totalGenerations + 1 });
    }
  };

  const clearHistory = () => setHistory([]);
  const deleteHistoryItem = (id: string) => setHistory((prev) => prev.filter((h) => h.id !== id));

  // Memory Agent Skills
  const addMemorySkill = (skill: Partial<MemoryAgentSkill>) => {
    const newSkill: MemoryAgentSkill = {
      id: skill.id || `skill_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: skill.name || 'Skill Baru',
      category: skill.category || 'Content Ideas',
      confidenceScore: skill.confidenceScore || 95,
      executionCount: 0,
      status: 'CONNECTED',
      description: skill.description || '',
      injectionSnippet: skill.injectionSnippet || '',
      color: skill.color || '#4f46e5'
    };
    setMemorySkills((prev) => [newSkill, ...prev.filter((s) => s.id !== newSkill.id)]);
  };

  const updateMemorySkill = (id: string, updates: Partial<MemoryAgentSkill>) => {
    setMemorySkills((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteMemorySkill = (id: string) => {
    setMemorySkills((prev) => prev.filter((s) => s.id !== id));
  };

  // Knowledge Rules
  const addKnowledgeRule = (rule: Partial<SystemKnowledgeRule>) => {
    const newRule: SystemKnowledgeRule = {
      id: rule.id || `rule_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: rule.title || 'Aturan Baru',
      category: rule.category || 'HOOK',
      source: rule.source || 'MANUAL',
      content: rule.content || '',
      tag: rule.tag || 'SYSTEM RULE',
      confidence: rule.confidence || 95,
      createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setKnowledgeRules((prev) => [newRule, ...prev.filter((r) => r.id !== newRule.id)]);
  };

  const deleteKnowledgeRule = (id: string) => {
    setKnowledgeRules((prev) => prev.filter((r) => r.id !== id));
  };

  // AI Agents Pool
  const addAiAgent = (agent: { name: string; role: string; model: string }) => {
    const newAgent = {
      id: `agent_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      name: agent.name,
      role: agent.role,
      model: agent.model,
      calls: 0,
      status: 'AKTIF'
    };
    setAiAgents((prev) => [...prev, newAgent]);
  };

  const deleteAiAgent = (id: string) => {
    setAiAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAiAgent = (id: string, updates: Partial<(typeof DEFAULT_AI_AGENTS)[0]>) => {
    setAiAgents((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  // Safe Learning
  const addSafeLearningPattern = (pattern: Partial<SafeLearningPattern>) => {
    const newPattern: SafeLearningPattern = {
      id: pattern.id || `safe_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      title: pattern.title || 'Pola Baru',
      category: pattern.category || 'Umum',
      sourceQuery: pattern.sourceQuery || '-',
      extractedPattern: pattern.extractedPattern || '',
      confidenceScore: pattern.confidenceScore || 92,
      status: pattern.status || 'pending',
      isHighRiskMedical: pattern.isHighRiskMedical || false,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    };
    setSafeLearning((prev) => [newPattern, ...prev]);
  };

  const approveSafeLearning = (id: string) => {
    const pat = safeLearning.find((p) => p.id === id);
    if (pat) {
      // Add into system knowledge automatically
      addKnowledgeRule({
        title: `Pola AI Disetujui: ${pat.title}`,
        category: 'ALGORITHM',
        source: 'AUTO_LEARNED',
        content: pat.extractedPattern,
        tag: pat.category.toUpperCase(),
        confidence: pat.confidenceScore
      });
      setSafeLearning((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p))
      );
    }
  };

  const rejectSafeLearning = (id: string) => {
    setSafeLearning((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'rejected' } : p))
    );
  };

  const runAutoTraining = () => {
    let approvedCount = 0;
    let heldCount = 0;
    const pendingList = safeLearning.filter((p) => p.status === 'pending');

    pendingList.forEach((pat) => {
      if (pat.isHighRiskMedical || pat.confidenceScore < 90) {
        heldCount++;
      } else {
        approveSafeLearning(pat.id);
        approvedCount++;
      }
    });

    return {
      processed: pendingList.length,
      approved: approvedCount,
      held: heldCount
    };
  };

  // Live Events & Audit Logs
  const addLiveEvent = (event: Omit<LiveGenerationEvent, 'id' | 'timestamp'>) => {
    const newEvt: LiveGenerationEvent = {
      ...event,
      id: `evt_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setLiveEvents((prev) => [newEvt, ...prev.slice(0, 50)]);
  };

  const clearLiveEvents = () => setLiveEvents([]);

  const addLoginLog = (log: Omit<LoginAuditLog, 'id' | 'timestamp'>) => {
    const newLog: LoginAuditLog = {
      ...log,
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    };
    setLoginLogs((prev) => [newLog, ...prev.slice(0, 50)]);
  };

  const clearLoginLogs = () => setLoginLogs([]);

  // Backup and restore
  const exportDatabaseJson = () => {
    const fullDb = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      users,
      transactions,
      packages,
      settings,
      history,
      memorySkills,
      knowledgeRules,
      aiAgents,
      safeLearning
    };
    return JSON.stringify(fullDb, null, 2);
  };

  const importDatabaseJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.users) setUsers(data.users);
      if (data.transactions) setTransactions(data.transactions);
      if (data.packages) setPackages(data.packages);
      if (data.settings) setSettings(data.settings);
      if (data.history) setHistory(data.history);
      if (data.memorySkills) setMemorySkills(data.memorySkills);
      if (data.knowledgeRules) setKnowledgeRules(data.knowledgeRules);
      if (data.aiAgents) setAiAgents(data.aiAgents);
      if (data.safeLearning) setSafeLearning(data.safeLearning);
      return true;
    } catch (e) {
      console.error('Error importing backup:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeToolTab,
        setActiveToolTab,
        activeAdminTab,
        setActiveAdminTab,
        currentUser,
        loginWithCode,
        logout,
        quickSwitchToUser,
        quickSwitchToAdmin,
        selectedPlanForCheckout,
        setSelectedPlanForCheckout,
        activeTransaction,
        setActiveTransaction,
        createTransaction,
        submitPaymentProof,
        findTransactionById,
        sharedPayload,
        setSharedPayload,
        sendToTool,
        userApiKey,
        setUserApiKey,
        users,
        addUser,
        updateUser,
        deleteUser,
        extendUserDays,
        transactions,
        approveTransaction,
        rejectTransaction,
        packages,
        addPackage,
        updatePackage,
        deletePackage,
        settings,
        updateSettings,
        resetSettingsToDefault,
        history,
        addHistoryItem,
        clearHistory,
        deleteHistoryItem,
        memorySkills,
        addMemorySkill,
        updateMemorySkill,
        deleteMemorySkill,
        knowledgeRules,
        addKnowledgeRule,
        deleteKnowledgeRule,
        aiAgents,
        addAiAgent,
        updateAiAgent,
        deleteAiAgent,
        safeLearning,
        addSafeLearningPattern,
        approveSafeLearning,
        rejectSafeLearning,
        runAutoTraining,
        liveEvents,
        addLiveEvent,
        clearLiveEvents,
        loginLogs,
        addLoginLog,
        clearLoginLogs,
        exportDatabaseJson,
        importDatabaseJson
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
