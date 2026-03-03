import React, { memo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface CountryMarker {
  country: string;
  countryCode: string;
  visits: number;
  coordinates: [number, number];
}

// Mapping country codes to approximate coordinates
const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  FR: [2.2137, 46.2276], DE: [10.4515, 51.1657], GB: [-3.436, 55.3781],
  US: [-95.7129, 37.0902], CA: [-106.3468, 56.1304], BR: [-51.9253, -14.2350],
  TG: [1.1667, 6.1256], BJ: [2.3158, 9.3077], SN: [-14.4524, 14.4974],
  ML: [-8.0, 17.5707], GH: [-1.0232, 7.9465], CI: [-5.5471, 7.5400],
  NG: [8.6753, 9.0820], CM: [12.3547, 7.3697], CD: [21.7587, -4.0383],
  KE: [37.9062, -0.0236], TZ: [34.8888, -6.3690], ZA: [22.9375, -30.5595],
  MA: [-7.0926, 31.7917], DZ: [1.6596, 28.0339], TN: [9.5375, 33.8869],
  EG: [30.8025, 26.8206], IN: [78.9629, 20.5937], CN: [104.1954, 35.8617],
  JP: [138.2529, 36.2048], AU: [133.7751, -25.2744], RU: [105.3188, 61.524],
  ES: [-3.7492, 40.4637], IT: [12.5674, 41.8719], PT: [-8.2245, 39.3999],
  BE: [4.4699, 50.5039], NL: [5.2913, 52.1326], CH: [8.2275, 46.8182],
  AT: [14.5501, 47.5162], PL: [19.1451, 51.9194], SE: [18.6435, 60.1282],
  NO: [8.4689, 60.472], DK: [9.5018, 56.2639], FI: [25.7482, 61.9241],
  GN: [-9.6966, 9.9456], BF: [-1.5616, 12.2383], NE: [8.0817, 17.6078],
  TD: [18.7322, 15.4542], GA: [11.6094, -0.8037], CG: [15.8277, -4.2634],
  CF: [20.9394, 6.6111], RW: [29.8739, -1.9403], UG: [32.2903, 1.3733],
  MG: [46.8691, -18.7669], MU: [57.5522, -20.3484], RE: [55.5364, -21.1151],
  XX: [0, 0],
};

interface WorldMapProps {
  countryStats: { country: string; countryCode: string; visits: number }[];
}

const WorldMap: React.FC<WorldMapProps> = ({ countryStats }) => {
  const markers: CountryMarker[] = countryStats
    .filter(c => c.countryCode !== 'XX' && COUNTRY_COORDINATES[c.countryCode])
    .map(c => ({
      ...c,
      coordinates: COUNTRY_COORDINATES[c.countryCode] || [0, 0],
    }));

  const maxVisits = Math.max(...markers.map(m => m.visits), 1);

  return (
    <div className="w-full h-[300px] sm:h-[400px] bg-muted/20 rounded-xl overflow-hidden">
      <ComposableMap
        projectionConfig={{ scale: 140, center: [10, 10] }}
        className="w-full h-full"
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="hsl(var(--muted))"
                  stroke="hsl(var(--border))"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: 'hsl(var(--primary) / 0.3)', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
          {markers.map((marker) => {
            const size = Math.max(4, Math.min(20, (marker.visits / maxVisits) * 20));
            return (
              <Marker key={marker.countryCode} coordinates={marker.coordinates}>
                <circle
                  r={size}
                  fill="hsl(var(--primary))"
                  fillOpacity={0.7}
                  stroke="hsl(var(--primary-foreground))"
                  strokeWidth={1}
                />
                <title>{`${marker.country}: ${marker.visits} visite(s)`}</title>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default memo(WorldMap);
