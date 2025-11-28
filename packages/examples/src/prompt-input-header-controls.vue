<script setup lang="ts">
import { usePromptInputController } from '@repo/elements/prompt-input'
import { Button } from '@repo/shadcn-vue/components/ui/button'
import { ButtonGroup } from '@repo/shadcn-vue/components/ui/button-group'

const controller = usePromptInputController()
</script>

<template>
  <header class="mt-8 flex items-center justify-between">
    <p class="text-sm">
      Header Controls via
      <code class="rounded-md bg-muted p-1 font-bold">
        PromptInputProvider
      </code>
    </p>
    <ButtonGroup>
      <Button
        size="sm"
        type="button"
        variant="outline"
        @click="controller.textInput.clear()"
      >
        Clear input
      </Button>
      <Button
        size="sm"
        type="button"
        variant="outline"
        @click="controller.textInput.setInput('Inserted via PromptInputProvider')"
      >
        Set input
      </Button>
      <Button
        size="sm"
        type="button"
        variant="outline"
        @click="controller.attachments.clear()"
      >
        Clear attachments
      </Button>
    </ButtonGroup>
  </header>
</template>
