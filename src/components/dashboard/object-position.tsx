'use client';

import { Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Point3D } from '@/types';
import { useDictionary } from '@/hooks/use-dictionary';

type ObjectPositionDisplayProps = {
  position: Point3D | undefined | null;
  timestamp: number | undefined | null;
};

export default function ObjectPositionDisplay({ position, timestamp }: ObjectPositionDisplayProps) {
  const { dictionary } = useDictionary();
  return (
    <Card className="border-4 border-foreground shadow-lg h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-6 w-6 text-accent" />
          {dictionary.dashboard.objectLocation}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {position ? (
          <>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">X</p>
                <p className="text-3xl font-bold font-mono">{position.x.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">cm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Y</p>
                <p className="text-3xl font-bold font-mono">{position.y.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">cm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Z</p>
                <p className="text-3xl font-bold font-mono">{position.z.toFixed(1)}</p>
                 <p className="text-xs text-muted-foreground">cm</p>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {dictionary.dashboard.lastUpdated}: {timestamp ? new Date(timestamp).toLocaleTimeString() : 'N/A'}
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <p className="text-center text-muted-foreground">{dictionary.dashboard.searching}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
