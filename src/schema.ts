import {
  BACKEND_LANGUAGES,
  FRONTEND_STACKS,
  PARTICIPATION_TYPES,
  TRACKS,
} from './types.ts';
import type { FormValues, StepDefinition } from './types.ts';

function toOptions<T extends string>(
  arr: readonly T[],
): readonly { value: string; label: string }[] {
  return arr.map((v) => ({ value: v, label: v }));
}

export const personalStep = {
  id: 'personal',
  title: 'Personal Information',
  fields: ['fullName', 'email'] as const satisfies ReadonlyArray<
    keyof FormValues
  >,
  schema: [
    {
      type: 'text',
      name: 'fullName',
      label: 'Full Name',
      placeholder: 'Full Name',
    },
    {
      type: 'email',
      name: 'email',
      label: 'Email Address',
      placeholder: 'example@gmail.com',
    },
  ],
} satisfies StepDefinition<Pick<FormValues, 'fullName' | 'email'>>;

export const participationStep = {
  id: 'participation',
  title: 'Participation Type',
  fields: ['participationType', 'companyName'] as const satisfies ReadonlyArray<
    keyof FormValues
  >,
  schema: [
    {
      type: 'select',
      name: 'participationType',
      label: 'Participation Type',
      options: toOptions(PARTICIPATION_TYPES),
    },
    {
      type: 'text',
      name: 'companyName',
      label: 'Company Name',
      placeholder: 'Company name',
    },
  ],
} satisfies StepDefinition<Pick<FormValues, 'participationType' | 'companyName'>>;

export const trackStep = {
  id: 'track',
  title: 'Choose Your Track',
  fields: ['track'] as const satisfies ReadonlyArray<keyof FormValues>,
  schema: [
    {
      type: 'select',
      name: 'track',
      label: 'Track',
      options: toOptions(TRACKS),
    },
  ],
} satisfies StepDefinition<Pick<FormValues, 'track'>>;

export const frontendDetailsSchema = [
  {
    type: 'select' as const,
    name: 'preferredStack' as const,
    label: 'Preferred Stack',
    options: toOptions(FRONTEND_STACKS),
  },
  {
    type: 'url' as const,
    name: 'portfolioUrl' as const,
    label: 'Portfolio URL',
    placeholder: 'https://myportfolio.dev',
  },
];

export const backendDetailsSchema = [
  {
    type: 'select' as const,
    name: 'primaryLanguage' as const,
    label: 'Primary Language',
    options: toOptions(BACKEND_LANGUAGES),
  },
  {
    type: 'checkbox' as const,
    name: 'wantsDocker' as const,
    label: 'I want Docker sessions',
  },
];

export const qaDetailsSchema = [
  {
    type: 'checkbox' as const,
    name: 'automationExperience' as const,
    label: 'I have automation experience',
  },
  {
    type: 'text' as const,
    name: 'favoriteTool' as const,
    label: 'Favourite QA Tool',
    placeholder: 'e.g. Playwright',
  },
];

export const reviewStep = {
  id: 'review',
  title: 'Review & Submit',
  fields: ['agreeToTerms'] as const satisfies ReadonlyArray<keyof FormValues>,
  schema: [
    { type: 'checkbox', name: 'agreeToTerms', label: 'I agree to the terms' },
  ],
} satisfies StepDefinition<Pick<FormValues, 'agreeToTerms'>>;
