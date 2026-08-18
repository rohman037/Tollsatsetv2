import {
  AdminSettingsState,
  ContentIdeaItem,
  ExtractedFrameItem,
  GenerationHistoryItem,
  LiveGenerationEvent,
  LoginAuditLog,
  MemoryAgentSkill,
  PackagePlan,
  PhotoPromptResult,
  SafeLearningPattern,
  SystemKnowledgeRule,
  TikTokVideoMetadata,
  Transaction,
  UserSession,
  VideoToPromptResult
} from '@/types';

export const DEFAULT_PACKAGES: PackagePlan[] = [
  {
    id: 'plan_mingguan',
    name: 'Akses Mingguan',
    tagline: 'Uji coba semua fitur AI Creator selama 7 hari penuh.',
    price: 49000,
    originalPrice: 99000,
    durationDays: 7,
    badge: 'HEMAT',
    targetCategory: 'Public (Calon Pembeli)',
    isPopular: false,
    features: [
      'Akses 5 Tool AI Satset',
      'Generator Prompt Video 8K',
      'Generator Prompt Foto Ultra HD',
      'Video Frame Extractor',
      'TikTok Downloader No Watermark',
      'Bypass Kuota & Anti Limit Level 1'
    ],
    active: true
  },
  {
    id: 'plan_bulanan_vip',
    name: 'Akses Bulanan (VIP)',
    tagline: 'Pilihan favorit kreator konten & agensi digital.',
    price: 149000,
    originalPrice: 299000,
    durationDays: 30,
    badge: 'PALING POPULER',
    targetCategory: 'Public (Calon Pembeli)',
    isPopular: true,
    features: [
      'Semua Fitur Paket Mingguan',
      'Prioritas Server Kecepatan Tinggi',
      'Bypass Kuota VIP & Anti Limit Max',
      'Format Export JSON & TXT',
      'Masa Aktif 30 Hari Penuh',
      'Dukungan Admin Fast Response'
    ],
    active: true
  },
  {
    id: 'plan_lifetime',
    name: 'Ultra VIP Lifetime',
    tagline: 'Akses seumur hidup tanpa perpanjangan biaya bulanan.',
    price: 999000,
    originalPrice: 1999000,
    durationDays: 36500,
    badge: 'SULTAN VIP',
    targetCategory: 'Public (Calon Pembeli)',
    isPopular: false,
    features: [
      'Akses Selamanya Tanpa Batas',
      'Semua Fitur VIP + Update Masa Depan',
      'Server Dedicated AI Engine',
      'Grup Komunitas Exclusive VIP',
      'Lisensi Komersial Konten Kreator'
    ],
    active: true
  },
  {
    id: 'plan_upgrade_vip',
    name: 'Perpanjang / Upgrade Member VIP',
    tagline: 'Penawaran khusus member terdaftar untuk perpanjangan atau upgrade akun.',
    price: 99000,
    originalPrice: 149000,
    durationDays: 30,
    badge: 'KHUSUS MEMBER',
    targetCategory: 'Khusus Member VIP',
    isPopular: false,
    features: [
      'Harga Khusus Perpanjangan Member',
      'Semua Fitur VIP + Priority Server',
      'Bypass Kuota & Anti Limit Max',
      'Akses Bebas Pemblokiran',
      'Dukungan Langsung via Admin VIP'
    ],
    active: true
  }
];

