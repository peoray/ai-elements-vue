<script setup lang="ts">
import { HoverCard } from '@repo/shadcn-vue/components/ui/hover-card'

type PromptInputHoverCardProps = InstanceType<typeof HoverCard>['$props']

interface Props extends /* @vue-ignore */ PromptInputHoverCardProps {}

const props = withDefaults(defineProps<Props>(), {
  openDelay: 0,
  closeDelay: 0,
})
</script>

<template>
  <HoverCard v-bind="props">
    <slot />
  </HoverCard>
</template>
