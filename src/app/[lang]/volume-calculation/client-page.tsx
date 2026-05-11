
'use client';

import { useState } from 'react';
import { useSensorData } from '@/hooks/use-sensor-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2, Sparkles, AlertCircle, Scaling, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Point3D } from '@/types';
import { useDictionary } from '@/hooks/use-dictionary';

type BoundingBoxResult = {
  volume: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
};

const calculateBoundingBoxVolume = (points: Point3D[]): BoundingBoxResult | null => {
  if (points.length < 2) return null;

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
    minZ = Math.min(minZ, point.z);
    maxZ = Math.max(maxZ, point.z);
  }

  // Convert from cm to m for final dimensions
  const length = (maxX - minX) / 100;
  const height = (maxY - minY) / 100; // Y is up/down
  const width = (maxZ - minZ) / 100;

  if (length <= 0 || width <= 0 || height <= 0) return null;

  const volume = length * width * height;

  return {
    volume,
    dimensions: {
      length,
      width,
      height,
    },
  };
};

export default function VolumeCalculationClientPage() {
  const { toast } = useToast();
  const { fusedCloud } = useSensorData();
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<BoundingBoxResult | null>(null);
  const { dictionary } = useDictionary();

  const handleCalculate = () => {
    if (fusedCloud.length === 0) {
      toast({
        title: dictionary.volume.noDataTitle,
        description: dictionary.volume.noDataDescription,
        variant: 'destructive',
      });
      return;
    }

    setIsCalculating(true);
    setResult(null);

    // Simulate a short delay for user feedback
    setTimeout(() => {
      const calculationResult = calculateBoundingBoxVolume(fusedCloud);
      if (calculationResult) {
        setResult(calculationResult);
      } else {
        toast({
          title: "Calculation Failed",
          description: "Could not determine volume from the point cloud. Try scanning more points.",
          variant: 'destructive',
        });
      }
      setIsCalculating(false);
    }, 500);
  };

  return (
    <>
      <div className="mb-8 text-center md:text-left">
        <h1 className="font-headline text-4xl font-bold">{dictionary.volume.title}</h1>
        <p className="text-muted-foreground">
          {dictionary.volume.description}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-4 border-foreground shadow-lg">
          <CardHeader>
            <CardTitle>{dictionary.volume.inputTitle}</CardTitle>
            <CardDescription>
              {dictionary.volume.inputDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{dictionary.volume.instructionsTitle}</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal list-inside space-y-2 mt-2">
                  <li>{dictionary.volume.step1}</li>
                  <li>{dictionary.volume.step2}</li>
                  <li>{dictionary.volume.step3}</li>
                  <li>{dictionary.volume.step4.replace('let the AI analyze', 'calculate from')}</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {dictionary.volume.pointCloudCount.replace('{count}', String(fusedCloud.length))}
              </p>
               <Button onClick={handleCalculate} disabled={isCalculating || fusedCloud.length === 0} className="w-full">
                {isCalculating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="mr-2 h-4 w-4" />
                )}
                {dictionary.volume.calculateButton.replace(' with AI', '')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-4 border-foreground shadow-lg">
          <CardHeader>
            <CardTitle>{dictionary.volume.resultsTitle}</CardTitle>
            <CardDescription>{dictionary.volume.resultsDescription.replace("The AI's analysis", "The geometric calculation")}</CardDescription>
          </CardHeader>
          <CardContent>
             {isCalculating && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">{dictionary.volume.analyzing.replace('AI is analyzing the point cloud...', 'Calculating...')}</p>
              </div>
            )}
            {result && (
               <div className="space-y-6">
                   <div className="text-center bg-muted rounded-lg p-6">
                      <p className="text-sm text-muted-foreground">{dictionary.volume.estimatedVolume}</p>
                      <p className="text-5xl font-bold font-mono text-primary">{result.volume.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">m³</p>
                  </div>
                   <div>
                      <h3 className="font-semibold flex items-center gap-2"><Scaling className="h-5 w-5 text-accent" /> {dictionary.volume.estimatedDimensions}</h3>
                       <div className="grid grid-cols-3 gap-4 text-center mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">{dictionary.volume.length}</p>
                          <p className="text-2xl font-bold font-mono">{result.dimensions.length.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">m</p>
                        </div>
                         <div>
                          <p className="text-xs text-muted-foreground">{dictionary.volume.width}</p>
                          <p className="text-2xl font-bold font-mono">{result.dimensions.width.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">m</p>
                        </div>
                         <div>
                          <p className="text-xs text-muted-foreground">{dictionary.volume.height}</p>
                          <p className="text-2xl font-bold font-mono">{result.dimensions.height.toFixed(2)}</p>
                           <p className="text-xs text-muted-foreground">m</p>
                        </div>
                      </div>
                  </div>
              </div>
            )}
            {!isCalculating && !result && (
               <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
                  <p>{dictionary.volume.prompt}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
