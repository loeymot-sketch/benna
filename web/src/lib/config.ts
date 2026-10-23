// Site et API sur le même domaine (dev, Docker) : VITE_API_URL vide -> adresses relatives.
// Site sur Vercel + API ailleurs : VITE_API_URL=https://mon-api.exemple.com (sans / final).
export const API_ORIGIN = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

// Adresse complète d'un chemin servi par l'API (/api/..., /uploads/...)
export const apiUrl = (path: string) => (/^https?:/.test(path) ? path : `${API_ORIGIN}${path}`);
