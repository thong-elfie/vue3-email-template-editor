import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import EmailEditor from '../EmailEditor.vue'
import type { EmailEditorAPI, EmailNode, BlockDefinition } from '../types'
import { STATIC_BLOCKS } from '../blocks/block-definitions'
import { STARTER_TEMPLATES } from '../blocks/starter-templates'
import { walkTree, findNode } from '../utils/tree'

// Mock mjml-browser — echoes MJML inside fake HTML so we can assert on output.
vi.mock('mjml-browser', () => ({
  default: (mjml: string) => ({
    html: '<html><body>' + mjml + '</body></html>',
    errors: [],
  }),
}))

// Deterministic-ish IDs
vi.mock('nanoid', () => ({
  nanoid: () => 'test-id-' + Math.random().toString(36).slice(2, 10),
}))

function mountEditor(props: Record<string, unknown> = {}) {
  const wrapper = shallowMount(EmailEditor, {
    props: { modelValue: '', ...props },
  })
  return { wrapper, api: wrapper.vm as unknown as EmailEditorAPI }
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 60))

function firstNodeOfType(root: EmailNode, type: string): EmailNode | null {
  let match: EmailNode | null = null
  walkTree(root, (node) => {
    if (!match && node.type === type) match = node
  })
  return match
}

describe('EmailEditor — full workflow (load → edit → undo → export)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads a starter template, edits an attribute, undoes it, and exports', async () => {
    const { api } = mountEditor()
    await flush()

    // ── Load template ──
    const newsletter = STARTER_TEMPLATES.find((t) => t.id !== STARTER_TEMPLATES[0].id) ?? STARTER_TEMPLATES[0]
    api.loadTemplate(newsletter.factory())

    const textNode = firstNodeOfType(api.getDocument().body, 'mj-text')
    expect(textNode).not.toBeNull()

    // ── Edit ──
    api.updateNodeAttribute(textNode!.id, 'color', '#123456')
    expect(api.getMjml()).toContain('#123456')
    expect(api.canUndo()).toBe(true)

    // ── Undo ──
    api.undo()
    const reverted = findNode(api.getDocument().body, textNode!.id)
    expect(reverted?.attributes.color).not.toBe('#123456')
    expect(api.getMjml()).not.toContain('#123456')

    // ── Export ──
    const mjml = api.getMjml()
    expect(mjml).toContain('<mjml>')
    expect(mjml).toContain('</mjml>')

    const html = api.getHtml()
    expect(typeof html).toBe('string')

    const designJson = api.getDesignJson() as { _editor: string; _version: number; document: unknown }
    expect(designJson._editor).toBe('mesagoo-email-editor')
    expect(designJson._version).toBe(1)
    expect(designJson.document).toBeDefined()
  })

  it('supports redo after an undo', async () => {
    const { api } = mountEditor()
    await flush()

    const textNode = firstNodeOfType(api.getDocument().body, 'mj-text')
    expect(textNode).not.toBeNull()

    api.updateNodeAttribute(textNode!.id, 'color', '#abcdef')
    expect(api.getMjml()).toContain('#abcdef')

    api.undo()
    expect(api.getMjml()).not.toContain('#abcdef')

    api.redo()
    expect(api.canRedo()).toBe(false)
    expect(api.getMjml()).toContain('#abcdef')
  })
})

describe('EmailEditor — drag & drop (add → position → duplicate → delete)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds a block, inserts at a specific index, duplicates and deletes', async () => {
    const { api } = mountEditor()
    await flush()

    const column = firstNodeOfType(api.getDocument().body, 'mj-column')
    expect(column).not.toBeNull()
    const columnId = column!.id
    const initialCount = findNode(api.getDocument().body, columnId)!.children.length

    const textBlock = STATIC_BLOCKS.find((b) => b.id === 'content-text') as BlockDefinition
    expect(textBlock).toBeDefined()

    // ── Add (drop) at index 0 ──
    const firstId = api.insertBlock(textBlock, columnId, 0)
    expect(firstId).not.toBeNull()
    let col = findNode(api.getDocument().body, columnId)!
    expect(col.children.length).toBe(initialCount + 1)
    expect(col.children[0].id).toBe(firstId)

    // ── Position: insert another block at the end ──
    const secondId = api.insertBlock(textBlock, columnId, 999)
    col = findNode(api.getDocument().body, columnId)!
    expect(col.children.length).toBe(initialCount + 2)
    expect(col.children[col.children.length - 1].id).toBe(secondId)

    // ── Duplicate ──
    api.duplicateNode(firstId!)
    col = findNode(api.getDocument().body, columnId)!
    expect(col.children.length).toBe(initialCount + 3)

    // ── Delete ──
    api.deleteNode(firstId!)
    expect(findNode(api.getDocument().body, firstId!)).toBeNull()
  })
})