export const DEFAULT_USERS: UserSession[] = [
  {
    accessCode: 'SATSET-ADMIN-SUPER',
    name: 'Ahmad David (Super Admin)',
    email: 'ahmaddavid0906@gmail.com',
    whatsapp: '6289512345678',
    role: 'superadmin',
    planId: 'plan_lifetime',
    planName: 'Ultra VIP Lifetime (Super Admin Master)',
    status: 'aktif',
    expiresAt: '2099-12-31T23:59:59Z',
    daysRemaining: 9999,
    totalGenerations: 2450,
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    accessCode: 'SATSET-882194',
    name: 'Rizky Ramadhan',
    email: 'rizky.creator@gmail.com',
    whatsapp: '6289502574577',
    role: 'user',
    planId: 'plan_bulanan_vip',
    planName: 'Akses Bulanan (VIP)',
    status: 'aktif',
    expiresAt: '2026-09-17T23:59:59Z',
    daysRemaining: 30,
    totalGenerations: 45,
    createdAt: '2026-08-16T00:00:00Z'
  },
  {
    accessCode: 'TS-PRO-2026-VIP',
    name: 'Kreator Viral VIP',
    email: 'creator.vip@satset.pro',
    whatsapp: '6281234567890',
    role: 'user',
    planId: 'plan_bulanan_vip',
    planName: 'Akses Bulanan (VIP)',
    status: 'aktif',
    expiresAt: '2026-12-31T23:59:59Z',
    daysRemaining: 136,
    totalGenerations: 182,
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    accessCode: 'SATSET-VIP-ZJ9EKZ5F-239F',
    name: 'Budi Santoso',
    email: 'budi.creator@gmail.com',
    whatsapp: '6281234567890',
    role: 'user',
    planId: 'plan_bulanan_vip',
    planName: 'Akses Bulanan (VIP)',
    status: 'aktif',
    expiresAt: '2026-09-10T23:59:59Z',
    daysRemaining: 24,
    totalGenerations: 12,
    createdAt: '2026-08-10T00:00:00Z'
  }
];

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-957744-SAT',
    customerName: 'Yuliana Sari',
    whatsapp: '08993288777',
    email: 'yuliana.sari@gmail.com',
    planId: 'plan_bulanan_vip',
    planName: 'Akses Bulanan (VIP)',
    price: 149000,
    adminFee: 2500,
    total: 151500,
    status: 'pending',
    proofUrl: 'https://picsum.photos/seed/slip_transfer/600/800',
    createdAt: '17 Agu 2026, 00:00:15',
    issuedAccessCode: 'SATSET-882194'
  }
];

