import type { AttachmentsContext } from './usePromptInputController'
import { inject } from 'vue'
import { ProviderAttachmentsKey } from './usePromptInputController'

/**
 * Hook to access provider-level attachments.
 * Throws error if used outside PromptInputProvider.
 */
export function useProviderAttachments(): AttachmentsContext {
  const ctx = inject(ProviderAttachmentsKey)
  if (!ctx) {
    throw new Error(
      'Wrap your component inside <PromptInputProvider> to use useProviderAttachments().',
    )
  }
  return ctx
}

/**
 * Optional variant that doesn't throw.
 * Useful for dual-mode components.
 */
export function useOptionalProviderAttachments(): AttachmentsContext | undefined {
  return inject(ProviderAttachmentsKey, undefined)
}
