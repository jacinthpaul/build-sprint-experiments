import { Car, HeartPulse, House, Plane, Shield, ShieldCheck, Umbrella } from 'lucide-react';

export function PolicyIcon({ type }: { type: string }) {
  const Icon = type === 'Motor insurance' ? Car : type === 'Health insurance' ? HeartPulse
    : type === 'Home insurance' ? House : type === 'Travel insurance' ? Plane
    : type === 'Personal accident insurance' ? ShieldCheck : type === 'Life insurance' ? Umbrella : Shield;
  return <span className="policy-type-icon"><Icon size={24} aria-hidden="true"/></span>;
}
