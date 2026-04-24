import ReactMarkdown from 'react-markdown'
interface MarkdownViewProps {
content: string
}
export function MarkdownView({ content }: MarkdownViewProps) {
return (
<div
className="prose prose-invert max-w-none"
style={{
color: '#c2c6d6',
fontFamily: 'Manrope',
fontSize: '15px',
lineHeight: 1.8,
}}
>
<ReactMarkdown
components={{
h1: ({ children }) => (
<h1 style={{ fontFamily: 'Syne', color: '#dee1f7', fontSize: '24px', fontWeight: 800 }}>
{children}
</h1>
),
h2: ({ children }) => (
<h2 style={{ fontFamily: 'Syne', color: '#dee1f7', fontSize: '20px', fontWeight: 700 }}>
{children}
</h2>
),
h3: ({ children }) => (
<h3 style={{ fontFamily: 'Syne', color: '#dee1f7', fontSize: '16px', fontWeight: 700 }}>
{children}
</h3>
),
code: ({ children }) => (
<code style={{
background: '#25293a', padding: '2px 6px', borderRadius: '4px',
fontFamily: 'DM Mono', fontSize: '13px', color: '#d0bcff',
}}>
{children}
</code>
),
a: ({ href, children }) => (
<a href={href} style={{ color: '#adc6ff' }} target="_blank" rel="noopener noreferrer">
{children}
</a>
),
}}
>
{content}
</ReactMarkdown>
</div>
)
}
