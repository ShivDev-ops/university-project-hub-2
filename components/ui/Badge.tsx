type BadgeVariant = 'skill' | 'status' | 'score'

export function Badge({ variant, text }: { variant: BadgeVariant; text: string }) {
  const styles = {
    skill: 'bg-slate-700 text-slate-200 text-xs px-2 py-0.5 rounded-full',
    status: 'bg-blue-900 text-blue-300 text-xs px-2 py-0.5 rounded-full',
    score: 'text-xs px-2 py-0.5 rounded-full',
  }
  return <span className={styles[variant]}>{text}</span>
}