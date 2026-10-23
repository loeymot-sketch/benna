// « Pour moi » : ce qui attend une action de ma part = messages directs, messages à mon rôle
// ou à ma boutique (tant qu'ils ne sont pas clôturés), hors ceux que j'ai écrits moi-même.
// Les annonces à tous (scope ALL) restent sur le mur, sans compter dans le badge.
export function toActWhere(u: { sub: string; role: string; shopId: string | null }) {
  return {
    parentId: null,
    status: { in: ['OPEN', 'SEEN'] },
    authorId: { not: u.sub },
    OR: [
      { recipientUserId: u.sub },
      { scope: 'ROLE', recipientRole: u.role },
      ...(u.shopId ? [{ scope: 'SHOP', recipientShopId: u.shopId }] : []),
    ],
  } as any;
}
