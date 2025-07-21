import { useEffect, useState } from "react";

export interface ShippingConfig {
  city: string;
  freeThreshold: number;
  fee: number;
}

export function useShippingConfig() {
  const [config, setConfig] = useState<ShippingConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch("/api/admin/shipping-config");
        let data = null;
        try {
          if (res.ok) {
            data = await res.json();
          }
        } catch (jsonErr) {
          // JSON invalide ou vide
          data = null;
        }
        if (data && data.config) {
          setConfig({
            city: data.config.city,
            freeThreshold: data.config.freeThreshold,
            fee: data.config.fee,
          });
        }
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  return { config, loading };
} 