export const DEFAULT_SETTINGS: AdminSettingsState = {
  loginHeaderBrand: 'Tools Satset',
  loginBadgeInitial: 'TS',
  loginCustomLogoUrl: '',
  loginBrandAccentColor: '#4f46e5',
  loginHelpButtonText: 'Bantuan',
  loginHeroTitle: 'Buat lebih banyak konten dari satu video',
  loginVisualCardTitle: 'Workspace AI All-in-One',
  loginVisualCardDesc: 'Generator Ide Konten, Video to Prompt, Prompt Foto Nano Samama Ultra, dan Frame Extractor dalam satu platform satset',
  loginCardGradientFrom: '#2563eb',
  loginCardGradientTo: '#4f46e5',
  loginBentoPills: ['Ide konten', 'Prompt video', 'Prompt foto', 'Ekstraksi frame'],
  loginFormTitle: 'Masuk ke workspace Anda',
  loginFormSubtitle: 'Gunakan Kode Akses Anda untuk melanjutkan',
  loginFormCodePlaceholder: 'Gunakan Kode Akses Anda',
  loginButtonText: 'Masuk ke aplikasi ->',
  loginButtonLoadingText: 'Memverifikasi...',
  loginButtonColor: '#4f46e5',
  loginShowPricingLink: true,
  loginShowWhatsAppBtn: true,
  loginShowQuickAccess: false,
  loginThemeMode: 'light',
  loginBgColor: '#f8fafc',
  loginFooterBadges: ['Akses aman', 'Tanpa password', 'Bantuan langsung'],

  userHeaderBrand: 'Tools Satset AI',
  userBadgeInitial: 'TS',
  userCustomLogoUrl: '',
  userBrandAccentColor: '#4f46e5',
  userHelpButtonText: 'Bantuan & CS',
  userShowAntiLimitBadge: true,
  userAntiLimitText: 'Anti-Limit AI Engine Active',
  userEnableAnnouncement: false,
  userAnnouncementText: '📢 Update Baru: Model Gemini 3.5 Flash Ultra Aktif. Proses analisis prompt & ide konten 2x lebih cepat!',
  userAnnouncementBgColor: '#1e1b4b',
  userAnnouncementTextColor: '#facc15',
  userSidebarTools: [
    { id: 'tiktok_downloader', title: 'TikTok Downloader', customLabel: 'TikTok Downloader', badgeLabel: 'FREE', badgeColor: '#10b981', enabled: true },
    { id: 'video_to_prompt', title: 'Video-to-Prompt AI', customLabel: 'Video-to-Prompt AI', badgeLabel: 'HOT', badgeColor: '#f97316', enabled: true },
    { id: 'prompt_foto', title: 'Prompt Foto Nano', customLabel: 'Prompt Foto Nano', badgeLabel: 'ULTRA', badgeColor: '#8b5cf6', enabled: true },
    { id: 'ide_konten', title: 'Ide Konten AI (AEO)', customLabel: 'Ide Konten AI (AEO)', badgeLabel: 'FYP', badgeColor: '#06b6d4', enabled: true },
    { id: 'tiktok_shop', title: 'TikTok Shop to Ideas', customLabel: 'TikTok Shop to Ideas', badgeLabel: 'PRO', badgeColor: '#ec4899', enabled: true },
    { id: 'ekstraktor_frame', title: 'Video Frame Extractor', customLabel: 'Video Frame Extractor', badgeLabel: '8K', badgeColor: '#6366f1', enabled: true }
  ],
  userWelcomeTitle: 'Selamat Datang di Workspace Tools Satset AI',
  userWelcomeDesc: 'Kelola & ciptakan konten viral dari video, prompt foto nano, ide konten FYP hingga ekstraksi frame dalam satu sistem otomatis.',
  userShowWelcomeCard: true,
  userThemeBgColor: '#f8fafc',
  userThemeAccentColor: '#4f46e5',
  userCopyrightText: '© 2026 Tools Satset AI • Multi-Engine Content Suite',

  qrisMerchantName: 'Tools Satset Official (QRIS ALL PAYMENT)',
  qrisImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=00020101021126580014ID.GO.QRIS.WWW01189360052300000000005204581253033605802ID5919TOOLS%20SATSET%20OFFICIAL6007JAKARTA61051234062070703A016304ABCD',
  waAdminPhone: '+6289502574577',
  waDefaultTemplate: 'Halo Admin Tools Satset, saya ingin konsultasi mengenai Kode Akses dan paket langganan.',

  geminiPoolKeys: [
    { id: 'key_1', alias: 'Gemini Key 27', keyMasked: 'AQ•••••HR3Q', dailyLimit: 1000, usageToday: 8, status: 'ACTIVE' },
    { id: 'key_2', alias: 'Gemini Key 23', keyMasked: 'AQ•••••3HRS', dailyLimit: 1000, usageToday: 0, status: 'ACTIVE' },
    { id: 'key_3', alias: 'Gemini Key 24', keyMasked: 'AQ•••••OCsQ', dailyLimit: 1000, usageToday: 0, status: 'ACTIVE' },
    { id: 'key_4', alias: 'Gemini Key 25', keyMasked: 'AQ•••••R2uQ', dailyLimit: 1000, usageToday: 0, status: 'ACTIVE' },
    { id: 'key_5', alias: 'Gemini Key 26', keyMasked: 'AQ•••••0GsG', dailyLimit: 1000, usageToday: 0, status: 'ACTIVE' },
    { id: 'key_6', alias: 'Gemini Key 27', keyMasked: 'AQ•••••RKW', dailyLimit: 1000, usageToday: 0, status: 'ACTIVE' },
    { id: 'key_7', alias: 'Gemini Key 28', keyMasked: 'AQ•••••L7HE', dailyLimit: 1000, usageToday: 0, status: 'ACTIVE' }
  ],
  autoRotateKey: true
};

