import { projects, sections } from '@/data/content'

/** Where the visitor is: a section, and inside Projects which project / capture. */
export type Pos = { section: number; project: number; shot: number }

export const PROJECTS = sections.findIndex((s) => s.id === 'proyectos')
export const LAST = sections.length - 1

const lastShot = (p: number) => projects[p].shots.length - 1

/** Position one scroll step away (d = ±1), or null at either end. */
export function stepPos(pos: Pos, d: 1 | -1): Pos | null {
  if (pos.section === PROJECTS) {
    const shot = pos.shot + d
    if (shot >= 0 && shot <= lastShot(pos.project)) return { ...pos, shot }
    const project = pos.project + d
    if (project >= 0 && project < projects.length)
      return { section: PROJECTS, project, shot: d > 0 ? 0 : lastShot(project) }
  }
  const section = pos.section + d
  if (section < 0 || section > LAST) return null
  if (section === PROJECTS) {
    const project = d > 0 ? 0 : projects.length - 1
    return { section, project, shot: d > 0 ? 0 : lastShot(project) }
  }
  return { section, project: 0, shot: 0 }
}

/** -1 / 0 / 1 depending on whether `b` comes before, at or after `a`. */
export function compare(a: Pos, b: Pos) {
  const ka = [a.section, a.project, a.shot]
  const kb = [b.section, b.project, b.shot]
  for (let i = 0; i < 3; i++) if (ka[i] !== kb[i]) return kb[i] > ka[i] ? 1 : -1
  return 0
}

export function hashOf(pos: Pos) {
  const id = sections[pos.section].id
  return pos.section === PROJECTS ? `#${id}/${projects[pos.project].id}` : `#${id}`
}

export function posFromHash(hash = window.location.hash): Pos {
  const [sid, pid] = hash.replace(/^#/, '').split('/')
  const section = Math.max(0, sections.findIndex((s) => s.id === sid))
  const project = section === PROJECTS ? Math.max(0, projects.findIndex((p) => p.id === pid)) : 0
  return { section, project, shot: 0 }
}

/** Menu entries: every section, with the projects nested under Projects. */
const pad = (n: number) => String(n).padStart(2, '0')
export const menuEntries: { label: string; pos: Pos }[] = sections.flatMap((s, i) => {
  const own = { label: `${pad(i)} ${s.label}`, pos: { section: i, project: 0, shot: 0 } }
  if (i !== PROJECTS) return [own]
  return [
    own,
    ...projects.map((p, j) => ({
      label: `  > ${p.name}`,
      pos: { section: i, project: j, shot: 0 },
    })),
  ]
})

export function menuIndexOf(pos: Pos) {
  if (pos.section === PROJECTS)
    return menuEntries.findIndex((e) => e.pos.section === PROJECTS && e.pos.project === pos.project && e.label.includes('>'))
  return menuEntries.findIndex((e) => e.pos.section === pos.section)
}
