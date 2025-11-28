import type { InjectionKey } from 'vue'
import type { AttachmentsContext } from './usePromptInputController'
import { inject } from 'vue'
import { useOptionalProviderAttachments } from './useProviderAttachments'

export const LocalAttachmentsKey: InjectionKey<AttachmentsContext>
  = Symbol('LocalAttachments')

/**
 * Dual-mode hook that works with either provider or local attachments.
 * Prefers provider context if available, falls back to local context.
 * Throws error if used outside both contexts.
 */
export function usePromptInputAttachments(): AttachmentsContext {
  // Try provider first
  const provider = useOptionalProviderAttachments()

  // Fall back to local context
  const local = inject(LocalAttachmentsKey, undefined)

  const context = provider ?? local

  if (!context) {
    throw new Error(
      'usePromptInputAttachments must be used within a PromptInput or PromptInputProvider',
    )
  }

  return context
}
