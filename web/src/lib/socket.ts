import { api } from './api';

// Temps réel par rafraîchissement automatique (pas de WebSocket : l'hébergement Vercel n'en a pas).
// Même interface que socket.io (on/off) : le reste de l'interface n'a pas changé.
// Le poste demande toutes les 4 s « quoi de neuf depuis l'évènement n° X ? » (GET /api/events).
type Handler = (payload: any) => void;

const POLL_MS = 4000;

class EventPoller {
  private handlers = new Map<string, Set<Handler>>();
  private cursor: number | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private busy = false;

  on(type: string, h: Handler) {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(h);
    this.start();
    return this;
  }

  off(type: string, h: Handler) {
    this.handlers.get(type)?.delete(h);
    return this;
  }

  private start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), POLL_MS);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.tick(); });
    this.tick();
  }

  private async tick() {
    // Pas de requête onglet caché, hors connexion, ou si un appel est déjà en cours
    if (document.hidden || this.busy || !localStorage.getItem('elbenna.token')) return;
    this.busy = true;
    try {
      const r = await api.get('/events', { params: this.cursor === null ? {} : { after: this.cursor } });
      const first = this.cursor === null;
      this.cursor = r.data.last;
      if (!first) for (const e of r.data.events) this.handlers.get(e.type)?.forEach((h) => h(e.payload));
    } catch {
      /* réseau coupé ou session expirée : on réessaiera au prochain tour */
    } finally {
      this.busy = false;
    }
  }
}

let poller: EventPoller | null = null;
export function getSocket(): EventPoller {
  return (poller ??= new EventPoller());
}
