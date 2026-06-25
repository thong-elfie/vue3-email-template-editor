# Roadmap — Dominate the email editor market

## Positioning

**The winning formula**: GrapesJS open-source + Unlayer features + Vue 3 DX

**Key message**: "Everything Unlayer charges $750/month for, included free."

## Competitive landscape

| | Price | Vue native | Open source | MJML | Custom blocks | Merge tags |
|---|---|---|---|---|---|---|
| **Us (current)** | Free | Yes | MIT | Yes | Yes (free) | Basic |
| **Unlayer** | $250-2000/mo | Wrapper | No | No | $750+/mo | $750+/mo |
| **Beefree** | Paid tiers | No | No | No | Paid | Paid |
| **GrapesJS** | Free | No | BSD | Plugin | Yes | Custom |

**Our current advantages**: native Vue 3, MJML, TypeScript, plugin system, 43 blocks, free
**Our current weaknesses**: basic DnD, no image upload, few templates, no docs site, no inline merge tags

---

## Sprint A — Stability & E2E tests (1 week)

*Goal: a solid foundation before adding features. Zero regression.*

### A.1 Component integration tests
- [x] `EmailEditor.spec.ts` — mount, expose API, plugins init
- [x] Full workflow test: load template -> edit -> undo -> export MJML/HTML/JSON
- [x] Drag & drop test: add block, reorder, delete

### A.2 E2E tests with Playwright
- [x] Set up Playwright with a minimal test app (Vue + EmailEditor)
- [x] Scenario: open editor -> add text block -> edit -> export HTML
- [x] Scenario: load template -> modify -> undo -> verify content
- [x] Scenario: mobile preview -> verify iframe width
- [x] GitHub Actions CI: typecheck + vitest + playwright on every PR

### A.3 Regression guards
- [x] Snapshot tests on MJML exports (starter templates)
- [x] Visual regression tests on composite blocks (screenshot comparisons)

---

## Sprint B — DX & Documentation (1 week)

*Goal: developers must be able to discover, understand, and integrate in < 10 minutes.*

### B.1 Documentation site (VitePress)
- [ ] Set up VitePress in `docs/`
- [ ] "Getting Started" guide with working copy-paste
- [ ] "Theming" guide with live preview
- [ ] "Plugins" guide with concrete examples
- [ ] Complete API reference (generated from types)
- [ ] Deploy to GitHub Pages or Netlify

### B.2 Interactive playground
- [ ] Live demo embedded in the docs (StackBlitz or iframe)
- [ ] Examples: basic, custom theme, custom plugin, FR labels
- [ ] "Edit on StackBlitz" link in the README

### B.3 Storybook (optional)
- [ ] Stories for each block (layout, content, composite)
- [ ] Stories for the theme system
- [ ] Stories for the property editors

---

## Sprint C — Image Upload & Asset Manager (1 week)

*Goal: the #1 missing feature. Without it, no serious production use.*

### C.1 Upload callback
- [ ] `onImageUpload: (file: File) => Promise<string>` prop on EmailEditor
- [ ] The consumer handles their own storage (S3, Cloudinary, etc.)
- [ ] UI: "Upload" button in the image property editor + drag & drop on the field
- [ ] Immediate preview with URL.createObjectURL during upload
- [ ] Error handling (max size, invalid format)

### C.2 Asset Manager
- [ ] `onBrowseAssets?: () => Promise<string>` prop — opens the consumer's picker
- [ ] Or `assets?: string[]` prop — list of URLs shown in a built-in picker
- [ ] Image gallery with search, preview, selection
- [ ] History of uploaded images (session-only or persistable via callback)

### C.3 Basic image editing
- [ ] Crop ratio presets (1:1, 16:9, 4:3)
- [ ] Resize with ratio constraint
- [ ] Required alt text (a11y)

---

## Sprint D — Advanced Drag & Drop (1-2 weeks)

*Goal: drag UX must match Unlayer. This is the "wow factor".*

### D.1 Ghost preview
- [ ] While dragging from the sidebar, show a translucent ghost of the block
- [ ] The ghost follows the cursor with an offset
- [ ] "Place" animation on drop

### D.2 Improved drop zones
- [ ] Clear visual indicators: blue line between blocks, zone highlight in columns
- [ ] "Snap" guides when approaching a drop zone
- [ ] Visual feedback when the drop is invalid (red zone)

### D.3 Drag from the canvas
- [ ] Reorder by drag & drop directly in the canvas (not just via Layers)
- [ ] Drag handle on hover (grip icon to the left of the block)
- [ ] Auto-scroll when dragging near the edges

### D.4 Drag between columns
- [ ] Move an element from one column to another by drag
- [ ] Resize columns by dragging the separator

---

## Sprint E — Merge Tags & Variables (1 week)

*Goal: killer feature. Unlayer charges $750/month. Us: free.*

### E.1 Merge tag system
- [ ] `mergeTags?: MergeTag[]` prop with `{ name: string, value: string, category?: string }`
- [ ] Ex: `[{ name: 'First name', value: '{{first_name}}', category: 'Contact' }]`
- [ ] Dropdown in the TipTap editor: typing `{{` triggers autocompletion
- [ ] Tags render as colored "chips" in the editor
- [ ] Non-editable inline, removable in one click
- [ ] Export: tags stay as `{{first_name}}` in the MJML/HTML

### E.2 Tags in properties
- [ ] URL, alt text, and src fields also accept merge tags
- [ ] Autocompletion in property inputs

### E.3 Preview with data
- [ ] `mergeTagsPreviewData?: Record<string, string>` prop
- [ ] Preview mode that replaces tags with real values
- [ ] Preview/edit toggle in the toolbar

