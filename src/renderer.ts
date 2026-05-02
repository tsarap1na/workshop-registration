import type { FieldConfig, FormValues } from './types.ts';
import { assertNever } from './form-engine.ts';
import { createElement } from './dom.ts';

export type FieldChangeHandler = (
  name: keyof FormValues,
  value: string | boolean,
) => void;

export type FieldBlurHandler = (name: keyof FormValues) => void;


export function renderField(
  config: FieldConfig<Extract<keyof FormValues, string>>,
  value: string | boolean,
  error: string | undefined,
  onChange: FieldChangeHandler,
  onBlur: FieldBlurHandler,
): HTMLElement {
  const wrapper = createElement('div', {
    class: `field-group${error ? ' field-group--error' : ''}`,
  });

  const labelEl = createElement('label', { for: config.name, class: 'field-label' }, [
    config.label,
  ]);
  wrapper.appendChild(labelEl);

  switch (config.type) {
    case 'text':
    case 'email':
    case 'url': {
      const input = createElement('input', {
        type: config.type,
        id: config.name,
        name: config.name,
        class: 'field-input',
        value: typeof value === 'string' ? value : '',
        ...(config.placeholder ? { placeholder: config.placeholder } : {}),
      });
      input.addEventListener('input', () => {
        onChange(config.name as keyof FormValues, input.value);
      });
      input.addEventListener('blur', () => {
        onBlur(config.name as keyof FormValues);
      });
      wrapper.appendChild(input);
      break;
    }

    case 'select': {
      const select = createElement('select', {
        id: config.name,
        name: config.name,
        class: 'field-input field-select',
      });

      const placeholder = createElement('option', { value: '', disabled: '', selected: '' }, [
        `select`,
      ]);
      select.appendChild(placeholder);

      for (const opt of config.options) {
        const option = createElement('option', { value: opt.value }, [opt.label]);
        if (opt.value === value) option.setAttribute('selected', '');
        select.appendChild(option);
      }

      select.addEventListener('change', () => {
        onChange(config.name as keyof FormValues, select.value);
      });
      select.addEventListener('blur', () => {
        onBlur(config.name as keyof FormValues);
      });
      wrapper.appendChild(select);
      break;
    }

    case 'checkbox': {
      const checkWrapper = createElement('div', { class: 'field-checkbox-wrapper' });
      const input = createElement('input', {
        type: 'checkbox',
        id: config.name,
        name: config.name,
        class: 'field-checkbox',
      });
      if (value === true) input.setAttribute('checked', '');

      input.addEventListener('change', () => {
        onChange(config.name as keyof FormValues, input.checked);
      });
      input.addEventListener('blur', () => {
        onBlur(config.name as keyof FormValues);
      });

      const checkLabel = createElement('label', { for: config.name, class: 'field-checkbox-label' }, [
        config.label,
      ]);
      checkWrapper.appendChild(input);
      checkWrapper.appendChild(checkLabel);
      wrapper.appendChild(checkWrapper);
      break;
    }

    default:
      assertNever(config);
  }

  if (error) {
    const errorEl = createElement('p', { class: 'field-error' }, [error]);
    wrapper.appendChild(errorEl);
  }

  return wrapper;
}
