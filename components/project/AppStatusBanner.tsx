export function AppStatusBanner({ status }: { status: 'pending' | 'accepted' | 'rejected' }) {
  const config = {
    pending: {
      bg: 'rgba(251,191,36,0.08)',
      border: 'rgba(251,191,36,0.2)',
      color: '#fbbf24',
      icon: 'schedule',
      text: 'Your application is pending review',
    },
    accepted: {
      bg: 'rgba(52,211,153,0.08)',
      border: 'rgba(52,211,153,0.2)',
      color: '#34d399',
      icon: 'check_circle',
      text: 'Your application was accepted! Welcome to the team.',
    },
    rejected: {
      bg: 'rgba(251,113,133,0.08)',
      border: 'rgba(251,113,133,0.2)',
      color: '#fb7185',
      icon: 'cancel',
      text: 'Your application was not accepted this time.',
    },
  }

  const c = config[status]

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl"
      style={{background: c.bg, border:`1px solid ${c.border}`}}>
      <span className="material-symbols-outlined" style={{color: c.color, fontSize:'20px'}}>{c.icon}</span>
      <span style={{fontFamily:'DM Mono', fontSize:'12px', color: c.color}}>{c.text}</span>
    </div>
  )
}