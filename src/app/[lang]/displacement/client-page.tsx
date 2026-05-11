
'use client';

import { useState, useMemo } from 'react';
import { useSensorData } from '@/hooks/use-sensor-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, DraftingCompass, Loader2, Volume2, MoveVertical, CalendarClock, BellOff } from 'lucide-react';
import type { Point3D } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDictionary } from '@/hooks/use-dictionary';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DISPLACEMENT_THRESHOLD_CM = 5; // A cell is "displaced" if it moves more than 5cm

// Define the grid for analysis
const GRID_SIZE = 4; // 4x4 grid
const SENSOR_AREA_X_MIN = -50;
const SENSOR_AREA_X_MAX = 50;
const SENSOR_AREA_Z_MIN = -50;
const SENSOR_AREA_Z_MAX = 50;
const CELL_WIDTH = (SENSOR_AREA_X_MAX - SENSOR_AREA_X_MIN) / GRID_SIZE; // 25 cm
const CELL_DEPTH = (SENSOR_AREA_Z_MAX - SENSOR_AREA_Z_MIN) / GRID_SIZE; // 25 cm
const CELL_AREA_CM2 = CELL_WIDTH * CELL_DEPTH; // 625 cm²

// Calculates the average height of points within each grid cell
const calculateGridAverages = (points: Point3D[]): (number | null)[][] => {
  const grid: { sum: number; count: number }[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => ({ sum: 0, count: 0 })));

  for (const point of points) {
    const gridX = Math.floor((point.x - SENSOR_AREA_X_MIN) / CELL_WIDTH);
    const gridZ = Math.floor((point.z - SENSOR_AREA_Z_MIN) / CELL_DEPTH);

    if (gridX >= 0 && gridX < GRID_SIZE && gridZ >= 0 && gridZ < GRID_SIZE) {
      grid[gridZ][gridX].sum += point.y;
      grid[gridZ][gridX].count++;
    }
  }
  
  return grid.map(row => row.map(cell => cell.count > 0 ? cell.sum / cell.count : null));
};


// Calculates total displaced surface area and average displacement
const calculateDisplacementMetrics = (
  baseline: (number | null)[][],
  current: (number | null)[][]
): { averageDisplacement: number; displacedArea: number } => {
  let totalDisplacement = 0;
  let displacementCount = 0;
  let displacedCellCount = 0;

  for (let z = 0; z < GRID_SIZE; z++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const baselineHeight = baseline[z][x];
      const currentHeight = current[z][x];

      if (baselineHeight !== null && currentHeight !== null) {
        const diff = currentHeight - baselineHeight;
        // Ignore huge, sudden changes (like a person's leg)
        if (Math.abs(diff) < 50) { 
           totalDisplacement += diff;
           displacementCount++;
           if (Math.abs(diff) > DISPLACEMENT_THRESHOLD_CM) {
             displacedCellCount++;
           }
        }
      }
    }
  }

  const averageDisplacement = displacementCount > 0 ? totalDisplacement / displacementCount : 0;
  const displacedArea = displacedCellCount * CELL_AREA_CM2;
  return { averageDisplacement, displacedArea };
};


