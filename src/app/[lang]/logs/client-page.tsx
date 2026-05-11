
'use client';

import { useSensorData } from '@/hooks/use-sensor-data';
import { useDictionary } from '@/hooks/use-dictionary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SensorReading } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

const SensorLog = ({ name, reading }: { name: string; reading: SensorReading | null }) => {
  const { dictionary } = useDictionary();
  return (
    <Card className="border-2 border-muted">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>
          {dictionary.logs.lastUpdate}: {reading ? new Date(reading.timestamp).toLocaleString() : dictionary.logs.noData}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reading ? (
          <div>
            <h4 className="font-mono text-sm">{dictionary.logs.timestamp}: {reading.timestamp}</h4>
            <h4 className="font-bold mt-2 mb-1">{dictionary.logs.matrix}:</h4>
            <pre className="text-xs bg-muted p-2 rounded-md font-mono overflow-x-auto">
              {JSON.stringify(reading.matrix, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function LogsClientPage() {
  const { frontReading, leftReading, rightReading } = useSensorData();
  const { dictionary } = useDictionary();

  return (
    <>
      <div className="mb-8 text-center md:text-left">
        <h1 className="font-headline text-4xl font-bold">{dictionary.logs.title}</h1>
        <p className="text-muted-foreground">{dictionary.logs.description}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SensorLog name={dictionary.dashboard.frontSensor} reading={frontReading} />
        <SensorLog name={dictionary.dashboard.leftSensor} reading={leftReading} />
        <SensorLog name={dictionary.dashboard.rightSensor} reading={rightReading} />
      </div>
    </>
  );
}
