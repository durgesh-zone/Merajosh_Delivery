import { useEffect, useState } from 'react';
import { Button, Modal, Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';

const REASONS = ['Customer unavailable', 'Customer not answering phone', 'Wrong / incomplete address', 'Customer refused the order', 'Customer asked to reschedule', 'Unable to reach location'];

export function FailDialog({ open, onClose, onSubmit, loading }) {
  const [choice, setChoice] = useState('');
  const [other, setOther] = useState('');
  useEffect(() => {
    if (open) {
      setChoice('');
      setOther('');
    }
  }, [open]);
  const reason = choice === 'Other' ? other.trim() : choice;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delivery failed"
      description="Tell us what happened. The admin will re-schedule the order."
      footer={<><Button variant="outline" onClick={onClose}>Back</Button><Button variant="danger" disabled={reason.length < 3} loading={loading} onClick={() => onSubmit(reason)}>Mark as failed</Button></>}
    >
      <div className="space-y-2" role="radiogroup" aria-label="Reason">
        {[...REASONS, 'Other'].map((r) => (
          <button key={r} type="button" role="radio" aria-checked={choice === r} onClick={() => setChoice(r)} className={cn('w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition', choice === r ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : 'border-slate-200 dark:border-slate-700')}>
            {r}
          </button>
        ))}
        {choice === 'Other' && <Textarea rows={2} autoFocus value={other} onChange={(e) => setOther(e.target.value)} placeholder="Describe the reason" maxLength={300} />}
      </div>
    </Modal>
  );
}
