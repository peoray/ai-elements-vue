<script setup lang="ts">
import type { FileUIPart } from 'ai'
import type { AttachmentsContext } from './usePromptInputController'
import { InputGroup } from '@repo/shadcn-vue/components/ui/input-group'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { nanoid } from 'nanoid'
import { computed, onMounted, onUnmounted, provide, ref, watch } from 'vue'
import { LocalAttachmentsKey } from './usePromptInputAttachments'
import { useOptionalPromptInputController } from './usePromptInputController'

export interface PromptInputMessage {
  text: string
  files: FileUIPart[]
}

interface Props {
  class?: string
  accept?: string
  multiple?: boolean
  globalDrop?: boolean
  syncHiddenInput?: boolean
  maxFiles?: number
  maxFileSize?: number
  onError?: (err: {
    code: 'max_files' | 'max_file_size' | 'accept'
    message: string
  }) => void
  onSubmit: (
    message: PromptInputMessage,
    event: Event
  ) => void | Promise<void>
}

const props = defineProps<Props>()

// Try to use provider controller if present
const controller = useOptionalPromptInputController()
const usingProvider = !!controller

// Refs
const inputRef = ref<HTMLInputElement | null>(null)
const formRef = ref<HTMLFormElement | null>(null)

// ----- Local attachments (only used when no provider) -----
const items = ref<(FileUIPart & { id: string })[]>([])
const files = computed(() =>
  usingProvider ? controller!.attachments.files : items.value,
)

function matchesAccept(f: File): boolean {
  if (!props.accept || props.accept.trim() === '') {
    return true
  }
  if (props.accept.includes('image/*')) {
    return f.type.startsWith('image/')
  }
  return true
}

function addLocal(fileList: File[] | FileList) {
  const incoming = Array.from(fileList)
  const accepted = incoming.filter(f => matchesAccept(f))

  if (incoming.length && accepted.length === 0) {
    props.onError?.({
      code: 'accept',
      message: 'No files match the accepted types.',
    })
    return
  }

  const withinSize = (f: File) =>
    props.maxFileSize ? f.size <= props.maxFileSize : true
  const sized = accepted.filter(withinSize)

  if (accepted.length > 0 && sized.length === 0) {
    props.onError?.({
      code: 'max_file_size',
      message: 'All files exceed the maximum size.',
    })
    return
  }

  items.value = (() => {
    const prev = items.value
    const capacity
      = typeof props.maxFiles === 'number'
        ? Math.max(0, props.maxFiles - prev.length)
        : undefined
    const capped
      = typeof capacity === 'number' ? sized.slice(0, capacity) : sized

    if (typeof capacity === 'number' && sized.length > capacity) {
      props.onError?.({
        code: 'max_files',
        message: 'Too many files. Some were not added.',
      })
    }

    const next: (FileUIPart & { id: string })[] = []
    for (const file of capped) {
      next.push({
        id: nanoid(),
        type: 'file',
        url: URL.createObjectURL(file),
        mediaType: file.type,
        filename: file.name,
      })
    }
    return prev.concat(next)
  })()
}

function removeLocal(id: string) {
  const found = items.value.find(file => file.id === id)
  if (found?.url) {
    URL.revokeObjectURL(found.url)
  }
  items.value = items.value.filter(file => file.id !== id)
}

function clearLocal() {
  for (const file of items.value) {
    if (file.url) {
      URL.revokeObjectURL(file.url)
    }
  }
  items.value = []
}

function openFileDialogLocal() {
  inputRef.value?.click()
}

const add = usingProvider ? controller!.attachments.add : addLocal
const remove = usingProvider ? controller!.attachments.remove : removeLocal
const clear = usingProvider ? controller!.attachments.clear : clearLocal
const openFileDialog = usingProvider
  ? controller!.attachments.openFileDialog
  : openFileDialogLocal

// Register file input with provider
onMounted(() => {
  if (usingProvider) {
    controller!.__registerFileInput(inputRef, () => inputRef.value?.click())
  }
})

