import type { ReactNode } from 'react'

type Props = {
  /** `narrow` for single-column pages (forms, records); `wide` for workspaces and dashboards. */
  width?: 'narrow' | 'wide'
  eyebrow?: string
  title?: string
  description?: ReactNode
  /** Buttons or links shown beside the title. */
  actions?: ReactNode
  children: ReactNode
}

/** Shared page frame so every signed-in page has the same width, spacing and header. */
export function PageLayout({
  width = 'narrow',
  eyebrow,
  title,
  description,
  actions,
  children,
}: Props) {
  return (
    <main id="main" className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-8 sm:py-10">
      <div className={`mx-auto ${width === 'wide' ? 'max-w-6xl' : 'max-w-3xl'}`}>
        {title && (
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              {eyebrow && (
                <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
                  {eyebrow}
                </p>
              )}
              <h1 className="mt-1 text-3xl font-bold">{title}</h1>
              {description && <p className="mt-2 text-slate-600">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </main>
  )
}
