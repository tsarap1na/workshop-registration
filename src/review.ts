import type { SubmitPayload } from './types.ts';
import { assertNever } from './form-engine.ts';
import { createElement } from './dom.ts';

function row(label: string, value: string | boolean): HTMLElement {
  const item = createElement('div', { class: 'review-item' });
  item.appendChild(createElement('span', { class: 'review-label' }, [label]));
  item.appendChild(
    createElement('span', { class: 'review-value' }, [
      typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value,
    ]),
  );
  return item;
}

export function buildReviewContent(payload: SubmitPayload): HTMLElement {
  const container = createElement('div', { class: 'review-content' });

  const baseSection = createElement('div', { class: 'review-section' });
  baseSection.appendChild(
    createElement('h3', { class: 'review-section-title' }, ['Personal']),
  );
  baseSection.appendChild(row('Full Name', payload.fullName));
  baseSection.appendChild(row('Email', payload.email));
  baseSection.appendChild(
    row('Participation', payload.participationType),
  );
  if (payload.companyName) {
    baseSection.appendChild(row('Company', payload.companyName));
  }
  container.appendChild(baseSection);

  const trackSection = createElement('div', { class: 'review-section' });
  trackSection.appendChild(
    createElement('h3', { class: 'review-section-title' }, [
      `Track: ${payload.track.toUpperCase()}`,
    ]),
  );

  switch (payload.track) {
    case 'frontend':
      trackSection.appendChild(row('Preferred Stack', payload.preferredStack));
      trackSection.appendChild(row('Portfolio URL', payload.portfolioUrl));
      break;

    case 'backend':
      trackSection.appendChild(
        row('Primary Language', payload.primaryLanguage),
      );
      trackSection.appendChild(row('Wants Docker', payload.wantsDocker));
      break;

    case 'qa':
      trackSection.appendChild(
        row('Automation Experience', payload.automationExperience),
      );
      trackSection.appendChild(row('Favourite Tool', payload.favoriteTool));
      break;

    default:
      assertNever(payload);
  }

  container.appendChild(trackSection);
  return container;
}
