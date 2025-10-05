import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { supabaseQueries } from '@/utils/supabase-queries';

export function useSupabaseSync() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncCustomers = async () => {
    if (!userId) return;
    try {
      const customers = await supabaseQueries.customers.getAll(userId);
      console.log('Synced customers:', customers);
    } catch (err) {
      console.error('Error syncing customers:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const syncJobs = async () => {
    if (!userId) return;
    try {
      const jobs = await supabaseQueries.jobs.getAll(userId);
      console.log('Synced jobs:', jobs);
    } catch (err) {
      console.error('Error syncing jobs:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const syncInvoices = async () => {
    if (!userId) return;
    try {
      const invoices = await supabaseQueries.invoices.getAll(userId);
      console.log('Synced invoices:', invoices);
    } catch (err) {
      console.error('Error syncing invoices:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const syncTechnicians = async () => {
    if (!userId) return;
    try {
      const technicians = await supabaseQueries.technicians.getAll(userId);
      console.log('Synced technicians:', technicians);
    } catch (err) {
      console.error('Error syncing technicians:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const syncAll = async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        syncCustomers(),
        syncJobs(),
        syncInvoices(),
        syncTechnicians(),
      ]);
    } catch (err) {
      console.error('Error syncing all data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userId,
    isLoading,
    error,
    syncCustomers,
    syncJobs,
    syncInvoices,
    syncTechnicians,
    syncAll,
  };
}
