export const PARTICIPATION_TYPES = ['individual', 'company'] as const;
export const TRACKS = ['frontend', 'backend', 'qa'] as const;
export const FRONTEND_STACKS = ['react', 'vue', 'angular', 'vanilla'] as const;
export const BACKEND_LANGUAGES = ['node', 'java', 'go', 'python'] as const;

export type ParticipationType = (typeof PARTICIPATION_TYPES)[number];
export type Track = (typeof TRACKS)[number];
export type FrontendStack = (typeof FRONTEND_STACKS)[number];
export type BackendLanguage = (typeof BACKEND_LANGUAGES)[number];

export type FormValues = {
  fullName: string;
  email: string;
  participationType: ParticipationType;
  companyName: string;
  track: Track;

  preferredStack: FrontendStack;
  portfolioUrl: string;

  primaryLanguage: BackendLanguage;
  wantsDocker: boolean;
  
  automationExperience: boolean;
  favoriteTool: string;
  
  agreeToTerms: boolean;
}

type BasePayload = {
  fullName: string;
  email: string;
  participationType: ParticipationType;
  companyName?: string;
  agreeToTerms: boolean;
};

export type SubmitPayload =
  | (BasePayload & {
      track: 'frontend';
      preferredStack: FrontendStack;
      portfolioUrl: string;
    })
  | (BasePayload & {
      track: 'backend';
      primaryLanguage: BackendLanguage;
      wantsDocker: boolean;
    })
  | (BasePayload & {
      track: 'qa';
      automationExperience: boolean;
      favoriteTool: string;
    });

export type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; requestId: string }
  | { status: 'error'; message: string };

export const STEPS = [
  'personal',
  'participation',
  'track',
  'track-details',
  'review',
] as const;

export type StepId = (typeof STEPS)[number];

export type FieldConfig<Name extends string> =
  | { type: 'text'; name: Name; label: string; placeholder?: string }
  | { type: 'email'; name: Name; label: string; placeholder?: string }
  | { type: 'url'; name: Name; label: string; placeholder?: string }
  | {
      type: 'select';
      name: Name;
      label: string;
      options: readonly { value: string; label: string }[];
    }
  | { type: 'checkbox'; name: Name; label: string };

export type FormSchema<T> = readonly FieldConfig<Extract<keyof T, string>>[];

export interface StepDefinition<T extends Record<string, unknown>> {
  id: StepId;
  title: string;
  schema: FormSchema<T>;
  /** Which keys from T are validated on this step */
  fields: ReadonlyArray<keyof T>;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type Touched<T> = Partial<Record<keyof T, boolean>>;
export type Validators<T> = Partial<{
  [K in keyof T]: (value: T[K], values: Readonly<T>) => string | undefined;
}>;

export interface FormSnapshot<T> {
  values: Readonly<T>;
  errors: FormErrors<T>;
  touched: Touched<T>;
}

export interface ApiSuccessResponse {
  requestId: string;
}