export const DEFAULT_MEMORY_SKILLS: MemoryAgentSkill[] = [
  {
    id: 'skill_1',
    name: '3s Viral Verbal & Visual Hook',
    category: 'Content Ideas',
    confidenceScore: 98,
    executionCount: 520,
    status: 'CONNECTED',
    description: 'Struktur hook verbal 3 detik pertama dengan pertanyaan retoris, statistik emosional, atau aksi visual langsung tanpa basa-basi.',
    injectionSnippet: 'Pattern: Hook 0-3s harus menyentuh pain point terdalam dengan visual zoom-in 1.2x dan punchy dialogue.',
    color: '#f59e0b'
  },
  {
    id: 'skill_2',
    name: 'Cinematic Commercial 8K Lighting',
    category: 'Video AI',
    confidenceScore: 96,
    executionCount: 340,
    status: 'CONNECTED',
    description: 'Sentuhan parameter pencahayaan 8K/4K commercial softbox diffusion & gerakan kamera pan/zoom halus untuk video AI.',
    injectionSnippet: 'Lighting: Softbox high-key balanced daylight, sharp optical focus on product surface micro-texture.',
    color: '#6366f1'
  },
  {
    id: 'skill_3',
    name: 'Midjourney Editorial Fashion Studio',
    category: 'Photo Prompt',
    confidenceScore: 94,
    executionCount: 210,
    status: 'CONNECTED',
    description: 'Gaya lighting portrait studio soft window, tone warna hangat lembut, dan rasio aspek spesifik untuk generasi foto realistis.',
    injectionSnippet: 'Style: high-end commercial beauty product photography, studio-grade diffused ring light set at 5600K.',
    color: '#06b6d4'
  },
  {
    id: 'skill_4',
    name: 'Dynamic Scene Splitter (5-10s)',
    category: 'Splitter',
    confidenceScore: 97,
    executionCount: 450,
    status: 'CONNECTED',
    description: 'Pecah adegan video per 5-10 detik agar pergantian visual tetap dinamis dan retention rate penonton tinggi.',
    injectionSnippet: 'Segment Duration: 10s per clip, smooth continuous shot, kinetic text overlay, synchronized upbeat audio cues.',
    color: '#10b981'
  },
  {
    id: 'skill_5',
    name: 'Herbal Health Safeguard Guardrail',
    category: 'Guardrail',
    confidenceScore: 99,
    executionCount: 145,
    status: 'CONNECTED',
    description: 'Sensor otomatis klaim absolut non-medis untuk konten kesehatan & herbal agar menghindari anomali platform.',
    injectionSnippet: 'Compliance: Hindari klaim medis absolut seperti "100% menyembuhkan". Gunakan framing testimoni personal dan edukasi bahan alami.',
    color: '#ef4444'
  },
  {
    id: 'skill_6',
    name: 'High Conversion CTA Engine',
    category: 'Content Ideas',
    confidenceScore: 95,
    executionCount: 280,
    status: 'CONNECTED',
    description: 'Pemicu psikologi persuasif di kalimat pertama caption dan tutup dengan Call-to-Action (CTA) jelas ke keranjang kuning/link.',
    injectionSnippet: 'CTA: Arahkan penonton menyentuh keranjang kuning/bio dengan kalimat urgensi promo terbatas.',
    color: '#a855f7'
  }
];

export const DEFAULT_KNOWLEDGE_RULES: SystemKnowledgeRule[] = [
  {
    id: 'rule_1',
    title: 'Hook visual di 3 detik pertama tingkatkan retention rate hingga 68%',
    category: 'HOOK',
    source: 'MANUAL',
    content: 'Gunakan pergerakan kamera cepat, zoom in pada tekstur produk, atau teks overlay berlawanan dengan ekspektasi di 3 detik awal.',
    tag: 'HOOK SYSTEM',
    confidence: 98,
    createdAt: '15 Agu 2026'
  },
  {
    id: 'rule_2',
    title: 'Optimasi Prompt AI Video: Tambahkan indikator pencahayaan volumetric lighting & depth-of-field f/1.8',
    category: 'LIGHTING',
    source: 'MANUAL',
    content: 'Format prompt video AI yang kaya detail render kamera menghindari hasil kartun atau tekstur kaku pada AI video generator.',
    tag: 'VIDEO PROMPT',
    confidence: 96,
    createdAt: '16 Agu 2026'
  },
  {
    id: 'rule_3',
    title: 'Analisa Algoritma TikTok terkini (Durasi 25s): Terapkan variasi tempo pencahayaan dan gerakan zoom-in 1.2x',
    category: 'ALGORITHM',
    source: 'AUTO_LEARNED',
    content: 'Pacing video di 15-30 detik optimal mempertahankan completion rate di atas 45%.',
    tag: 'TIKTOK ALGORITHM',
    confidence: 94,
    createdAt: '17 Agu 2026'
  },
  {
    id: 'rule_4',
    title: 'Penulisan Copywriting FYP: Caption berpola "Masalah -> Solusi Ringkas -> Hasil Bukti -> CTA Direct"',
    category: 'COPYWRITING',
    source: 'MANUAL',
    content: 'Pola ini terbukti meningkatkan conversion rate affiliate sales sebesar 35%.',
    tag: 'COPYWRITING FYP',
    confidence: 95,
    createdAt: '17 Agu 2026'
  }
];

