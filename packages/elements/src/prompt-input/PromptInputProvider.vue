<script setup lang="ts">
import type { FileUIPart } from 'ai'
import type { Ref } from 'vue'
import type { AttachmentsContext, PromptInputControllerContext } from './usePromptInputController'
import { nanoid } from 'nanoid'
import { computed, onUnmounted, provide, ref } from 'vue'
import {

  PromptInputControllerKey,
  ProviderAttachmentsKey,
} from './usePromptInputController'

interface Props {
  initialInput?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialInput: '',
})

// ----- Text input state -----
const textInput = ref(props.initialInput)
function setInput(v: string) {
  textInput.value = v
}
function clearInput() {
  textInput.value = ''
}

// ----- Attachments state -----
const attachmentFiles = ref<(FileUIPart & { id: string })[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const openRef = ref<() => void>(() => {})

function add(files: File[] | FileList) {
  const incoming = Array.from(files)
  if (incoming.length === 0) {
    return
  }

  const newFiles: (FileUIPart & { id: string })[] = incoming.map(file => ({
    id: nanoid(),
    type: 'file' as const,
    url: URL.createObjectURL(file),
    mediaType: file.type,
    filename: file.name,
  }))

  attachmentFiles.value = [...attachmentFiles.value, ...newFiles]
}

function remove(id: string) {
  const found = attachmentFiles.value.find(f => f.id === id)
  if (found?.url) {
    URL.revokeObjectURL(found.url)
  }
  attachmentFiles.value = attachmentFiles.value.filter(f => f.id !== id)
}

function clear() {
  for (const f of attachmentFiles.value) {
    if (f.url) {
      URL.revokeObjectURL(f.url)
    }
  }
  attachmentFiles.value = []
}

function openFileDialog() {
  openRef.value?.()
}

const attachments = computed<AttachmentsContext>(() => ({
  files: attachmentFiles.value,
  add,
  remove,
  clear,
  openFileDialog,
  fileInputRef,
}))

function __registerFileInput(ref: Ref<HTMLInputElement | null>, open: () => void) {
  fileInputRef.value = ref.value
  openRef.value = open
}

const controller = computed<PromptInputControllerContext>(() => ({
  textInput: {
    value: textInput.value,
    setInput,
    clear: clearInput,
  },
  attachments: attachments.value,
  __registerFileInput,
}))

// Provide contexts
provide(PromptInputControllerKey, controller.value)
provide(ProviderAttachmentsKey, attachments.value)

// Cleanup blob URLs on unmount
onUnmounted(() => {
  for (const f of attachmentFiles.value) {
    if (f.url) {
      URL.revokeObjectURL(f.url)
    }
  }
})
</script>

<template>
  <slot />
</template>
