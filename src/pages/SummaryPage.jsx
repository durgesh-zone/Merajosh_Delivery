import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Banknote, Clock, Trophy } from 'lucide-react';
import { deliveryApi } from '@/services/delivery.api';
import { formatPrice } from '@/lib/format';
import { Button, Input, Skeleton } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const today = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};

export default function SummaryPage() {
  useDocumentTitle('Summary');
  const [date, setDate] = useState(today());
  // Render on data presence (not isLoading): a paused/failed query has no data while isLoading is false.
  const { data: s, isError, refetch, isFetching } = useQuery({ queryKey: ['summary', date], queryFn: () => deliveryApi.summary(date) });
  const max = Math.max(1, ...(s?.last7Days || []).map((d) => d.delivered));

  // Fill the last 7 calendar days so empty days still show a bar.
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    const key = d.toISOString().slice(0, 10);
    return { key, label: new Date(`${key}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short' }), ...(s?.last7Days?.find((x) => x.date === key) || { delivered: 0, cod: 0 }) };
  });

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-xl font-extrabold">Daily summary</h1>
        <Input type="date" aria-label="Date" max={today()} value={date} onChange={(e) => setDate(e.target.value || today())} className="w-44" />
      </div>
      {!s && isError && (
        <div className="card p-5 text-center">
          <p className="font-semibold">Couldn't load your summary</p>
          <p className="mt-1 text-sm text-slate-500">Check your connection and try again.</p>
          <Button className="mt-4" variant="success" loading={isFetching} onClick={() => refetch()}>Retry</Button>
        </div>
      )}
      {!s ? (!isError && <Skeleton className="h-44" />) : (
        <div className="grid grid-cols-2 gap-3">
          {[
            [CheckCircle2, 'Delivered', s.delivered, 'from-emerald-500 to-teal-600'],
            [Banknote, 'COD collected', formatPrice(s.codCollected), 'from-amber-400 to-orange-500'],
            [XCircle, 'Failed', s.failed, 'from-rose-500 to-pink-600'],
            [Clock, 'Pending now', s.pending, 'from-sky-500 to-blue-600'],
          ].map(([Icon, label, value, grad], i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-4">
              <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${grad} text-white`}><Icon className="h-5 w-5" /></span>
              <p className="mt-3 text-2xl font-extrabold">{value}</p>
              <p className="text-xs font-medium text-slate-500">{label}</p>
            </motion.div>
          ))}
        </div>
      )}
      {s?.codCollected > 0 && <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">Hand over <b>{formatPrice(s.codCollected)}</b> cash to the store at the end of the day.</p>}

      <div className="card p-5">
        <h2 className="font-bold">Last 7 days</h2>
        <div className="mt-5 flex h-36 items-end gap-2">
          {days.map((d, i) => (
            <div key={d.key} className="flex h-full flex-1 flex-col items-center gap-1.5">
              <span className="text-xs font-bold">{d.delivered || ''}</span>
              {/* Bar area fills the remaining height so the percentage height has something to resolve against. */}
              <div className="flex w-full flex-1 items-end">
                <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4, (d.delivered / max) * 100)}%` }} transition={{ delay: i * 0.05, type: 'spring', damping: 20 }} className={`w-full rounded-t-lg ${d.key === date ? 'bg-emerald-500' : d.delivered ? 'bg-emerald-300 dark:bg-emerald-500/50' : 'bg-slate-200 dark:bg-slate-700'}`} title={`${d.delivered} delivered · ${formatPrice(d.cod)} COD`} />
              </div>
              <span className="text-[11px] text-slate-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {s && (
        <div className="card flex items-center gap-4 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10"><Trophy className="h-6 w-6" /></span>
          <div><p className="text-2xl font-extrabold">{s.lifetimeDelivered}</p><p className="text-sm text-slate-500">deliveries completed in total</p></div>
        </div>
      )}
    </div>
  );
}