export const DEFAULT_AI_AGENTS = [
  { id: 'agent_1', name: 'Agent Analisis Hook FYP', role: 'Menganalisis hook visual/suara produk di 3 detik awal audiens', model: 'gemini-3.7-flash', calls: 942, status: 'AKTIF' },
  { id: 'agent_2', name: 'Agent Ide Konten & Angle', role: 'Menciptakan 5 sudut pandang unik: Pain Point, Unboxing, Review, Tips, Humor', model: 'gemini-3.7-flash', calls: 512, status: 'AKTIF' },
  { id: 'agent_3', name: 'Agent Caption & Pacing Segmen', role: 'Meracik caption persuasif, hashtag viral, dan pacing waktu video', model: 'gemini-3.7-flash', calls: 780, status: 'AKTIF' },
  { id: 'agent_4', name: 'Agent Analisis Gerakan Kamera & Framing', role: 'Mengoptimalkan prompt sinematik seperti close-up, panning, f/2.8 focus', model: 'gemini-3.1-pro-preview', calls: 415, status: 'AKTIF' },
  { id: 'agent_5', name: 'Agent Gaya Transisi & Editing', role: 'Menyusun ritme perpindahan antar klip video AI mulus dan tanpa artefak', model: 'gemini-3.7-flash', calls: 380, status: 'AKTIF' },
  { id: 'agent_6', name: 'Agent Kepatuhan & Keamanan Merek', role: 'Memvalidasi kata-kata aman regulasi e-commerce & platform video', model: 'gemini-3.7-flash', calls: 620, status: 'AKTIF' }
];

export const DEFAULT_SAFE_LEARNING: SafeLearningPattern[] = [
  {
    id: 'pat_1',
    title: 'Pola Konten Skincare Moisturizer Gel',
    category: 'Fashion/Beauty',
    sourceQuery: 'moisturizer gel dingin tidak lengket buat kulit berminyak',
    extractedPattern: 'Formula video review perbandingan 2 jar (pink vs hijau) dengan spatula logam, tekstur transparan glowing.',
    confidenceScore: 96,
    status: 'pending',
    isHighRiskMedical: false,
    date: '17 Agu 2026'
  },
  {
    id: 'pat_2',
    title: 'Pola Tas Selempang Bahan PU Leather',
    category: 'Fashion/Beauty',
    sourceQuery: 'tas selempang wanita bahan tebal gak gampang kupas',
    extractedPattern: 'Demonstrasi kompartemen muat HP dompet kunci, resleting gold halus, peragaan 2-way styling shoulder/sling.',
    confidenceScore: 94,
    status: 'pending',
    isHighRiskMedical: false,
    date: '17 Agu 2026'
  },
  {
    id: 'pat_3',
    title: 'Review Manfaat Suplemen Organik',
    category: 'Herbal & Kesehatan',
    sourceQuery: 'suplemen herbal stamina alami sertifikasi bpom',
    extractedPattern: 'Wajib sematkan disclaimer personal dan edukasi herbal, tahan auto-approve untuk review manual.',
    confidenceScore: 82,
    status: 'pending',
    isHighRiskMedical: true,
    date: '17 Agu 2026'
  },
  {
    id: 'pat_4',
    title: 'Unboxing Mini Blender Portable Estetik',
    category: 'Rumah Tangga',
    sourceQuery: 'blender mini usb rechargeable buat jus buah di kantor',
    extractedPattern: 'Demonstrasi pemotongan buah, suara blending halus, hasil smoothie segar siap minum.',
    confidenceScore: 95,
    status: 'pending',
    isHighRiskMedical: false,
    date: '17 Agu 2026'
  }
];

