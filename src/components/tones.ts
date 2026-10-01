export type Tone = 'added' | 'removed' | 'changed' | 'moved' | 'success' | 'danger'

const TONE_CLASSES: Record<Tone, string> = {
  added: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  removed: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
  changed: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  moved: 'border-sky-500/30 bg-sky-500/10 text-sky-700',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  danger: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
}

export const toneClass = (tone: Tone): string => TONE_CLASSES[tone]
