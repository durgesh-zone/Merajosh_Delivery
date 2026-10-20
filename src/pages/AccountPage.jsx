import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { LogOut, Mail, Phone, Bike } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/delivery.api';
import { getErrorMessage } from '@/lib/api';
import { Button, Input } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'At least 8 characters').regex(/[A-Za-z]/, 'Must contain a letter').regex(/\d/, 'Must contain a number'),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export default function AccountPage() {
  useDocumentTitle('Account');
  const { user, logout } = useAuth();
  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Password changed');
      reset({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setError('currentPassword', { message: getErrorMessage(err) });
    }
  };

  return (
    <div className="space-y-5">
      <div className="card p-5 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-2xl font-bold text-white">{user?.name?.[0]}</span>
        <h1 className="mt-3 text-xl font-extrabold">{user?.name}</h1>
        <div className="mt-3 space-y-1 text-sm text-slate-500">
          <p className="flex items-center justify-center gap-2"><Mail className="h-4 w-4" />{user?.email}</p>
          {user?.phone && <p className="flex items-center justify-center gap-2"><Phone className="h-4 w-4" />{user.phone}</p>}
          {user?.vehicleNumber && <p className="flex items-center justify-center gap-2"><Bike className="h-4 w-4" />{user.vehicleNumber}</p>}
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4 p-5" noValidate>
        <h2 className="font-bold">Change password</h2>
        <Input type="password" label="Current password" autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword')} />
        <Input type="password" label="New password" autoComplete="new-password" error={errors.newPassword?.message} {...register('newPassword')} />
        <Input type="password" label="Confirm new password" autoComplete="new-password" error={errors.confirm?.message} {...register('confirm')} />
        <Button type="submit" variant="secondary" className="w-full" loading={isSubmitting}>Update password</Button>
      </form>
      <Button variant="outline" size="lg" className="w-full text-rose-600" onClick={logout}><LogOut className="h-5 w-5" /> Sign out</Button>
    </div>
  );
}