export const DEFAULT_LIVE_EVENTS: LiveGenerationEvent[] = [
  {
    id: 'evt_1',
    timestamp: '16:14:27',
    userCode: 'SATSET-VIP-ZJ9EKZ5F-239F',
    userName: 'Budi Santoso',
    aiTool: 'Ide Konten',
    category: 'Umum',
    modelUsed: 'gemini-2.5-flash',
    latencyMs: 1412,
    status: 'SUCCESS',
    tokenCount: 840,
    promptSnippet: 'Analisis produk moisturizer gel dingin...'
  },
  {
    id: 'evt_2',
    timestamp: '16:15:33',
    userCode: 'SATSET-882194',
    userName: 'Rizky Ramadhan',
    aiTool: 'Video-to-Prompt',
    category: 'Fashion/Beauty',
    modelUsed: 'gemini-2.5-flash',
    latencyMs: 1680,
    status: 'SUCCESS',
    tokenCount: 1120,
    promptSnippet: 'Pecah klip 10 detik adegan swatch gel di punggung tangan...'
  },
  {
    id: 'evt_3',
    timestamp: '16:17:02',
    userCode: 'SATSET-VIP-6NJFBU4Y-OD8D',
    userName: 'Ahmad David',
    aiTool: 'Prompt Foto',
    category: 'Fashion/Beauty',
    modelUsed: 'gemini-2.5-flash',
    latencyMs: 1910,
    status: 'SUCCESS',
    tokenCount: 980,
    promptSnippet: 'Midjourney v6.1 editorial beauty product in cosmetic vanity setup...'
  }
];

export const DEFAULT_LOGIN_LOGS: LoginAuditLog[] = [
  {
    id: 'log_1',
    timestamp: '17 Agu 2026, 16:10:25',
    user: 'Global Lens Admin (globallensn@gmail.com)',
    role: 'Super Admin',
    ip: '114.125.48.210',
    device: 'Desktop Chrome 127 / Windows 11',
    status: 'SUCCESS',
    detail: 'Login berhasil via Akun Super Admin'
  },
  {
    id: 'log_2',
    timestamp: '17 Agu 2026, 15:45:10',
    user: 'Rizky Ramadhan (SATSET-882194)',
    role: 'User (VIP)',
    ip: '180.252.112.44',
    device: 'Desktop Edge 127 / Windows 11',
    status: 'SUCCESS',
    detail: 'Otentikasi berhasil via Kode Akses'
  },
  {
    id: 'log_3',
    timestamp: '17 Agu 2026, 14:20:18',
    user: 'Yuliana Sari (08993288777)',
    role: 'Guest / Checkout',
    ip: '182.1.200.78',
    device: 'Mobile Safari / iOS 17.5',
    status: 'VERIFIKASI_PEMBAYARAN',
    detail: 'Mengunggah bukti pembayaran TRX-957744-SAT'
  }
];

/**
 * Generates a scoped localStorage key for a specific user to prevent data collisions
 */
export function getScopedStorageKey(baseKey: string, userIdentifier?: string | null): string {
  if (!userIdentifier || typeof userIdentifier !== 'string') {
    return baseKey;
  }
  const cleanId = userIdentifier.trim().replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  return `${baseKey}_${cleanId}`;
}

/**
 * Automatically migrates legacy global key data to scoped user key if scoped data does not exist
 */
export function migrateLegacyToScopedStorage(baseKey: string, userIdentifier?: string | null): void {
  if (typeof window === 'undefined' || !userIdentifier) return;
  try {
    const scopedKey = getScopedStorageKey(baseKey, userIdentifier);
    if (scopedKey === baseKey) return;

    const existingScoped = localStorage.getItem(scopedKey);
    if (!existingScoped) {
      const legacyGlobal = localStorage.getItem(baseKey);
      if (legacyGlobal) {
        localStorage.setItem(scopedKey, legacyGlobal);
      }
    }
  } catch (e) {
    console.warn('[Storage] Migration notice:', e);
  }
}

/**
 * Safe localStorage setter with QuotaExceededError catch & auto-pruning
 */
export function safeSetStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    console.warn(`[Storage] Quota issue on key ${key}:`, err?.message);
    try {
      // Auto-prune large history or events if quota exceeded
      const hist = localStorage.getItem('ts_history_v1');
      if (hist) {
        try {
          const parsed = JSON.parse(hist);
          if (Array.isArray(parsed) && parsed.length > 15) {
            localStorage.setItem('ts_history_v1', JSON.stringify(parsed.slice(0, 15)));
          }
        } catch {}
      }
      localStorage.removeItem('ts_live_events_v1');
      localStorage.removeItem('ts_login_logs_v1');
      // Retry set
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
}