// Sync hidden input
watch(files, () => {
  if (props.syncHiddenInput && inputRef.value && files.value.length === 0) {
    inputRef.value.value = ''
  }
})

// Form drag and drop
onMounted(() => {
  const form = formRef.value
  if (!form)
    return

  const onDragOver = (e: DragEvent) => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault()
    }
  }
  const onDrop = (e: DragEvent) => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault()
    }
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      add(e.dataTransfer.files)
    }
  }

  form.addEventListener('dragover', onDragOver)
  form.addEventListener('drop', onDrop)

  onUnmounted(() => {
    form.removeEventListener('dragover', onDragOver)
    form.removeEventListener('drop', onDrop)
  })
})

// Global drop (opt-in)
onMounted(() => {
  if (!props.globalDrop)
    return

  const onDragOver = (e: DragEvent) => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault()
    }
  }
  const onDrop = (e: DragEvent) => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault()
    }
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      add(e.dataTransfer.files)
    }
  }

  document.addEventListener('dragover', onDragOver)
  document.addEventListener('drop', onDrop)

  onUnmounted(() => {
    document.removeEventListener('dragover', onDragOver)
    document.removeEventListener('drop', onDrop)
  })
})

// Cleanup on unmount (only if not using provider)
onUnmounted(() => {
  if (!usingProvider) {
    for (const f of items.value) {
      if (f.url)
        URL.revokeObjectURL(f.url)
    }
  }
})

function handleChange(event: Event) {
  const target = event.currentTarget as HTMLInputElement
  if (target.files) {
    add(target.files)
  }
  // Reset to allow selecting same files again
  target.value = ''
}

async function convertBlobUrlToDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  }
  catch {
    return null
  }
}

function handleSubmit(event: Event) {
  event.preventDefault()

  const form = event.currentTarget as HTMLFormElement
  const text = usingProvider
    ? controller!.textInput.value
    : (() => {
        const formData = new FormData(form)
        return (formData.get('message') as string) || ''
      })()

  // Reset form immediately
  if (!usingProvider) {
    form.reset()
  }

  // Convert blob URLs to data URLs
  Promise.all(
    files.value.map(async ({ id, ...item }) => {
      if (item.url && item.url.startsWith('blob:')) {
        const dataUrl = await convertBlobUrlToDataUrl(item.url)
        return {
          ...item,
          url: dataUrl ?? item.url,
        }
      }
      return item
    }),
  )
    .then((convertedFiles: FileUIPart[]) => {
      try {
        const result = props.onSubmit({ text, files: convertedFiles }, event)

        if (result instanceof Promise) {
          result
            .then(() => {
              clear()
              if (usingProvider) {
                controller!.textInput.clear()
              }
            })
            .catch(() => {
              // Don't clear on error
            })
        }
        else {
          clear()
          if (usingProvider) {
            controller!.textInput.clear()
          }
        }
      }
      catch {
        // Don't clear on error
      }
    })
    .catch(() => {
      // Don't clear on error
    })
}

// Create attachments context for children
const ctx = computed<AttachmentsContext>(() => ({
  files: files.value.map(item => ({ ...item, id: item.id })),
  add,
  remove,
  clear,
  openFileDialog,
  fileInputRef: inputRef,
}))

// Only provide local context if not using provider
if (!usingProvider) {
  provide(LocalAttachmentsKey, ctx.value)
}
</script>

<template>
  <input
    ref="inputRef"
    :accept="props.accept"
    :multiple="props.multiple"
    type="file"
    class="hidden"
    aria-label="Upload files"
    title="Upload files"
    @change="handleChange"
  >
  <form
    ref="formRef"
    :class="cn('w-full', props.class)"
    @submit="handleSubmit"
  >
    <InputGroup class="overflow-hidden">
      <slot />
    </InputGroup>
  </form>
</template>
