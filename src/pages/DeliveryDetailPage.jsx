import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowLeft, Phone, Navigation, PackageCheck, Truck, KeyRound, XCircle, Banknote, CreditCard, CheckCircle2, MessageSquare } from 'lucide-react';
import { deliveryApi } from '@/services/delivery.api';
import { getErrorMessage } from '@/lib/api';
import { formatPrice, formatDateTime } from '@/lib/format';
import { assetUrl } from '@/lib/utils';
import { Badge, Button, EmptyState, PageLoader } from '@/components/ui';
import { OtpInput } from '@/features/deliveries/components/OtpInput';
import { FailDialog } from '@/features/deliveries/components/FailDialog';
import { ProgressSteps } from '@/features/deliveries/components/ProgressSteps';
import { DELIVERY_STATUS } from '@/features/deliveries/statusMeta';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function DeliveryDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: d, isLoading, error } = useQuery({ queryKey: ['delivery', orderId], queryFn: () => deliveryApi.get(orderId) });
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [failOpen, setFailOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  useDocumentTitle(d?.order?.orderNumber);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['delivery', orderId] });
    queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    queryClient.invalidateQueries({ queryKey: ['summary'] });
  };
  const action = (fn, message) => ({
    mutationFn: fn,
    onSuccess: () => { toast.success(message); refresh(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
  const pickup = useMutation(action(() => deliveryApi.pickup(orderId), 'Marked as picked up'));
  const outForDelivery = useMutation(action(() => deliveryApi.outForDelivery(orderId), 'You are out for delivery. The customer can now see their OTP.'));
  const deliver = useMutation({
    mutationFn: () => deliveryApi.deliver(orderId, otp),
    onSuccess: (res) => { setSuccess(res); refresh(); navigator.vibrate?.([80, 40, 80]); },
    onError: (err) => { setOtpError(getErrorMessage(err)); setOtp(''); refresh(); },
  });
  const fail = useMutation({
    mutationFn: (reason) => deliveryApi.fail(orderId, reason),
    onSuccess: () => { toast.success('Recorded. The admin has been notified.'); setFailOpen(false); refresh(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <PageLoader />;
  if (error || !d) return <EmptyState title="Order not found" description={getErrorMessage(error)} action={<Button as={Link} to="/">Back</Button>} />;

  const o = d.order;
  const a = o.address || {};
  const meta = DELIVERY_STATUS[d.status] || { label: d.status, tone: 'slate' };
  const active = d.isCurrent && ['assigned', 'picked_up', 'out_for_delivery'].includes(d.status);
  const locked = d.otp && d.otp.attemptsLeft === 0;

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="grid h-24 w-24 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-500/15"><CheckCircle2 className="h-14 w-14 text-emerald-600" /></motion.span>
        <h1 className="mt-6 text-2xl font-extrabold">Delivered!</h1>
        <p className="mt-1 text-slate-500">{o.orderNumber} · {o.customer.name}</p>
        {success.codCollected && <p className="mt-4 rounded-2xl bg-amber-50 px-5 py-3 text-lg font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">💵 {formatPrice(success.amount)} cash collected</p>}
        <Button variant="success" size="lg" className="mt-8 w-full max-w-xs" onClick={() => navigate('/')}>Next delivery</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex-1"><p className="font-mono font-bold">{o.orderNumber}</p><p className="text-xs text-slate-500">Assigned {formatDateTime(d.assignedAt)}</p></div>
        <Badge tone={meta.tone} dot>{meta.label}</Badge>
      </div>

      {['assigned', 'picked_up', 'out_for_delivery', 'delivered'].includes(d.status) && <div className="card px-4 py-4"><ProgressSteps status={d.status} /></div>}

      <div className="card p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Customer</p>
        <p className="mt-1 text-lg font-bold">{o.customer.name}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{[a.line1, a.line2].filter(Boolean).join(', ')}{a.landmark ? <><br />Landmark: {a.landmark}</> : null}<br />{a.city}, {a.state} – <b>{a.pincode}</b></p>
        {o.notes && <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"><MessageSquare className="mt-0.5 h-4 w-4 shrink-0" /> {o.notes}</p>}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button as="a" href={`tel:${o.customer.phone}`} variant="outline" size="lg"><Phone className="h-5 w-5" /> Call</Button>
          <Button as="a" href={o.mapsUrl} target="_blank" rel="noreferrer" variant="secondary" size="lg"><Navigation className="h-5 w-5" /> Navigate</Button>
        </div>
      </div>

      <div className={`card flex items-center gap-4 p-4 ${o.amountToCollect > 0 ? 'ring-2 ring-amber-400/60' : ''}`}>
        {o.amountToCollect > 0 ? (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/15"><Banknote className="h-6 w-6" /></span>
            <div><p className="text-sm text-slate-500">Cash on Delivery — collect</p><p className="text-2xl font-extrabold">{formatPrice(o.amountToCollect)}</p></div>
          </>
        ) : (
          <>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15"><CreditCard className="h-6 w-6" /></span>
            <div><p className="text-sm text-slate-500">Payment</p><p className="text-lg font-bold text-emerald-600">Prepaid · nothing to collect</p></div>
          </>
        )}
      </div>

      <div className="card p-4">
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Items ({o.items.reduce((s, i) => s + i.quantity, 0)})</p>
        <ul className="space-y-3">
          {o.items.map((i, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <img src={assetUrl(i.image)} alt="" className="h-12 w-12 rounded-lg object-cover" />
              <span className="flex-1 text-sm font-medium">{i.title}{i.variant?.value && <span className="block text-xs text-slate-500">{i.variant.label}: {i.variant.value}</span>}</span>
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-sm font-bold dark:bg-slate-800">×{i.quantity}</span>
            </li>
          ))}
        </ul>
      </div>

      {d.failReason && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">Failed: {d.failReason}</p>}

      <AnimatePresence mode="wait">
        {active && d.status === 'out_for_delivery' && (
          <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10"><KeyRound className="h-6 w-6" /></span>
            <h2 className="mt-3 font-bold">Enter delivery OTP</h2>
            <p className="mt-1 text-sm text-slate-500">Ask the customer for the 4-digit code shown on their order page.</p>
            <div className="mt-5"><OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpError(''); }} error={Boolean(otpError)} disabled={locked || deliver.isPending} autoFocus /></div>
            {otpError && <p role="alert" className="mt-3 text-sm font-medium text-rose-600">{otpError}</p>}
            {d.otp && !otpError && <p className="mt-3 text-xs text-slate-400">{locked ? 'No attempts left — contact the admin for a new OTP' : `${d.otp.attemptsLeft} attempt(s) left`}</p>}
            <Button variant="success" size="lg" className="mt-5 w-full" disabled={otp.length !== 4 || locked} loading={deliver.isPending} onClick={() => deliver.mutate()}>
              <CheckCircle2 className="h-5 w-5" /> {o.amountToCollect > 0 ? `Cash collected · Confirm delivery` : 'Confirm delivery'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {active && (
        <div className="sticky bottom-24 space-y-2">
          {d.status === 'assigned' && <Button variant="primary" size="lg" className="w-full shadow-lift" loading={pickup.isPending} onClick={() => pickup.mutate()}><PackageCheck className="h-5 w-5" /> Picked up from store</Button>}
          {d.status === 'picked_up' && <Button variant="primary" size="lg" className="w-full shadow-lift" loading={outForDelivery.isPending} onClick={() => outForDelivery.mutate()}><Truck className="h-5 w-5" /> Start delivery (out for delivery)</Button>}
          {d.status !== 'assigned' && <Button variant="ghost" className="w-full text-rose-600" onClick={() => setFailOpen(true)}><XCircle className="h-4 w-4" /> Delivery failed / customer unavailable</Button>}
        </div>
      )}

      <FailDialog open={failOpen} onClose={() => setFailOpen(false)} onSubmit={(reason) => fail.mutate(reason)} loading={fail.isPending} />
    </div>
  );
}
