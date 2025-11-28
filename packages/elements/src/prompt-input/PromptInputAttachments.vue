<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@repo/shadcn-vue/lib/utils'
import { usePromptInputAttachments } from './usePromptInputAttachments'

interface Props extends /* @vue-ignore */ HTMLAttributes {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const attachments = usePromptInputAttachments()

const { class: _, ...restProps } = props
</script>

<template>
  <div
    v-if="attachments.files.length > 0"
    :class="cn('flex flex-wrap items-center gap-2 p-3 w-full', props.class)"
    v-bind="restProps"
  >
    <slot
      v-for="file in attachments.files"
      :key="file.id"
      :attachment="file"
    />
  </div>
</template>
