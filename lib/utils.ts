import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Universal safe clipboard copier with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('[copyToClipboard] Clipboard API failed, attempting fallback textarea:', err);
  }

  // Fallback for older browsers or restricted iframe environments
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (fallbackErr) {
    console.error('[copyToClipboard] Fallback copy failed:', fallbackErr);
    return false;
  }
}

/**
 * Format large numbers to readable string (e.g. 1.2M, 45.3K)
 */
export function formatCompactNumber(num: number): string {
  if (isNaN(num) || num === null || num === undefined) return '0';
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString('id-ID');
}

/**
 * Format seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Safe JSON parse with custom fallback
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    const clean = jsonString
      .replace(/^```json\s*/i, '')
      .replace(/```$/g, '')
      .trim();
    return JSON.parse(clean) as T;
  } catch {
    return fallback;
  }
}
