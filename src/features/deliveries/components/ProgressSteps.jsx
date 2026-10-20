import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'picked_up', label: 'Picked up' },
  { key: 'out_for_delivery', label: 'On the way' },
  { key: 'delivered', label: 'Delivered' },
];

export function ProgressSteps({ status }) {
  const index = STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="flex items-center">
      {STEPS.map((s, i) => {
        const done = index >= i;
        return (
          <li key={s.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span className={cn('grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold', done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-slate-400 dark:border-slate-600')}>
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn('whitespace-nowrap text-[11px] font-semibold', done ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400')}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <span className={cn('mx-1 mb-5 h-0.5 flex-1 rounded', index > i ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700')} />}
          </li>
        );
      })}
    </ol>
  );
}
