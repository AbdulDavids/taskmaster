<script lang="ts">
  import ActionCard from '$lib/ui/cards/ActionCard.svelte';
  import TextInput from '$lib/ui/inputs/TextInput.svelte';
  import { Modal } from '@skeletonlabs/skeleton-svelte';
  import { defaults, superForm } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';
  import { createApiKey } from './CreateApiKeyModal.remote';
  import { CreateApiKeyRequest } from './CreateApiKeyModal.schemas';
  import type { ComponentProps } from 'svelte';

  type Props = { open?: boolean; onClose?: () => void; onSuccess?: () => void };
  let { open = false, onClose = () => {}, onSuccess = () => {} }: Props = $props();

  let createdKey = $state<{ key: string } | null>(null);
  let copied = $state(false);

  const { form, errors, enhance, submitting, message, formId } = superForm(
    defaults(zod(CreateApiKeyRequest)),
    {
      validators: zod(CreateApiKeyRequest),
      SPA: true,
      resetForm: true,
      onUpdate: async ({ form }) => {
        if (!form.valid) return;
        const result = await createApiKey(form.data);
        createdKey = { key: result.key };
      },
      clearOnSubmit: 'errors-and-message'
    }
  );

  function handleClose() {
    createdKey = null;
    onClose?.();
    onSuccess?.();
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(createdKey!.key);
    copied = true;
  }

  const handleOpenStateChange: ComponentProps<typeof Modal>['onOpenChange'] = (e) => {
    if (!e.open) {
      handleClose();
    }
  };
</script>

<Modal {open} onOpenChange={handleOpenStateChange} backdropClasses="backdrop-blur-xs backdrop-brightness-50">
  {#snippet content()}
    {#if !createdKey}
      {@render createView()}
    {:else}
      {@render successView()}
    {/if}
  {/snippet}
</Modal>

{#snippet createView()}
  <ActionCard title="New API Key" subtitle="Create a new API key for programmatic access (e.g., MCP).">
    {#snippet body()}
      <form id={$formId} class="space-y-4" method="POST" use:enhance>
        {#if $message}
          <div class="alert rounded-lg border border-success-200 bg-success-50 p-3 text-success-800">
            <span class="font-medium">{$message}</span>
          </div>
        {/if}

        <TextInput
          label="Label"
          placeholder="My workstation key"
          name="label"
          status={$errors.label ? 'error' : undefined}
          bind:value={$form.label}
          disabled={$submitting}
          required
          autocomplete="off">
          {#snippet error()}
            <span class="mt-1 text-sm text-error-600">{$errors.label}</span>
          {/snippet}
        </TextInput>
      </form>
    {/snippet}

    {#snippet actions()}
      <footer class="mt-2 flex justify-end gap-3">
        <button type="button" class="btn preset-tonal" onclick={handleClose}>Cancel</button>
        <button form={$formId} type="submit" class="btn preset-filled" disabled={$submitting}>
          {$submitting ? 'Creating…' : 'Create Key'}
        </button>
      </footer>
    {/snippet}
  </ActionCard>
{/snippet}

{#snippet successView()}
  <ActionCard title="API Key Created" subtitle="Copy and store this key securely. You won't see it again.">
    {#snippet body()}
      <div class="space-y-4">
        <TextInput name="apiKey" label="API Key" value={createdKey!.key} readonly />
      </div>
    {/snippet}

    {#snippet actions()}
      <button class="btn preset-outlined" onclick={copyToClipboard}>{copied ? 'Copied!' : 'Copy'}</button>
      <button class="btn preset-tonal" onclick={handleClose}>Close</button>
    {/snippet}
  </ActionCard>
{/snippet}
