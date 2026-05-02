import type { FormValues, Validators } from './types.ts';
import { assertNever } from './form-engine.ts';

function isNonEmpty(v: string): boolean {
  return v.trim().length > 0;
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidUrl(v: string): boolean {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}


export const formValidators: Validators<FormValues> = {
  fullName: (v) => (isNonEmpty(v) ? undefined : 'Full name is required'),

  email: (v) => {
    if (!isNonEmpty(v)) return 'Email is required';
    if (!isValidEmail(v)) return 'Enter a valid email address';
    return undefined;
  },

  participationType: (v) =>
    v ? undefined : 'Please select a participation type',

  companyName: (v, all) => {
    if (all.participationType === 'company' && !isNonEmpty(v)) {
      return 'Company name is required for company registration';
    }
    return undefined;
  },

  track: (v) => (v ? undefined : 'Please select a track'),

  preferredStack: (v, all) => {
    if (all.track === 'frontend' && !v) {
      return 'Please select your preferred stack';
    }
    return undefined;
  },

  portfolioUrl: (v, all) => {
    if (all.track === 'frontend') {
      if (!isNonEmpty(v)) return 'Portfolio URL is required';
      if (!isValidUrl(v)) return 'Enter a valid URL (https://...)';
    }
    return undefined;
  },

  primaryLanguage: (v, all) => {
    if (all.track === 'backend' && !v) {
      return 'Please select your primary language';
    }
    return undefined;
  },

  favoriteTool: (v, all) => {
    if (all.track === 'qa' && !isNonEmpty(v)) {
      return 'Please enter your favourite QA tool';
    }
    return undefined;
  },

  agreeToTerms: (v) =>
    v ? undefined : 'You must agree to the terms to continue',
};

export function getTrackDetailFields(
  track: FormValues['track'],
): ReadonlyArray<keyof FormValues> {
  switch (track) {
    case 'frontend':
      return ['preferredStack', 'portfolioUrl'];
    case 'backend':
      return ['primaryLanguage', 'wantsDocker'];
    case 'qa':
      return ['automationExperience', 'favoriteTool'];
    default:
      return assertNever(track);
  }
}
