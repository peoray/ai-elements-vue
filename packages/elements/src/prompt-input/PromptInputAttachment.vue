<script setup lang="ts">
import type { FileUIPart } from 'ai'
import type { HTMLAttributes } from 'vue'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { HoverCardTrigger } from '@repo/shadcn-vue/components/ui/hover-card'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { PaperclipIcon, XIcon } from 'lucide-vue-next'
import PromptInputHoverCard from './PromptInputHoverCard.vue'
import PromptInputHoverCardContent from './PromptInputHoverCardContent.vue'
import { usePromptInputAttachments } from './usePromptInputAttachments'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  data: FileUIPart & { id: string }
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const attachments = usePromptInputAttachments()

const filename = props.data.filename || ''

const mediaType
  = props.data.mediaType?.startsWith('image/') && props.data.url ? 'image' : 'file'
const isImage = mediaType === 'image'

const attachmentLabel = filename || (isImage ? 'Image' : 'Attachment')

function handleRemove(e: Event) {
  e.stopPropagation()
  attachments.remove(props.data.id)
}

const { data, class: _, ...restProps } = props
</script>

<template>
  <PromptInputHoverCard>
    <HoverCardTrigger as-child>
      <div
        :key="props.data.id"
        :class="cn(
          'group relative flex h-8 cursor-pointer select-none items-center gap-1.5 rounded-md border border-border px-1.5 font-medium text-sm transition-all hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
          props.class,
        )"
        v-bind="restProps"
      >
        <div class="relative size-5 shrink-0">
          <div
            class="absolute inset-0 flex size-5 items-center justify-center overflow-hidden rounded bg-background transition-opacity group-hover:opacity-0"
          >
            <img
              v-if="isImage"
              :alt="filename || 'attachment'"
              class="size-5 object-cover"
              :height="20"
              :src="props.data.url"
              :width="20"
            >
            <div
              v-else
              class="flex size-5 items-center justify-center text-muted-foreground"
            >
              <PaperclipIcon class="size-3" />
            </div>
          </div>
          <Button
            aria-label="Remove attachment"
            class="absolute inset-0 size-5 cursor-pointer rounded p-0 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 [&>svg]:size-2.5"
            type="button"
            variant="ghost"
            @click="handleRemove"
          >
            <XIcon />
            <span class="sr-only">Remove</span>
          </Button>
        </div>

        <span class="flex-1 truncate">{{ attachmentLabel }}</span>
      </div>
    </HoverCardTrigger>
    <PromptInputHoverCardContent class="w-auto p-2">
      <div class="w-auto space-y-3">
        <div
          v-if="isImage"
          class="flex max-h-96 w-96 items-center justify-center overflow-hidden rounded-md border"
        >
          <img
            :alt="filename || 'attachment preview'"
            class="max-h-full max-w-full object-contain"
            :height="384"
            :src="props.data.url"
            :width="448"
          >
        </div>
        <div class="flex items-center gap-2.5">
          <div class="min-w-0 flex-1 space-y-1 px-0.5">
            <h4 class="truncate font-semibold text-sm leading-none">
              {{ filename || (isImage ? 'Image' : 'Attachment') }}
            </h4>
            <p
              v-if="props.data.mediaType"
              class="truncate font-mono text-muted-foreground text-xs"
            >
              {{ props.data.mediaType }}
            </p>
          </div>
        </div>
      </div>
    </PromptInputHoverCardContent>
  </PromptInputHoverCard>
</template>
