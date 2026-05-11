
'use client';

import { cn } from '@/lib/utils';
import { useDictionary } from '@/hooks/use-dictionary';

type HeatmapGridProps = {
  data: number[][];
};

// Color scale from blue (close) to green (far)
const getColor = (value: number, min: number, max: number) => {
  if (value <= 0) return 'hsl(var(--muted))';
  const range = max - min;
  if (range === 0) return 'hsl(var(--accent))';
  
  const ratio = (value - min) / range;
  // Hue from 200 (blue for close) to 80 (greenish for far)
  const hue = 200 - ratio * 120; 
  const saturation = 90;
  const lightness = 50;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

function HeatmapLegend() {
    const { dictionary } = useDictionary();
    return (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{dictionary.dashboard.close}</span>
            <div className="h-3 w-full mx-2 rounded-full" style={{ background: 'linear-gradient(to right, hsl(200, 90%, 50%), hsl(80, 90%, 50%))' }} />
            <span>{dictionary.dashboard.far}</span>
        </div>
    );
}


export default function HeatmapGrid({ data }: HeatmapGridProps) {
  if (!data || data.length === 0) return null;

  const validValues = data.flat().filter(v => v > 0);
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);

  return (
    <div>
        <div
            className="grid aspect-square grid-cols-8 gap-1 rounded-md bg-muted p-2"
            aria-label="Sensor data heatmap"
            >
            {data.flat().map((value, index) => (
                <div
                key={index}
                className="aspect-square w-full rounded-sm"
                style={{ backgroundColor: getColor(value, min, max) }}
                title={`Value: ${value > 0 ? (value / 10).toFixed(1) + ' cm' : 'N/A'}`}
                />
            ))}
        </div>
        <HeatmapLegend />
    </div>
  );
}
