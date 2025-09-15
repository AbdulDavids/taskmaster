import { form, getRequestEvent } from '$app/server';
import { validateForm } from '$lib/server/remote-fns';
import { CreateApiKeyFormSchema } from './CreateApiKeyModal.schema';

export const createApiKey = form(async (form) => {
  const { request } = getRequestEvent();

  const formValidation = validateForm(form, CreateApiKeyFormSchema);
  if (!formValidation.success) {
    return {
      success: false,
      message: 'There were errors with your submission',
      errors: formValidation.error.flatten().fieldErrors
    };
  }

  // Auth is disabled; creating API keys is not supported
  return { success: false, message: 'API keys are disabled in no-auth mode.' } as any;
});
