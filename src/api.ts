import type { ApiSuccessResponse, SubmitPayload } from './types.ts';

const FAKE_DELAY_MS = 1500;
const FAKE_FAILURE_RATE = 0.2;

export async function submitRegistration(
  payload: SubmitPayload,
): Promise<ApiSuccessResponse> {
  console.log('[API] Submitting payload:', payload);

  await new Promise<void>((resolve) =>
    setTimeout(resolve, FAKE_DELAY_MS),
  );

  if (Math.random() < FAKE_FAILURE_RATE) {
    throw new Error('Server error: registration failed. Please try again.');
  }

  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  console.log('[API] Success, requestId:', requestId);
  return { requestId };
}
