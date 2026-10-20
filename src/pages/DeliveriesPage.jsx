import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PackageCheck, RefreshCw, Inbox } from 'lucide-react';
import { deliveryApi } from '@/services/delivery.api';
import { DeliveryCard } from '@/features/deliveries/components/DeliveryCard';
import { EmptyState, Pagination, Skeleton, Tabs } from '@/components/ui';
import { formatPrice } from '@/lib/format';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const TABS = [
  { value: 'today', label: 'Today' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
];

export default function DeliveriesPage() {
  useDocumentTitle('Deliveries');
  const [tab, setTab] = useState('today');
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, refetch } = useQuery({ queryKey: ['deliveries', tab, page], queryFn: () => deliveryApi.list(tab, page), refetchInterval: 60_000 });
  const { data: summary } = useQuery({ queryKey: ['summary', 'today'], queryFn: () => deliveryApi.summary() });

  const items = data?.data || [];
  const cashDue = items.filter((i) => ['assigned', 'picked_up', 'out_for_delivery'].includes(i.status)).reduce((s, i) => s + (i.order?.amountToCollect || 0), 0);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {[['Pending', summary?.pending ?? '–', 'text-amber-600'], ['Delivered today', summary?.delivered ?? '–', 'text-emerald-600'], ['Cash today', summary ? formatPrice(summary.codCollected) : '–', 'text-slate-800 dark:text-slate-100']].map(([l, v, c]) => (
          <div key={l} className="card p-3 text-center"><p className={`text-xl font-extrabold ${c}`}>{v}</p><p className="text-[11px] font-medium text-slate-500">{l}</p></div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-2">
        <Tabs layoutId="rider-tabs" value={tab} onChange={(v) => { setTab(v); setPage(1); }} tabs={TABS} />
        <button onClick={() => refetch()} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Refresh"><RefreshCw className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} /></button>
      </div>
      {tab !== 'completed' && cashDue > 0 && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">💵 {formatPrice(cashDue)} cash to collect on these orders</p>}

      <div className="mt-4 space-y-3">
        {isLoading && [1, 2, 3].map((i) => <Skeleton key={i} className="h-40" />)}
        {!isLoading && !items.length && (
          <EmptyState icon={tab === 'completed' ? Inbox : PackageCheck} title={tab === 'completed' ? 'No completed deliveries yet' : 'All caught up!'} description={tab === 'completed' ? 'Delivered and failed orders show up here.' : 'New assignments will appear here automatically.'} />
        )}
        {items.map((item, i) => <DeliveryCard key={item._id} item={item} index={i} />)}
      </div>
      <Pagination className="mt-6" page={page} totalPages={data?.meta?.totalPages} onChange={setPage} />
    </div>
  );
}
