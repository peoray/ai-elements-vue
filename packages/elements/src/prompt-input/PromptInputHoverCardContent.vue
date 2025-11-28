<script setup lang="ts">
import { HoverCardContent } from '@repo/shadcn-vue/components/ui/hover-card'

type PromptInputHoverCardContentProps = InstanceType<typeof HoverCardContent>['$props']

interface Props extends /* @vue-ignore */ PromptInputHoverCardContentProps {}

const props = withDefaults(defineProps<Props>(), {
  align: 'start',
})
</script>

<template>
  <HoverCardContent v-bind="props">
    <slot />
  </HoverCardContent>
</template>
