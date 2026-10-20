import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getSocket } from '@/lib/socket';

/** New assignments and order changes arrive in real time. */
export function useRiderSocket(enabled) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!enabled) return undefined;
    const socket = getSocket();
    const refresh = (p) => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      if (p?.orderId) queryClient.invalidateQueries({ queryKey: ['delivery', p.orderId] });
    };
    const onNew = (p) => {
      refresh(p);
      toast.success(`New delivery assigned: ${p.orderNumber}`, { icon: '📦', duration: 6000 });
      navigator.vibrate?.(200);
    };
    const onRemoved = (p) => {
      refresh(p);
      toast('An order was re-assigned to another partner', { icon: 'ℹ️' });
    };
    socket.on('assignment:new', onNew);
    socket.on('assignment:removed', onRemoved);
    socket.on('order:updated', refresh);
    return () => {
      socket.off('assignment:new', onNew);
      socket.off('assignment:removed', onRemoved);
      socket.off('order:updated', refresh);
    };
  }, [enabled, queryClient]);
}
