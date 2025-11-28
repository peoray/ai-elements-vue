import type { FileUIPart } from 'ai'
import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface AttachmentsContext {
  files: (FileUIPart & { id: string })[]
  add: (files: File[] | FileList) => void
  remove: (id: string) => void
  clear: () => void
  openFileDialog: () => void
  fileInputRef: Ref<HTMLInputElement | null>
}

export interface TextInputContext {
  value: string
  setInput: (v: string) => void
  clear: () => void
}

export interface PromptInputControllerContext {
  textInput: TextInputContext
  attachments: AttachmentsContext
  /** INTERNAL: Allows PromptInput to register its file input + "open" callback */
  __registerFileInput: (
    ref: Ref<HTMLInputElement | null>,
    open: () => void
  ) => void
}

export const PromptInputControllerKey: InjectionKey<PromptInputControllerContext>
  = Symbol('PromptInputController')

export const ProviderAttachmentsKey: InjectionKey<AttachmentsContext>
  = Symbol('ProviderAttachments')

/**
 * Main hook to access the prompt input controller.
 * Throws error if used outside PromptInputProvider.
 */
export function usePromptInputController(): PromptInputControllerContext {
  const ctx = inject(PromptInputControllerKey)
  if (!ctx) {
    throw new Error(
      'Wrap your component inside <PromptInputProvider> to use usePromptInputController().',
    )
  }
  return ctx
}

/**
 * Optional variant that doesn't throw.
 * Useful for dual-mode components.
 */
export function useOptionalPromptInputController(): PromptInputControllerContext | undefined {
  return inject(PromptInputControllerKey, undefined)
}
