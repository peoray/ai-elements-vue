import type { FileUIPart as AIFileUIPart } from 'ai'
import type { InjectionKey, Ref } from 'vue'

// Mimicking the AI SDK type
export type FileUIPart = AIFileUIPart & {
  id: string
  file?: File // Keep original file reference handy
}

export interface PromptInputMessage {
  text: string
  files: FileUIPart[]
}

export interface AttachmentsContext {
  files: Ref<FileUIPart[]>
  add: (files: File[] | FileList) => void
  remove: (id: string) => void
  clear: () => void
  openFileDialog: () => void
  fileInputRef: Ref<HTMLInputElement | null>
}

export interface TextInputContext {
  value: Ref<string>
  setInput: (v: string) => void
  clear: () => void
}

export interface PromptInputControllerContext {
  textInput: TextInputContext
  attachments: AttachmentsContext
  registerFileInput: (el: HTMLInputElement | null, openFn: () => void) => void
}

export const PromptInputControllerKey: InjectionKey<PromptInputControllerContext> = Symbol('PromptInputController')
export const AttachmentsContextKey: InjectionKey<AttachmentsContext> = Symbol('AttachmentsContext')
