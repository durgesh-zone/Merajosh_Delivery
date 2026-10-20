import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Bike, Mail, Lock } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const schema = z.object({ email: z.string().trim().email('Enter a valid email address'), password: z.string().min(1, 'Password is required') });

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });
  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate('/', { replace: true });
    } catch (err) {
      setError('root', { message: getErrorMessage(err) });
    }
  };

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-gradient-to-b from-emerald-50 to-white px-5 py-10 dark:from-slate-900 dark:to-slate-950">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-sm">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-600/30"><Bike className="h-8 w-8" /></span>
        <h1 className="mt-5 text-center text-2xl font-extrabold">ShopNest Rider</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Sign in to see your deliveries</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          {errors.root && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{errors.root.message}</p>}
          <Input label="Email" type="email" autoComplete="username" leftIcon={Mail} error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" autoComplete="current-password" leftIcon={Lock} error={errors.password?.message} {...register('password')} />
          <Button type="submit" variant="success" size="lg" className="w-full" loading={isSubmitting}>Sign in</Button>
        </form>
        <p className="mt-6 rounded-xl bg-white/70 p-3 text-center text-xs text-slate-500 dark:bg-slate-800/60">Demo: rider@shopnest.dev / Rider@123</p>
      </motion.div>
    </div>
  );
}
