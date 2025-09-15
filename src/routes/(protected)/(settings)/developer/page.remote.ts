import { form, getRequestEvent } from '$app/server';
import { validateForm } from '$lib/server/remote-fns';
import z from 'zod';

const DeleteApiKeyFormSchema = z.object({
  id: z.string()
});

export const deleteApiKey = form(async (form): Promise<{ success: boolean }> => {
  const { locals, request } = getRequestEvent();

  const formValidation = validateForm(form, DeleteApiKeyFormSchema);
  if (!formValidation.success) {
    locals.logError('Could not delete API Key - Invalid form submission', formValidation.error);
    locals.sendFlashMessage({
      title: 'Error',
      description: 'Could not delete API key. Please inform customer support.'
    });
    return { success: false };
  }

  locals.sendFlashMessage({
    title: 'Unavailable',
    description: 'API keys are disabled in no-auth mode.'
  });
  return { success: false };
});
