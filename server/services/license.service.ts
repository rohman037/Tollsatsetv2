import { LicenseValidationRequest, LicenseValidationResponse } from '../types/api.types';

export class LicenseBackendService {
  /**
   * Validates a license or access code
   */
  public static validateAccessCode(
    request: LicenseValidationRequest
  ): LicenseValidationResponse {
    const { code } = request;
    if (!code || !code.trim()) {
      return {
        valid: false,
        message: 'Kode lisensi tidak boleh kosong.',
      };
    }

    const trimmed = code.trim().toUpperCase();

    // Default built-in superadmin
    if (
      trimmed === 'ADMIN-SATSET-999' ||
      trimmed === 'SATSET-ADMIN-SUPER' ||
      trimmed === 'ADMIN-AHMAD-DAVID' ||
      trimmed === 'AHMADDAVID0906@GMAIL.COM' ||
      trimmed === 'DAVIDROHMAN037@GMAIL.COM' ||
      trimmed === 'ADMIN' ||
      trimmed === 'SUPERADMIN'
    ) {
      return {
        valid: true,
        user: {
          id: 'admin_root',
          name: 'Ahmad David (Super Admin)',
          email: 'ahmaddavid0906@gmail.com',
          role: 'superadmin',
          tier: 'ultra_vip',
          expiryDate: '2099-12-31',
          daysRemaining: 9999,
        },
        message: 'Otorisasi Super Admin Master Berhasil.',
      };
    }

    // Default Pro VIP demo license
    if (trimmed === 'TS-PRO-2026-VIP' || trimmed.startsWith('PRO-') || trimmed.startsWith('VIP-')) {
      return {
        valid: true,
        user: {
          id: 'vip_user_demo',
          name: 'Affiliate Pro Creator',
          email: 'affiliate@creator.id',
          role: 'user',
          tier: 'pro',
          expiryDate: '2026-12-31',
          daysRemaining: 365,
        },
        message: 'Akses Lisensi VIP Berhasil.',
      };
    }

    return {
      valid: false,
      message: 'Kode lisensi tidak terdaftar atau masa aktif telah berakhir.',
    };
  }

  /**
   * Generates a new cryptographically structured license key
   */
  public static generateLicenseKey(prefix = 'SATSET', tier = 'VIP'): string {
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const year = new Date().getFullYear();
    return `${prefix}-${tier}-${year}-${part1}-${part2}`;
  }
}
