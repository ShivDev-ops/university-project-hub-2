// components/ScoreBadge.tsx

export function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 600 ? 'bg-emerald-900 text-emerald-300' :
    score >= 400 ? 'bg-yellow-900 text-yellow-300' :
                   'bg-rose-900 text-rose-300'

  const label =
    score >= 600 ? 'Excellent Reputation' :
    score >= 400 ? 'Good Standing' :
                   'Needs Improvement'

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}
      title={label}
    >
      {score}
    </span>
  )
}