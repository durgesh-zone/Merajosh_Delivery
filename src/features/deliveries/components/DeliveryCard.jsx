import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Package, ChevronRight, Banknote, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatPrice, formatDateTime } from '@/lib/format';
import { DELIVERY_STATUS } from '../statusMeta';

export function DeliveryCard({ item, index = 0 }) {
  const o = item.order;
  if (!o) return null;
  const meta = DELIVERY_STATUS[item.status] || { label: item.status, tone: 'slate' };
  const units = o.items.reduce((s, i) => s + i.quantity, 0);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index, 6) * 0.04 }}>
      <Link to={`/orders/${o._id}`} className="card block p-4 active:scale-[0.99]">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-sm font-bold">{o.orderNumber}</span>
          <Badge tone={meta.tone} dot>{meta.label}</Badge>
        </div>
        <p className="mt-3 font-semibold">{o.customer.name}</p>
        <p className="mt-1 flex gap-1.5 text-sm text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span className="line-clamp-2">{[o.address?.line1, o.address?.line2, o.address?.city, o.address?.pincode].filter(Boolean).join(', ')}</span></p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-sm dark:border-slate-800">
          <span className="flex items-center gap-1.5 text-slate-500"><Package className="h-4 w-4" /> {units} item{units === 1 ? '' : 's'}</span>
          {o.amountToCollect > 0 ? (
            <span className="flex items-center gap-1.5 font-bold text-amber-600"><Banknote className="h-4 w-4" /> Collect {formatPrice(o.amountToCollect)}</span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-600"><CreditCard className="h-4 w-4" /> Prepaid</span>
          )}
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </div>
        {item.completedAt && <p className="mt-2 text-xs text-slate-400">{item.status === 'delivered' ? 'Delivered' : 'Closed'} {formatDateTime(item.completedAt)}{item.failReason ? ` · ${item.failReason}` : ''}</p>}
      </Link>
    </motion.div>
  );
}
