# Workshop Registration Wizard

Schema-driven multi-step registration form built with **Vanilla TypeScript + HTML + CSS**.  
No React, Vue, Angular, or form libraries - just TypeScript and the DOM.

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Architecture

### Form Engine (`form-engine.ts`)
A generic `createForm<T>()` factory that holds values, errors, and touched state.  
Exposes: `getValue`, `setValue`, `touch`, `touchAll`, `validateAll`, `hasErrors`, `subscribe`, `reset`.  
Validation is step-scoped - only the keys relevant to the current step are validated on Next click.

### Schema (`schema.ts`)
Each step is described as a `StepDefinition<T>` with an array of `FieldConfig` descriptors.  
The renderer iterates the schema and creates DOM elements - no fields are hardcoded in HTML.

### Payload (`payload.ts`)
`toSubmitPayload(values)` converts the flat `FormValues` to a `SubmitPayload` discriminated union.  
The form type and payload type are intentionally separate - the transformation is the explicit boundary.

### Submit State (`types.ts`)
`SubmitState` is a discriminated union: `idle | submitting | success | error`.  
No boolean flags. Each state is rendered by a `switch` in `main.ts`.

---

## Used TypeScript Patterns

| Pattern | Where |
|---|---|
| **Literal unions via `as const`** | `TRACKS`, `FRONTEND_STACKS`, etc. in `types.ts` |
| **Generics** | `createForm<T>`, `FormEngine<T>`, `FieldConfig<Name>`, `FormSchema<T>` |
| **`keyof T` and `T[K]`** | `getValue<K extends keyof T>`, `setValue<K extends keyof T>` in `form-engine.ts` |
| **Mapped types** | `FormErrors<T>`, `Touched<T>`, `Validators<T>` - all `Partial<Record<keyof T, ...>>` |
| **`Partial<Record<...>>`** | `FormErrors<T>`, `Touched<T>`, `Validators<T>` |
| **`satisfies`** | Step definitions in `schema.ts` - preserves narrow type, checks shape |
| **Discriminated unions** | `SubmitPayload` (by `track`), `SubmitState` (by `status`), `FieldConfig` (by `type`) |
| **Utility types** | `Pick<FormValues, ...>` in step schemas; `Readonly<T>` in validators |
| **Exhaustive check (`assertNever`)** | Default branches in `main.ts`, `renderer.ts`, `review.ts`, `payload.ts`, `validators.ts` |
| **Type guards for DOM** | `isInputElement`, `isSelectElement`, `isTextAreaElement` in `dom.ts` |
| **`strict: true`, no `any`** | `tsconfig.json`, enforced project-wide |