---

## Sprint F — Pro Templates (1 week)

*Goal: a catalog that looks pro and creates desire.*

### F.1 Enriched starter templates
- [ ] 20+ categorized templates: Newsletter, Promotion, Transactional, Event, E-commerce, SaaS
- [ ] Each template uses quality placeholder images (not via.placeholder.com)
- [ ] Visual previews in the panel (generated thumbnail)

### F.2 Template management API
- [ ] `onSaveTemplate?: (template: EmailDesignJson, meta: TemplateMeta) => Promise<void>`
- [ ] `onLoadTemplates?: () => Promise<TemplateMeta[]>`
- [ ] The consumer handles storage, the editor handles the UI
- [ ] Save as template from the menu

### F.3 Reusable sections
- [ ] "Save as section" on any section
- [ ] "My sections" panel in the sidebar
- [ ] Drag & drop of saved sections

---

## Sprint G — Conditional content & AI hooks (1-2 weeks)

*Goal: features even Unlayer struggles to offer. Maximum differentiation.*

### G.1 Conditional blocks
- [ ] `<ConditionalBlock>` wrapper with a merge-tag condition
- [ ] Ex: "Show only if `{{plan}}` == 'premium'"
- [ ] UI: condition icon on the block, configuration panel
- [ ] Export: conditional HTML comments or ESP syntax

### G.2 AI integration hooks
- [ ] `aiProvider?: AiProvider` prop with interface:
  ```ts
  interface AiProvider {
    generateText: (prompt: string, context: string) => Promise<string>
    generateSubjectLine?: (emailContent: string) => Promise<string[]>
    improveText?: (text: string, instruction: string) => Promise<string>
  }
  ```
- [ ] "AI" button in the TipTap toolbar
- [ ] "Generate text", "Improve", "Shorten", "Translate"
- [ ] The consumer plugs in their own provider (OpenAI, Anthropic, etc.)

### G.3 Dark mode email preview
- [ ] "Dark mode preview" toggle in the toolbar
- [ ] Simulates dark mode rendering of email clients (Gmail, Apple Mail, Outlook)
- [ ] Visual aid for problematic colors in dark mode

---

## Sprint H — Performance & Bundle (1 week)

*Goal: faster than GrapesJS, smaller bundle than Unlayer.*

### H.1 Lazy loading
- [ ] Code-split composite blocks (loaded on demand)
- [ ] Code-split CodeMirror (done) and TipTap
- [ ] Measure the bundle: target < 200KB gzip for the core

### H.2 Virtual scrolling
- [ ] Virtualize the block list when > 50 blocks (with plugins)
- [ ] Virtualize layers for large documents

### H.3 Canvas performance
- [ ] Debounce the MJML re-render (already 300ms, verify)
- [ ] Optimize Vue re-renders with `shallowRef` or `markRaw` where possible
- [ ] Benchmark: render time of a 50-section document

---

## Sprint I — ESP Integrations (1 week)

*Goal: a unique advantage — pre-configured export for each ESP.*

### I.1 Export presets
- [ ] `exportForMailchimp()` — `*|FNAME|*` merge tags, compatible format
- [ ] `exportForSendGrid()` — `{{first_name}}` handlebars
- [ ] `exportForAWS_SES()` — template variables
- [ ] `exportForBrevo()` — `{{ contact.FIRSTNAME }}` merge tags
- [ ] Each preset maps merge tags + applies the right HTML constraints

### I.2 ESP documentation
- [ ] Per-ESP integration guide in the VitePress docs
- [ ] Working copy-paste examples

---

## Sprint J — Community & Adoption (ongoing)

### J.1 Visibility
- [ ] "How we built a free Unlayer alternative" article on dev.to
- [ ] Posts on r/vuejs, HackerNews, Product Hunt
- [ ] "Made with Vue" + "Built on MJML" badges in the README
- [ ] Detailed comparison in the docs (vs Unlayer, vs GrapesJS)
- [ ] Online demo accessible without installation

### J.2 Contribution
- [ ] CONTRIBUTING.md with a dev guide
- [ ] Tagged "good first issue" issues
- [ ] Issue templates (bug report, feature request)
- [ ] Discord or GitHub Discussions

### J.3 Plugin ecosystem
- [ ] Official plugin: `vue3-email-template-editor-plugin-ai`
- [ ] Official plugin: `vue3-email-template-editor-plugin-unsplash` (free images)
- [ ] "Create your own plugin" guide in the docs
- [ ] Registry of community plugins

---

## Priority order

```
Sprint A (Stability)      ← foundation, non-negotiable
  |
Sprint B (Documentation)  ← adoption, discovery
  |
Sprint C (Image Upload)   ← blocker #1 for prod use
  |
Sprint D (Advanced DnD)   ← wow factor, competitive UX
  |
Sprint E (Merge Tags)     ← free killer feature vs $750/mo
  |
Sprint F (Pro Templates)  ← catalog that looks pro
  |
Sprint G (AI + Conditional) ← unique differentiation
  |
Sprint H (Performance)    ← scalability
  |
Sprint I (Integrations)   ← enterprise adoption
  |
Sprint J (Community)      ← organic growth
```

## Success metrics

| Metric | 3 months | 6 months | 12 months |
|---|---|---|---|
| npm weekly downloads | 500 | 2,000 | 5,000+ |
| GitHub stars | 200 | 1,000 | 3,000+ |
| Included templates | 20 | 50 | 100+ |
| Official plugins | 2 | 5 | 10+ |
| Test coverage | 80% | 90% | 95% |
| Lighthouse a11y | 90+ | 95+ | 98+ |
