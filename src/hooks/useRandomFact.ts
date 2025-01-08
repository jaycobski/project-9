import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useRandomFact() {
  const [fact, setFact] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRandomFact() {
      try {
        const { data, error } = await supabase
          .from('crm_facts')
          .select('fact')
          .limit(1)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;
        if (data) {
          setFact(data.fact);
        }
      } catch (err) {
        console.error('Error fetching random fact:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRandomFact();
  }, []);

  return { fact, isLoading };
}