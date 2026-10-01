interface ToolHeaderProps {
  title: string
  description: string
  children?: React.ReactNode
}

export default function ToolHeader({
  title,
  description,
  children,
}: ToolHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">{title}</h1>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </header>
  )
}
