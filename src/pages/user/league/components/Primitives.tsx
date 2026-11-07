import { type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  icon,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-3.5">
        {icon && (
          <span className="league-section-icon mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-600 ring-1 ring-violet-200">
            {icon}
          </span>
        )}
        <div>
          {eyebrow && (
            <p className="league-section-eyebrow mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-500">
              {eyebrow}
            </p>
          )}
          <h2 className="league-section-title text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
          {description && (
            <p className="league-section-desc mt-1.5 max-w-2xl text-sm leading-relaxed text-slate-500">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="league-section-action shrink-0">{action}</div>}
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`league-card rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  color?: 'violet' | 'blue' | 'green' | 'amber' | 'slate' | 'red';
  className?: string;
}

const BADGE_COLORS: Record<NonNullable<BadgeProps['color']>, string> = {
  violet: 'bg-violet-100 text-violet-700 ring-violet-200',
  blue: 'bg-blue-100 text-blue-700 ring-blue-200',
  green: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  amber: 'bg-amber-100 text-amber-700 ring-amber-200',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
  red: 'bg-red-100 text-red-700 ring-red-200',
};

export function Badge({ children, color = 'violet', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE_COLORS[color]} ${className}`}
    >
      {children}
    </span>
  );
}

export function MoreLink({ children = 'Xem tất cả' }: { children?: string }) {
  return (
    <a
      href="#"
      className="more-link group inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700"
    >
      {children}
      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}
