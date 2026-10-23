import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { api } from '../lib/api';
import { Card, StatusPill, UrgencyDot } from '../components/Atoms';
import { COLORS, fmtDate } from '../lib/tokens';
import { getSocket } from '../lib/socket';

const COLUMNS = [
  { id: 'RECUE', label: 'Reçue' },
  { id: 'EN_COURS_DESIGN', label: 'Design' },
  { id: 'VALIDATION_CLIENT', label: 'Validation' },
  { id: 'EN_PRODUCTION', label: 'Production' },
  { id: 'EN_FINITION', label: 'Finition' },
  { id: 'PRETE', label: 'Prête' },
  { id: 'LIVREE', label: 'Livrée' },
];

export function KanbanPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const navigate = useNavigate();

  const load = () => api.get('/orders?limit=200').then((r) => setOrders(r.data.orders));

  useEffect(() => {
    load();
    const sock = getSocket();
    const fn = () => load();
    sock.on('order.status_changed', fn);
    sock.on('order.created', fn);
    sock.on('order.updated', fn);
    return () => {
      sock.off('order.status_changed', fn);
      sock.off('order.created', fn);
      sock.off('order.updated', fn);
    };
  }, []);

  const onDragEnd = async (e: DragEndEvent) => {
    if (!e.over) return;
    const orderId = String(e.active.id);
    const newStatus = String(e.over.id);
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === newStatus) return;
    // Optimistic update
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    try {
      await api.post(`/orders/${orderId}/status`, { status: newStatus });
    } catch {
      load();
    }
  };

  return (
    <div className="p-4">
      <DndContext onDragEnd={onDragEnd}>
        <div className="flex gap-3 overflow-auto pb-4" style={{ height: 'calc(100vh - 132px)' }}>
          {COLUMNS.map((col) => {
            const items = orders.filter((o) => o.status === col.id);
            return <Column key={col.id} col={col} items={items} onClick={(id) => navigate(`/orders/${id}`)} />;
          })}
        </div>
      </DndContext>
    </div>
  );
}

function Column({ col, items, onClick }: { col: { id: string; label: string }; items: any[]; onClick: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  return (
    <div
      ref={setNodeRef}
      style={{
        flex: '0 0 280px', display: 'flex', flexDirection: 'column',
        background: isOver ? COLORS.primary + '0a' : 'transparent',
        borderRadius: 10, padding: 6, transition: 'background 100ms',
      }}
    >
      <div className="flex items-center justify-between" style={{ padding: '8px 10px' }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{col.label}</div>
        <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}>{items.length}</div>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {items.length === 0 && (
          <div style={{ padding: 16, fontSize: 12, color: COLORS.muted, textAlign: 'center', border: `1px dashed ${COLORS.border}`, borderRadius: 8 }}>
            Vide
          </div>
        )}
        {items.map((o) => <OrderCard key={o.id} order={o} onClick={() => onClick(o.id)} />)}
      </div>
    </div>
  );
}

function OrderCard({ order, onClick }: { order: any; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: order.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={(e) => { if (!isDragging) onClick(); }}
      style={{
        background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8,
        padding: 12, cursor: 'grab', userSelect: 'none',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.5 : 1,
        boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.15)' : 'none',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 11, fontWeight: 700, color: COLORS.primary }}>
          {order.ticketCode}
        </div>
        <UrgencyDot level={order.urgency} />
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>{order.customer?.fullName}</div>
      <div style={{ fontSize: 11, color: COLORS.muted, lineHeight: 1.35, maxHeight: 32, overflow: 'hidden' }}>
        {order.description.slice(0, 80)}
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <div style={{ fontSize: 11, color: COLORS.muted }}>{fmtDate(order.deliveryDate)}</div>
        {order.assignedTo && (
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#fff',
            background: 'linear-gradient(135deg,#f59e0b,#dc2626)',
            width: 22, height: 22, borderRadius: 999,
          }} className="flex items-center justify-center">
            {order.assignedTo.firstName[0]}{order.assignedTo.lastName[0]}
          </div>
        )}
      </div>
    </div>
  );
}
