import type {
  FieldConfig,
  FormValues,
  StepId,
  SubmitState,
} from './types.ts';
import { STEPS } from './types.ts';
import { createForm, assertNever } from './form-engine.ts';
import { formValidators, getTrackDetailFields } from './validators.ts';
import {
  personalStep,
  participationStep,
  trackStep,
  frontendDetailsSchema,
  backendDetailsSchema,
  qaDetailsSchema,
  reviewStep,
} from './schema.ts';
import { toSubmitPayload } from './payload.ts';
import { submitRegistration } from './api.ts';
import { buildReviewContent } from './review.ts';
import { renderField } from './renderer.ts';
import { qs, setVisible, createElement } from './dom.ts';

const initialValues: FormValues = {
  fullName: '',
  email: '',
  participationType: 'individual',
  companyName: '',
  track: 'frontend',
  preferredStack: 'react',
  portfolioUrl: '',
  primaryLanguage: 'node',
  wantsDocker: false,
  automationExperience: false,
  favoriteTool: '',
  agreeToTerms: false,
};

const form = createForm<FormValues>({
  initialValues,
  validators: formValidators,
});

let currentStepIndex = 0;
let submitState: SubmitState = { status: 'idle' };

const stepTitle = qs<HTMLHeadingElement>('#step-title');
const stepIndicator = qs<HTMLDivElement>('#step-indicator');
const fieldsContainer = qs<HTMLDivElement>('#fields-container');
const reviewContainer = qs<HTMLDivElement>('#review-container');
const statusBlock = qs<HTMLDivElement>('#status-block');
const btnBack = qs<HTMLButtonElement>('#btn-back');
const btnNext = qs<HTMLButtonElement>('#btn-next');
const btnSubmit = qs<HTMLButtonElement>('#btn-submit');
const successScreen = qs<HTMLDivElement>('#success-screen');
const errorScreen = qs<HTMLDivElement>('#error-screen');
const errorMessageEl = qs<HTMLParagraphElement>('#error-message');
const mainWizard = qs<HTMLDivElement>('#wizard');

const stepIds: StepId[] = [...STEPS];

function currentStepId(): StepId {
  const id = stepIds[currentStepIndex];
  if (id === undefined) throw new Error('Invalid step index');
  return id;
}

function getStepFields(stepId: StepId): ReadonlyArray<keyof FormValues> {
  switch (stepId) {
    case 'personal':
      return personalStep.fields;
    case 'participation': {
      const isCompany = form.getValue('participationType') === 'company';
      return isCompany
        ? participationStep.fields
        : participationStep.fields.filter((f) => f !== 'companyName');
    }
    case 'track':
      return trackStep.fields;
    case 'track-details':
      return getTrackDetailFields(form.getValue('track'));
    case 'review':
      return reviewStep.fields;
    default:
      return assertNever(stepId);
  }
}

function getStepSchema(
  stepId: StepId,
): readonly FieldConfig<Extract<keyof FormValues, string>>[] {
  switch (stepId) {
    case 'personal':
      return personalStep.schema as FieldConfig<Extract<keyof FormValues, string>>[];
    case 'participation': {
      const isCompany = form.getValue('participationType') === 'company';
      return (participationStep.schema as FieldConfig<Extract<keyof FormValues, string>>[])
        .filter((f) => f.name !== 'companyName' || isCompany);
    }
    case 'track':
      return trackStep.schema as FieldConfig<Extract<keyof FormValues, string>>[];
    case 'track-details': {
      const track = form.getValue('track');
      switch (track) {
        case 'frontend': return frontendDetailsSchema;
        case 'backend':  return backendDetailsSchema;
        case 'qa':       return qaDetailsSchema;
        default:         return assertNever(track);
      }
    }
    case 'review':
      return reviewStep.schema as FieldConfig<Extract<keyof FormValues, string>>[];
    default:
      return assertNever(stepId);
  }
}

function getStepTitle(stepId: StepId): string {
  switch (stepId) {
    case 'personal':      return personalStep.title;
    case 'participation': return participationStep.title;
    case 'track':         return trackStep.title;
    case 'track-details': {
      const t = form.getValue('track');
      return `${t.charAt(0).toUpperCase() + t.slice(1)} Track Details`;
    }
    case 'review':        return reviewStep.title;
    default:              return assertNever(stepId);
  }
}

function updateFieldError(name: keyof FormValues): void {
  const snapshot = form.getSnapshot();
  const wrapper = fieldsContainer.querySelector<HTMLElement>(
    `[data-field="${String(name)}"]`,
  );
  if (!wrapper) return;

  const isTouched = snapshot.touched[name] !== undefined;
  const error = isTouched ? snapshot.errors[name] : undefined;

  wrapper.classList.toggle('field-group--error', !!error);
  const existing = wrapper.querySelector('.field-error');
  if (existing) existing.remove();
  if (error) {
    const el = createElement('p', { class: 'field-error' }, [error]);
    wrapper.appendChild(el);
  }
}

