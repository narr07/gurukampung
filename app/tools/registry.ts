import type { Component } from 'vue'

// Seluruh 31 alat berada langsung di app/tools/<slug>.vue agar nama berkas jelas di tab editor
const modules = import.meta.glob<{ default: Component }>('./*.vue')

const loaders = new Map<string, () => Promise<{ default: Component }>>(
  Object.entries(modules).map(([path, load]) => {
    const file = path.split('/').pop()!
    return [file.replace(/\.vue$/, ''), load]
  })
)

export function isToolAvailable(slug: string) {
  return loaders.has(slug)
}

export function loadTool(slug: string) {
  return loaders.get(slug)
}
