import type {
  FormErrors,
  FormSnapshot,
  Touched,
  Validators,
} from './types.ts';

export function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${JSON.stringify(value)}`);
}

export interface FormEngine<T extends Record<string, unknown>> {
  getSnapshot(): FormSnapshot<T>;
  getValue<K extends keyof T>(key: K): T[K];
  setValue<K extends keyof T>(key: K, value: T[K]): void;
  touch<K extends keyof T>(key: K): void;
  touchAll(keys: ReadonlyArray<keyof T>): void;
  validateField<K extends keyof T>(key: K): string | undefined;
  validateAll(keys: ReadonlyArray<keyof T>): FormErrors<T>;
  hasErrors(keys: ReadonlyArray<keyof T>): boolean;
  subscribe(listener: (snapshot: FormSnapshot<T>) => void): () => void;
  reset(): void;
}

export function createForm<T extends Record<string, unknown>>(options: {
  initialValues: T;
  validators: Validators<T>;
}): FormEngine<T> {
  let values: T = { ...options.initialValues };
  let errors: FormErrors<T> = {};
  let touched: Touched<T> = {};

  const listeners = new Set<(snapshot: FormSnapshot<T>) => void>();

  function snapshot(): FormSnapshot<T> {
    return {
      values: { ...values } as Readonly<T>,
      errors: { ...errors },
      touched: { ...touched },
    };
  }

  function notify(): void {
    const s = snapshot();
    listeners.forEach((fn) => fn(s));
  }

  function validateField<K extends keyof T>(key: K): string | undefined {
    const validator = options.validators[key] as
      | ((v: T[K], all: Readonly<T>) => string | undefined)
      | undefined;
    return validator?.(values[key], values as Readonly<T>);
  }

  return {
    getSnapshot: snapshot,

    getValue<K extends keyof T>(key: K): T[K] {
      return values[key];
    },

    setValue<K extends keyof T>(key: K, value: T[K]): void {
      values = { ...values, [key]: value };
      if (touched[key]) {
        const err = validateField(key);
        errors = { ...errors, [key]: err };
      }
      notify();
    },

    touch<K extends keyof T>(key: K): void {
      touched = { ...touched, [key]: true };
      const err = validateField(key);
      errors = { ...errors, [key]: err };
      notify();
    },

    touchAll(keys: ReadonlyArray<keyof T>): void {
      const newTouched: Touched<T> = { ...touched };
      const newErrors: FormErrors<T> = { ...errors };
      for (const key of keys) {
        newTouched[key] = true;
        newErrors[key] = validateField(key);
      }
      touched = newTouched;
      errors = newErrors;
      notify();
    },

    validateField,

    validateAll(keys: ReadonlyArray<keyof T>): FormErrors<T> {
      const result: FormErrors<T> = {};
      for (const key of keys) {
        result[key] = validateField(key);
      }
      return result;
    },

    hasErrors(keys: ReadonlyArray<keyof T>): boolean {
      return keys.some((key) => {
        const err = validateField(key);
        return err !== undefined;
      });
    },

    subscribe(listener: (snapshot: FormSnapshot<T>) => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    reset(): void {
      values = { ...options.initialValues };
      errors = {};
      touched = {};
      notify();
    },
  };
}
