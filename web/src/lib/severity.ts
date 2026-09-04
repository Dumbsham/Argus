export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'SUSPICIOUS' | 'ELEVATED' | 'NORMAL' | 'INFO';

export function normalizeSeverity(raw: string): { label: string; color: string; bg: string } {
  const upper = raw.toUpperCase();
  
  if (upper.includes('CRITICAL')) {
    return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500' };
  }
  if (upper.includes('HIGH')) {
    return { label: 'HIGH', color: 'text-orange-500', bg: 'bg-orange-500' };
  }
  if (upper.includes('SUSPICIOUS')) {
    return { label: 'SUSPICIOUS', color: 'text-yellow-400', bg: 'bg-yellow-400' };
  }
  if (upper.includes('ELEVATED')) {
    return { label: 'ELEVATED', color: 'text-yellow-400', bg: 'bg-yellow-400' };
  }
  if (upper.includes('NORMAL')) {
    return { label: 'NORMAL', color: 'text-emerald-500', bg: 'bg-emerald-500' };
  }
  return { label: 'INFO', color: 'text-blue-500', bg: 'bg-blue-500' };
}
