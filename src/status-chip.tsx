import type { ReactNode } from 'react';
import { Check, CircleHelp, TriangleAlert } from 'lucide-react';

export type StatusVariant = 'missing' | 'needs-checking' | 'found';

export function StatusChip({ variant, children }: { variant: StatusVariant; children?: ReactNode }) {
  const Icon = variant === 'found' ? Check : variant === 'missing' ? CircleHelp : TriangleAlert;
  return <span className={`status-chip status-${variant}`}>
    <Icon size={20} aria-hidden="true"/>
    <span>{children ?? (variant === 'missing' ? 'Missing' : variant === 'found' ? 'Found' : 'Needs checking')}</span>
  </span>;
}

export function StatusValue({ value }: { value: string }) {
  return value.startsWith('Not recorded') ? <StatusChip variant="missing">{value}</StatusChip>
    : value === 'Needs checking' ? <StatusChip variant="needs-checking">{value}</StatusChip> : <>{value}</>;
}