function renderStep(): void {
  const stepId = currentStepId();
  const schema = getStepSchema(stepId);
  const snapshot = form.getSnapshot();

  stepTitle.textContent = getStepTitle(stepId);

  fieldsContainer.innerHTML = '';

  for (const fieldConfig of schema) {
    const name = fieldConfig.name as keyof FormValues;
    const rawValue = snapshot.values[name];
    const value = typeof rawValue === 'boolean' || typeof rawValue === 'string' ? rawValue : '';
    const isTouched = snapshot.touched[name] !== undefined;
    const error = isTouched ? snapshot.errors[name] : undefined;

    const fieldEl = renderField(
      fieldConfig,
      value,
      error,
      (fieldName, newValue) => {
        form.setValue(fieldName, newValue as FormValues[typeof fieldName]);

        if (fieldName === 'participationType' || fieldName === 'track') {
          renderStep();
        } else {
          if (snapshot.touched[fieldName]) {
            form.touch(fieldName);
            updateFieldError(fieldName);
          }
        }
      },
      (fieldName) => {
        form.touch(fieldName);
        updateFieldError(fieldName);
      },
    );

    fieldEl.setAttribute('data-field', String(name));
    fieldsContainer.appendChild(fieldEl);
  }

  const isReview = stepId === 'review';
  setVisible(reviewContainer, isReview);
  if (isReview) {
    reviewContainer.innerHTML = '';
    const payload = toSubmitPayload(snapshot.values);
    reviewContainer.appendChild(buildReviewContent(payload));
  }

  setVisible(btnBack, currentStepIndex > 0);
  setVisible(btnNext, !isReview);
  setVisible(btnSubmit, isReview);

  renderStepIndicator();
  renderStatus();
}

function renderStepIndicator(): void {
  stepIndicator.innerHTML = '';
  for (let i = 0; i < stepIds.length; i++) {
    const dot = createElement('div', {
      class: `step-dot${i === currentStepIndex ? ' step-dot--active' : ''}${i < currentStepIndex ? ' step-dot--done' : ''}`,
    });
    stepIndicator.appendChild(dot);
  }
}

function renderStatus(): void {
  statusBlock.innerHTML = '';
  statusBlock.className = 'status-block';

  switch (submitState.status) {
    case 'idle':
      setVisible(statusBlock, false);
      break;
    case 'submitting':
      setVisible(statusBlock, true);
      statusBlock.classList.add('status-block--submitting');
      statusBlock.textContent = 'Submitting your registration…';
      break;
    case 'success':
      setVisible(statusBlock, false);
      break;
    case 'error':
      setVisible(statusBlock, true);
      statusBlock.classList.add('status-block--error');
      statusBlock.textContent = submitState.message;
      break;
    default:
      assertNever(submitState);
  }
}

btnNext.addEventListener('click', () => {
  const stepId = currentStepId();
  const fields = getStepFields(stepId);
  form.touchAll(fields);

  if (form.hasErrors(fields)) {
    renderStep();
    return;
  }

  if (currentStepIndex < stepIds.length - 1) {
    currentStepIndex++;
    renderStep();
  }
});

btnBack.addEventListener('click', () => {
  if (currentStepIndex > 0) {
    currentStepIndex--;
    submitState = { status: 'idle' };
    renderStep();
  }
});

btnSubmit.addEventListener('click', async () => {
  const fields = getStepFields('review');
  form.touchAll(fields);

  if (form.hasErrors(fields)) {
    renderStep();
    return;
  }

  submitState = { status: 'submitting' };
  btnSubmit.disabled = true;
  renderStatus();

  try {
    const payload = toSubmitPayload(form.getSnapshot().values);
    const result = await submitRegistration(payload);

    submitState = { status: 'success', requestId: result.requestId };
    setVisible(mainWizard, false);
    setVisible(successScreen, true);
    setVisible(errorScreen, false);
    qs<HTMLSpanElement>('#request-id').textContent = result.requestId;
  } catch (err) {
    submitState = {
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error occurred.',
    };
    errorMessageEl.textContent = submitState.message;
    btnSubmit.disabled = false;
    renderStatus();
  }
});

qs<HTMLButtonElement>('#btn-try-again').addEventListener('click', () => {
  form.reset();
  currentStepIndex = 0;
  submitState = { status: 'idle' };
  setVisible(mainWizard, true);
  setVisible(successScreen, false);
  setVisible(errorScreen, false);
  renderStep();
});

setVisible(successScreen, false);
setVisible(errorScreen, false);
renderStep();
