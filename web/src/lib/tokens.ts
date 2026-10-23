// Design tokens — extracted from screens.jsx (COLORS object) and used inline
// where Tailwind doesn't help (badge gradients, status pills, urgency dots).
export const COLORS = {
  primary: '#1e3a8a',
  primaryDark: '#172554',
  accent: '#dc2626',
  accentSoft: '#fee2e2',
  bg: '#f7f7f5',
  panel: '#ffffff',
  border: '#e6e4df',
  borderStrong: '#d6d3cc',
  text: '#0f172a',
  muted: '#64748b',
  mutedSoft: '#94a3b8',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  urgNormal: '#16a34a',
  urgPriority: '#f59e0b',
  urgUrgent: '#dc2626',
  urgExpress: '#0f172a',
  stRecue: '#94a3b8',
  stEnCours: '#3b82f6',
  stValidation: '#a855f7',
  stProduction: '#f97316',
  stPrete: '#16a34a',
  stLivree: '#64748b',
};

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  RECUE: { label: 'Reçue', color: COLORS.stRecue },
  EN_ATTENTE: { label: 'En attente', color: COLORS.stRecue },
  EN_COURS_DESIGN: { label: 'Design', color: COLORS.stEnCours },
  VALIDATION_CLIENT: { label: 'Validation client', color: COLORS.stValidation },
  EN_PRODUCTION: { label: 'Production', color: COLORS.stProduction },
  EN_FINITION: { label: 'Finition', color: COLORS.stProduction },
  PRETE: { label: 'Prête', color: COLORS.stPrete },
  LIVREE: { label: 'Livrée', color: COLORS.stLivree },
  ANNULEE: { label: 'Annulée', color: COLORS.danger },
};

export const URGENCY_COLORS: Record<string, string> = {
  NORMAL: COLORS.urgNormal,
  PRIORITAIRE: COLORS.urgPriority,
  URGENT: COLORS.urgUrgent,
  EXPRESS: COLORS.urgExpress,
};

export const POST_TYPE_META: Record<string, { label: string; color: string; icon: string; example: string }> = {
  HANDOFF:        { label: 'Passation',    color: '#3b82f6', icon: '🔄', example: 'Je passe ce travail à X' },
  TASK:           { label: 'Tâche',        color: '#f59e0b', icon: '✅', example: 'Faire X avant Y' },
  ABSENCE_NOTE:   { label: 'Absence',      color: '#14b8a6', icon: '🌴', example: 'Je suis absent du JJ au JJ' },
  QUESTION:       { label: 'Question',     color: '#8b5cf6', icon: '❓', example: 'J\'ai besoin d\'une info' },
  ANNOUNCEMENT:   { label: 'Annonce',      color: '#dc2626', icon: '📢', example: 'Message à toute l\'équipe' },
  ALERT:          { label: 'Alerte',       color: '#ea580c', icon: '⚠️', example: 'Problème équipement / stock' },
  NOTE:           { label: 'Note',         color: '#64748b', icon: '📝', example: 'Remarque générale' },
  SHIFT_HANDOVER: { label: 'Passation shift', color: '#7c3aed', icon: '🗓️', example: 'État de fin de journée' },
};

export const fullName = (u: { firstName: string; lastName?: string | null }) => `${u.firstName} ${u.lastName ?? ''}`.trim();

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Responsable',
  RECEPTION: 'Réception',
  DESIGNER: 'Designer',
  PRODUCTION: 'Production',
  PHOTOGRAPHER: 'Photographe',
};

export function fmtTND(amount: number) {
  return amount.toLocaleString('fr-TN', { minimumFractionDigits: 0, maximumFractionDigits: 3 }) + ' TND';
}

export function fmtDate(d: string | Date) {
  const date = new Date(d);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function fmtDateTime(d: string | Date) {
  return new Date(d).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

export function timeAgo(d: string | Date) {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'à l\'instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `il y a ${days} j`;
  return fmtDate(d);
}

export function initials(firstName: string, lastName: string) {
  return (firstName?.[0] ?? '').toUpperCase() + (lastName?.[0] ?? '').toUpperCase();
}

// Format Tunisian phone numbers nicely: "+21628555123" → "+216 28 555 123"
export function fmtPhone(raw: string | null | undefined) {
  if (!raw) return '';
  const s = raw.replace(/\s+/g, '');
  if (s.startsWith('+216') && s.length === 12) {
    return `+216 ${s.slice(4, 6)} ${s.slice(6, 9)} ${s.slice(9)}`;
  }
  return raw;
}
