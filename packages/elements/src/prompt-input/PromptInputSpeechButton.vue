<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { MicIcon } from 'lucide-vue-next'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import PromptInputButton from './PromptInputButton.vue'

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition
    }
    webkitSpeechRecognition: {
      new (): SpeechRecognition
    }
  }
}

interface SpeechRecognitionEvent extends /* @vue-ignore */ Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends /* @vue-ignore */ Event {
  error: string
}

interface SpeechRecognition extends /* @vue-ignore */ EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((ev: SpeechRecognitionEvent) => any) | null
  onend: ((ev: Event) => any) | null
  onerror: ((ev: SpeechRecognitionErrorEvent) => any) | null
  onstart: ((ev: Event) => any) | null
}

type PromptInputButtonProps = InstanceType<typeof PromptInputButton>['$props']

interface Props extends /* @vue-ignore */ PromptInputButtonProps {
  class?: HTMLAttributes['class']
  textareaRef?: HTMLTextAreaElement | null
  onTranscriptionChange?: (text: string) => void
}

const props = defineProps<Props>()

const isListening = ref(false)
const recognition = ref<SpeechRecognition | null>(null)

function setupSpeechRecognition() {
  if (
    typeof window !== 'undefined'
    && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  ) {
    const SpeechRecognition
      = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const speechRecognition = new SpeechRecognition()

    speechRecognition.continuous = true
    speechRecognition.interimResults = true
    speechRecognition.lang = 'en-US'

    speechRecognition.onstart = () => {
      isListening.value = true
    }

    speechRecognition.onend = () => {
      isListening.value = false
    }

    speechRecognition.onresult = (event: any) => {
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0]?.transcript ?? ''
        }
      }

      if (finalTranscript && props.textareaRef) {
        const textarea = props.textareaRef
        const currentValue = textarea.value
        const newValue
          = currentValue + (currentValue ? ' ' : '') + finalTranscript

        textarea.value = newValue
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
        props.onTranscriptionChange?.(newValue)
      }
    }

    speechRecognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      isListening.value = false
    }

    recognition.value = speechRecognition
  }
}

function toggleListening() {
  if (!recognition.value) {
    return
  }

  if (isListening.value) {
    recognition.value.stop()
  }
  else {
    recognition.value.start()
  }
}

onMounted(() => {
  setupSpeechRecognition()
})

onUnmounted(() => {
  if (recognition.value) {
    recognition.value.stop()
  }
})

watch(
  () => [props.textareaRef, props.onTranscriptionChange],
  () => {
    if (recognition.value) {
      recognition.value.stop()
    }
    setupSpeechRecognition()
  },
)

const buttonClass = computed(() =>
  cn(
    'relative transition-all duration-200',
    isListening.value && 'animate-pulse bg-accent text-accent-foreground',
    props.class,
  ),
)

const { class: _, textareaRef, onTranscriptionChange, ...restProps } = props
</script>

<template>
  <PromptInputButton
    :class="buttonClass"
    :disabled="!recognition"
    v-bind="restProps"
    @click="toggleListening"
  >
    <MicIcon class="size-4" />
  </PromptInputButton>
</template>
