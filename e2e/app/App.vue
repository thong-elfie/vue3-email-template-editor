<script setup lang="ts">
import { ref, watch } from 'vue'
import { EmailEditor } from '@/index'
import type { EmailEditorAPI, EmailNode } from '@/types'
import { STATIC_BLOCKS } from '@/blocks/block-definitions'
import { STARTER_TEMPLATES } from '@/blocks/starter-templates'

const editor = ref<EmailEditorAPI | null>(null)
const mjml = ref('')
const html = ref('')
const lastInsertedId = ref<string | null>(null)

// Counts derived from the LIVE document (not the debounced emit), so they
// reflect history operations (undo/redo) which don't trigger re-emission.
const sectionCount = ref(0)
const textCount = ref(0)

function walk(root: EmailNode, fn: (n: EmailNode) => void) {
  fn(root)
  root.children.forEach((c) => walk(c, fn))
}

function refreshCounts() {
  const api = editor.value
  if (!api) return
  let sections = 0
  let texts = 0
  walk(api.getDocument().body, (n) => {
    if (n.type === 'mj-section') sections++
    if (n.type === 'mj-text') texts++
  })
  sectionCount.value = sections
  textCount.value = texts
}

function firstColumnId(): string | null {
  const api = editor.value
  if (!api) return null
  let id: string | null = null
  walk(api.getDocument().body, (n) => {
    if (!id && n.type === 'mj-column') id = n.id
  })
  return id
}

function addText() {
  const api = editor.value
  const columnId = firstColumnId()
  if (!api || !columnId) return
  const block = STATIC_BLOCKS.find((b) => b.id === 'content-text')
  if (!block) return
  lastInsertedId.value = api.insertBlock(block, columnId, 999)
  refreshCounts()
}

function editColor() {
  const api = editor.value
  if (!api || !lastInsertedId.value) return
  api.updateNodeAttribute(lastInsertedId.value, 'color', '#ff0000')
}

function loadTemplate() {
  const api = editor.value
  if (!api) return
  const tpl = STARTER_TEMPLATES.find((t) => t.id !== STARTER_TEMPLATES[0].id) ?? STARTER_TEMPLATES[0]
  api.loadTemplate(tpl.factory())
  refreshCounts()
}

function undo() {
  editor.value?.undo()
  refreshCounts()
}

// Initial emission (on editor ready) and any mutation-driven emit keeps counts
// in sync; history ops are handled explicitly in their handlers above.
watch(mjml, () => refreshCounts())
</script>

<template>
  <div class="harness">
    <div class="harness__controls">
      <button data-testid="add-text" @click="addText">Add Text</button>
      <button data-testid="edit-color" @click="editColor">Edit Color</button>
      <button data-testid="load-template" @click="loadTemplate">Load Template</button>
      <button data-testid="undo" @click="undo">Undo</button>
      <span data-testid="section-count">{{ sectionCount }}</span>
      <span data-testid="text-count">{{ textCount }}</span>
    </div>

    <div class="harness__editor">
      <EmailEditor
        ref="editor"
        v-model="mjml"
        @update:compiled-html="html = $event"
      />
    </div>

    <pre class="harness__out" data-testid="mjml-output">{{ mjml }}</pre>
    <pre class="harness__out" data-testid="html-output">{{ html }}</pre>
  </div>
</template>
