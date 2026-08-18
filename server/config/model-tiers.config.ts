/**
 * Centralized Gemini Model Tier Configurations
 * Ensures consistent model naming across backend services and frontend tools
 * Compliant with modern @google/genai SDK guidelines
 */

export const GEMINI_MODELS = {
  FLASH: 'gemini-3.7-flash',
  FLASH_3_7: 'gemini-3.7-flash',
  FLASH_3_5: 'gemini-3.5-flash',
  FLASH_2_5: 'gemini-2.5-flash',
  PRO: 'gemini-3.1-pro-preview',
  PRO_2_5: 'gemini-2.5-pro',
  FLASH_LITE: 'gemini-3.1-flash-lite',
} as const;

export type SupportedModelEngine =
  | 'gemini-3.7-flash'
  | 'gemini-3.5-flash'
  | 'gemini-2.5-flash'
  | 'gemini-3.1-pro-preview'
  | 'gemini-2.5-pro'
  | 'gemini-3.1-flash-lite'
  | string;

export interface ModelTierItem {
  tier: 'tier_1' | 'tier_2' | 'tier_3';
  model: string;
  useSearchGrounding: boolean;
  useHighThinking: boolean;
  useLowLatency: boolean;
}
