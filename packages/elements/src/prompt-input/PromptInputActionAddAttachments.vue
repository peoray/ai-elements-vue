<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DropdownMenuItem } from '@repo/shadcn-vue/components/ui/dropdown-menu'
import { ImageIcon } from 'lucide-vue-next'
import { usePromptInputAttachments } from './usePromptInputAttachments'

type DropdownMenuItemProps = InstanceType<typeof DropdownMenuItem>['$props']

interface Props extends /* @vue-ignore */ DropdownMenuItemProps {
  class?: HTMLAttributes['class']
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Add photos or files',
})

const attachments = usePromptInputAttachments()

function handleSelect(e: Event) {
  e.preventDefault()
  attachments.openFileDialog()
}

const { label, class: _, ...restProps } = props
</script>

<template>
  <DropdownMenuItem
    :class="props.class"
    v-bind="restProps"
    @select="handleSelect"
  >
    <ImageIcon class="mr-2 size-4" /> {{ props.label }}
  </DropdownMenuItem>
</template>
