<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { DropdownMenuItem } from '@repo/shadcn-vue/components/ui/dropdown-menu'
import { cn } from '@repo/shadcn-vue/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <DropdownMenuItem :class="cn(props.class)">
    <slot />
  </DropdownMenuItem>
</template>
