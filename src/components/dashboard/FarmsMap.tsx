import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { useProductionUnits } from '@/contexts/ProductionUnitsContext';

declare global {
  interface Window {
    google?: any;
    __initAquapiloteMap?: () => void;
  }
}

type Status = 'normal' | 'warning' | 'critical';

interface FarmMarker {
  id: string;
  name: string;
  type: string;
  status: Status;
  lat: number;
  lng: number;
  stock: number;
  capacity: number;
}

// Hash-based deterministic offset around a center so a unit always pins to the same spot
const hashOffset = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const a = ((h & 0xffff) / 0xffff - 0.5) * 1.2; // ±0.6°
  const b = (((h >> 16) & 0xffff) / 0xffff - 0.5) * 1.2;
  return { dLat: a, dLng: b };
};

const statusColor: Record<Status, string> = {
  normal: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
};

const FarmsMap: React.FC = () => {
  const { units } = useProductionUnits();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const browserKey = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const trackingId = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;

  // Default center: West Africa (Lomé, Togo)
  const center = { lat: 6.1725, lng: 1.2314 };

  const markers: FarmMarker[] = units.map((u, i) => {
    const { dLat, dLng } = hashOffset(u.id);
    const ratio = u.capacity ? u.currentStock / u.capacity : 0;
    const status: Status = !u.isActive ? 'critical' : ratio > 0.85 ? 'warning' : 'normal';
    return {
      id: u.id,
      name: u.name,
      type: u.type,
      status,
      lat: center.lat + dLat,
      lng: center.lng + dLng,
      stock: u.currentStock,
      capacity: u.capacity,
    };
  });

  useEffect(() => {
    if (!browserKey) {
      setLoadError('Clé Google Maps manquante');
      return;
    }

    const init = async () => {
      if (!mapRef.current || !window.google?.maps?.importLibrary) return;
      const { Map, InfoWindow } = (await window.google.maps.importLibrary('maps')) as any;
      const { Marker } = (await window.google.maps.importLibrary('marker')) as any;
      const map = new Map(mapRef.current, {
        center,
        zoom: 7,
        disableDefaultUI: false,
        mapTypeControl: false,
        streetViewControl: false,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c4a6e' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        ],
      });

      markers.forEach((m) => {
        const marker = new Marker({
          position: { lat: m.lat, lng: m.lng },
          map,
          title: m.name,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: statusColor[m.status],
            fillOpacity: 0.95,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });
        const info = new InfoWindow({
          content: `<div style="font-family:system-ui;padding:4px 6px;color:#0f172a;min-width:160px">
            <div style="font-weight:600;margin-bottom:2px">${m.name}</div>
            <div style="font-size:12px;color:#475569">${m.type}</div>
            <div style="font-size:12px;margin-top:4px">Stock : <b>${m.stock.toLocaleString()}</b> / ${m.capacity.toLocaleString()}</div>
            <div style="font-size:12px;color:${statusColor[m.status]};font-weight:600;margin-top:2px;text-transform:capitalize">${m.status}</div>
          </div>`,
        });
        marker.addListener('click', () => info.open({ anchor: marker, map }));
      });

      setMapReady(true);
    };

    if (window.google?.maps) {
      init();
      return;
    }

    window.__initAquapiloteMap = init;
    const existing = document.getElementById('gmaps-aquapilote');
    if (existing) return;
    const script = document.createElement('script');
    script.id = 'gmaps-aquapilote';
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${browserKey}&loading=async&callback=__initAquapiloteMap${
      trackingId ? `&channel=${trackingId}` : ''
    }`;
    script.onerror = () => setLoadError('Échec du chargement de Google Maps');
    document.head.appendChild(script);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [browserKey, units.length]);

  const counts = {
    normal: markers.filter((m) => m.status === 'normal').length,
    warning: markers.filter((m) => m.status === 'warning').length,
    critical: markers.filter((m) => m.status === 'critical').length,
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin className="w-5 h-5 text-primary" />
            Carte des fermes
          </CardTitle>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="gap-1 text-green-600 border-green-200">
              <CheckCircle2 className="w-3 h-3" /> Normal {counts.normal}
            </Badge>
            <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200">
              <Activity className="w-3 h-3" /> Attention {counts.warning}
            </Badge>
            <Badge variant="outline" className="gap-1 text-red-600 border-red-200">
              <AlertTriangle className="w-3 h-3" /> Critique {counts.critical}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full h-[280px] sm:h-[380px] bg-slate-900">
          <div ref={mapRef} className="absolute inset-0" />
          {!mapReady && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground bg-slate-900/60">
              {loadError ?? 'Chargement de la carte...'}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmsMap;