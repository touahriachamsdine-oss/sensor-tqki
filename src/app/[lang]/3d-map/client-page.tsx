
'use client';

import PointCloud from '@/components/3d-map/point-cloud';
import { useSensorData } from '@/hooks/use-sensor-data';
import { useDictionary } from '@/hooks/use-dictionary';
import { Button } from '@/components/ui/button';
import { Scan, Trash2, Play, Pause } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

function MapControls() {
  const { isScanning, startScanning, stopScanning, clearFusedCloud, fusedCloud } = useSensorData();
  const { dictionary } = useDictionary();

  return (
    <Card className="absolute top-4 left-4 z-10 border-4 border-foreground shadow-lg bg-background/80 backdrop-blur-sm">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="flex gap-2">
          <Button
            variant={isScanning ? 'destructive' : 'default'}
            onClick={isScanning ? stopScanning : startScanning}
          >
            {isScanning ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                {dictionary.map3d.stopScan}
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                {dictionary.map3d.startScan}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={clearFusedCloud} disabled={isScanning}>
            <Trash2 className="mr-2 h-4 w-4" />
            {dictionary.map3d.clearMap}
          </Button>
        </div>
         <div className="text-center border-l pl-4">
            <div className="font-bold text-2xl font-mono">{fusedCloud.length.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{dictionary.map3d.points}</div>
        </div>
      </CardContent>
    </Card>
  );
}


export default function Map3DClientPage() {
  const { fusedCloud, objectPosition, history } = useSensorData();
  const { dictionary } = useDictionary();

  // Get the last 10 historical points for the path
  const pathHistory = history.slice(0, 10);

  return (
    <>
      <div className="mb-4 text-center md:text-left">
        <h1 className="font-headline text-4xl font-bold">{dictionary.map3d.title}</h1>
        <p className="text-muted-foreground">
          {dictionary.map3d.description}
        </p>
      </div>
      <div className="flex-1 relative border-4 border-foreground rounded-lg bg-card shadow-lg overflow-hidden">
        <MapControls />
        <PointCloud
          points={fusedCloud}
          objectPosition={objectPosition?.position}
          pathHistory={pathHistory}
        />
      </div>
    </>
  );
}
