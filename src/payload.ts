import type { FormValues, SubmitPayload } from './types.ts';
import { assertNever } from './form-engine.ts';


export function toSubmitPayload(values: Readonly<FormValues>): SubmitPayload {
  const base = {
    fullName: values.fullName,
    email: values.email,
    participationType: values.participationType,
    agreeToTerms: values.agreeToTerms,
    ...(values.participationType === 'company' && values.companyName
      ? { companyName: values.companyName }
      : {}),
  };

  switch (values.track) {
    case 'frontend':
      return {
        ...base,
        track: 'frontend',
        preferredStack: values.preferredStack,
        portfolioUrl: values.portfolioUrl,
      };

    case 'backend':
      return {
        ...base,
        track: 'backend',
        primaryLanguage: values.primaryLanguage,
        wantsDocker: values.wantsDocker,
      };

    case 'qa':
      return {
        ...base,
        track: 'qa',
        automationExperience: values.automationExperience,
        favoriteTool: values.favoriteTool,
      };

    default:
      return assertNever(values.track);
  }
}
