export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="text-4xl mb-4">{icon}</div>}
      <h3 className="text-slate-200 text-lg font-semibold mb-1">{title}</h3>
      {description && <p className="text-slate-400 text-sm mb-4">{description}</p>}
      {action}
    </div>
  )
}