export default function DisplacementClientPage() {
  const { fusedCloud, lastUpdateTime } = useSensorData();
  const [baselineGrid, setBaselineGrid] = useState<(number | null)[][] | null>(null);
  const [baselineTimestamp, setBaselineTimestamp] = useState<number | null>(null);
  const [isSetting, setIsSetting] = useState(false);
  const { dictionary } = useDictionary();
  const { toast } = useToast();

  const [dangerThreshold, setDangerThreshold] = useState(0.1);
  const [dailyRateThreshold, setDailyRateThreshold] = useState(0.05);


  const handleSetBaseline = () => {
    setIsSetting(true);
    setBaselineGrid(calculateGridAverages(fusedCloud));
    setBaselineTimestamp(Date.now());
    setTimeout(() => setIsSetting(false), 500); // Visual feedback
  };

  const handleBuzzer = async (state: boolean) => {
    try {
      await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buzzer: state }),
      });
      toast({
        title: state ? "Buzzer Test Signal Sent" : "Buzzer Silenced",
        description: state ? "Buzzer has been activated. It will turn off shortly." : "The buzzer has been manually turned off.",
      });
      if (state) {
        // Automatically turn off the buzzer after a short period for tests
        setTimeout(async () => {
          await fetch('/api/control', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ buzzer: false }),
          });
        }, 1000); // Beep for 1 second
      }
    } catch (error) {
      console.error("API write error:", error);
      toast({
        title: "Error Sending Signal",
        description: "Could not send signal to the buzzer.",
        variant: "destructive",
      });
    }
  };
  
  const { averageDisplacement, displacedArea, dailyRate, isDanger } = useMemo(() => {
    if (!baselineGrid || !fusedCloud || !baselineTimestamp) return { averageDisplacement: 0, displacedArea: 0, dailyRate: 0, isDanger: false };
    
    const currentGrid = calculateGridAverages(fusedCloud);
    const metrics = calculateDisplacementMetrics(baselineGrid, currentGrid);
    
    const daysElapsed = (Date.now() - baselineTimestamp) / (1000 * 60 * 60 * 24);
    const calculatedDailyRate = daysElapsed > 0 ? Math.abs(metrics.averageDisplacement) / daysElapsed : 0;
    
    const dangerFromThreshold = Math.abs(metrics.averageDisplacement) > dangerThreshold;
    const dangerFromRate = daysElapsed > 1 && calculatedDailyRate > dailyRateThreshold; // Only check rate after 1 day
    const isCurrentlyDanger = dangerFromThreshold || dangerFromRate;

    // Automatically trigger buzzer if danger threshold is met
    if (isCurrentlyDanger) {
       fetch('/api/control', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ buzzer: true }),
       });
       // Turn it off after a few seconds to avoid constant noise
       setTimeout(() => {
         fetch('/api/control', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ buzzer: false }),
         });
       }, 5000);
    }
    
    return { ...metrics, dailyRate: calculatedDailyRate, isDanger: isCurrentlyDanger };
    
  }, [baselineGrid, fusedCloud, baselineTimestamp, dangerThreshold, dailyRateThreshold]);


  return (
    <>
      <div className="mb-8 text-center md:text-left">
        <h1 className="font-headline text-4xl font-bold">{dictionary.displacement.title}</h1>
        <p className="text-muted-foreground">
          {dictionary.displacement.description}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card className="border-4 border-foreground shadow-lg">
          <CardHeader>
            <CardTitle>{dictionary.displacement.analysisControlTitle}</CardTitle>
            <CardDescription>
              {dictionary.displacement.analysisControlDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">{dictionary.displacement.alertConfigTitle}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="danger-threshold">{dictionary.displacement.immediateThresholdLabel}</Label>
                  <Input 
                    id="danger-threshold" 
                    type="number" 
                    value={dangerThreshold} 
                    onChange={(e) => setDangerThreshold(parseFloat(e.target.value))}
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily-rate-threshold">{dictionary.displacement.dailyRateLabel}</Label>
                  <Input 
                    id="daily-rate-threshold" 
                    type="number" 
                    value={dailyRateThreshold}
                    onChange={(e) => setDailyRateThreshold(parseFloat(e.target.value))}
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
               <p className="text-sm text-muted-foreground">
                {dictionary.displacement.pointCloudSize}: <span className="font-bold text-foreground">{fusedCloud.length}</span>
              </p>
              <Button
                onClick={handleSetBaseline}
                disabled={isSetting || fusedCloud.length === 0}
                className="w-full"
                size="lg"
              >
                {isSetting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <DraftingCompass className="mr-2 h-4 w-4" />
                )}
                {dictionary.displacement.setBaselineButton}
              </Button>
               <div className="grid grid-cols-2 gap-2 w-full">
                <Button onClick={() => handleBuzzer(true)} variant="outline">
                  <Volume2 className="mr-2 h-4 w-4" />
                  {dictionary.displacement.testBuzzerButton}
                </Button>
                <Button onClick={() => handleBuzzer(false)} variant="destructive" disabled={!isDanger}>
                  <BellOff className="mr-2 h-4 w-4" />
                  {dictionary.displacement.stopBuzzerButton}
                </Button>
              </div>
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{dictionary.displacement.howItWorksTitle}</AlertTitle>
              <AlertDescription>
                 <ol className="list-decimal list-inside space-y-2 mt-2">
                  <li>{dictionary.displacement.howItWorksStep1}</li>
                  <li>{dictionary.displacement.howItWorksStep2.replace('{size}', String(fusedCloud.length))}</li>
                  <li>{dictionary.displacement.howItWorksStep3}</li>
                  <li>{dictionary.displacement.howItWorksStep4}</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className={`border-4 shadow-lg ${isDanger ? 'border-destructive' : 'border-foreground'}`}>
          <CardHeader>
            <CardTitle>{dictionary.displacement.statusTitle}</CardTitle>
            <CardDescription>{dictionary.displacement.statusDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {!baselineGrid ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                <p>{dictionary.displacement.setBaselinePrompt}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {isDanger && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{dictionary.displacement.dangerTitle}</AlertTitle>
                    <AlertDescription>
                      {dictionary.displacement.dangerDescription}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><MoveVertical className="h-4 w-4" /> {dictionary.displacement.averageDisplacementLabel}</p>
                    <p className={`text-4xl md:text-5xl font-bold font-mono transition-colors ${isDanger ? 'text-destructive' : 'text-primary'}`}>
                      {averageDisplacement.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">{dictionary.displacement.unit}</p>
                  </div>
                   <div className="text-center bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1"><CalendarClock className="h-4 w-4" /> {dictionary.displacement.dailyRateLabel}</p>
                    <p className={`text-4xl md:text-5xl font-bold font-mono transition-colors ${isDanger ? 'text-destructive' : 'text-primary'}`}>
                      {dailyRate.toFixed(3)}
                    </p>
                    <p className="text-sm text-muted-foreground">cm/day</p>
                  </div>
                </div>
                 <div className="text-center text-xs text-muted-foreground">
                  <p>{dictionary.displacement.thresholdInfo.replace('{threshold}', String(dangerThreshold))}</p>
                  <p>{dictionary.displacement.lastUpdated}: {lastUpdateTime ? new Date(lastUpdateTime).toLocaleTimeString() : 'N/A'}</p>
                  {baselineTimestamp && <p>{dictionary.displacement.baselineSet}: {new Date(baselineTimestamp).toLocaleString()}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
