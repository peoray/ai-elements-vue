<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { InputGroupTextarea } from '@repo/shadcn-vue/components/ui/input-group'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { ref } from 'vue'
import { usePromptInputAttachments } from './usePromptInputAttachments'
import { useOptionalPromptInputController } from './usePromptInputController'

type InputGroupTextareaProps = InstanceType<typeof InputGroupTextarea>['$props']

interface Props extends /* @vue-ignore */ InputGroupTextareaProps {
  class?: HTMLAttributes['class']
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'What would you like to know?',
})

const emit = defineEmits<{
  change: [event: Event]
}>()

const controller = useOptionalPromptInputController()
const attachments = usePromptInputAttachments()
const isComposing = ref(false)

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (isComposing.value || e.isComposing) {
      return
    }
    if (e.shiftKey) {
      return
    }
    e.preventDefault()

    // Check if submit button is disabled
    const target = e.currentTarget as HTMLTextAreaElement
    const form = target.form
    const submitButton = form?.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement | null

    if (submitButton?.disabled) {
      return
    }

    form?.requestSubmit()
  }

  // Remove last attachment when Backspace is pressed and textarea is empty
  const target = e.currentTarget as HTMLTextAreaElement
  if (
    e.key === 'Backspace'
    && target.value === ''
    && attachments.files.length > 0
  ) {
    e.preventDefault()
    const lastAttachment = attachments.files[attachments.files.length - 1]
    if (lastAttachment) {
      attachments.remove(lastAttachment.id)
    }
  }
}

function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items

  if (!items) {
    return
  }

  const files: File[] = []

  for (const item of Array.from(items)) {
    if (item.kind === 'file') {
      const file = item.getAsFile()
      if (file) {
        files.push(file)
      }
    }
  }

  if (files.length > 0) {
    event.preventDefault()
    attachments.add(files)
  }
}

function handleChange(e: Event) {
  const target = e.currentTarget as HTMLTextAreaElement
  if (controller) {
    controller.textInput.setInput(target.value)
  }
  emit('change', e)
}

// Controlled vs uncontrolled
const controlledProps = controller
  ? {
      value: controller.textInput.value,
    }
  : {}

const { class: _, ...restProps } = props
</script>

<template>
  <InputGroupTextarea
    :class="cn('field-sizing-content max-h-48 min-h-16', props.class)"
    name="message"
    v-bind="{ ...restProps, ...controlledProps }"
    @change="handleChange"
    @keydown="handleKeyDown"
    @paste="handlePaste"
    @compositionstart="isComposing = true"
    @compositionend="isComposing = false"
  />
</template>
