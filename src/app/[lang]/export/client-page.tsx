
'use client';

import { useSensorData } from '@/hooks/use-sensor-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ObjectPosition } from '@/types';
import { useDictionary } from '@/hooks/use-dictionary';

export default function ExportClientPage() {
  const { history } = useSensorData();
  const { toast } = useToast();
  const { dictionary } = useDictionary();

  const handleExport = () => {
    if (history.length === 0) {
      toast({
        title: dictionary.export.noDataTitle,
        description: dictionary.export.noDataDescription,
        variant: 'destructive',
      });
      return;
    }

    const headers = ['timestamp', 'datetime_utc', 'x_cm', 'y_cm', 'z_cm'];
    const csvRows = [
      headers.join(','),
      ...history.map((row: ObjectPosition) => {
        const { timestamp, position } = row;
        const date = new Date(timestamp).toISOString();
        const values = [timestamp, date, position.x.toFixed(3), position.y.toFixed(3), position.z.toFixed(3)];
        return values.join(',');
      }),
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `sensorfusion3d_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: dictionary.export.successTitle,
      description: dictionary.export.successDescription.replace('{count}', String(history.length)),
    });
  };

  return (
    <>
      <div className="mb-8 text-center md:text-left">
        <h1 className="font-headline text-4xl font-bold">{dictionary.export.title}</h1>
        <p className="text-muted-foreground">{dictionary.export.description}</p>
      </div>
      <div className="flex justify-center">
        <Card className="w-full max-w-lg border-4 border-foreground shadow-lg">
          <CardHeader>
            <CardTitle>{dictionary.export.cardTitle}</CardTitle>
            <CardDescription>
              {dictionary.export.cardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 text-center p-8 bg-muted rounded-lg">
              <FileDown className="h-16 w-16 text-primary" />
              <p className="text-muted-foreground">
                {dictionary.export.recordCount.replace('{count}', String(history.length))}
              </p>
              <Button onClick={handleExport} size="lg">
                <FileDown className="mr-2 h-4 w-4" />
                {dictionary.export.buttonText}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
