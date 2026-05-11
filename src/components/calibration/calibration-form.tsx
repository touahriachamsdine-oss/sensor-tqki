
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Loader2, Sparkles, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDictionary } from '@/hooks/use-dictionary';


// Dummy types as the originals from the flow are removed
type CalibrateSensorOffsetsOutput = {
  calibratedOffsets: {
      frontOffsetX: number;
      frontOffsetY: number;
      frontOffsetZ: number;
      leftOffsetX: number;
      leftOffsetY: number;
      leftOffsetZ: number;
      rightOffsetX: number;
      rightOffsetY: number;
      rightOffsetZ: number;
  },
  confidence: number;
  adjustmentSummary: string;
};


const formSchema = z.object({
  knownPointCloudDataUri: z.any().refine(file => file?.length == 1, 'Known point cloud file is required.'),
  sensorReadingsDataUri: z.any().refine(file => file?.length == 1, 'Sensor readings file is required.'),
  frontOffsetX: z.coerce.number(),
  frontOffsetY: z.coerce.number(),
  frontOffsetZ: z.coerce.number(),
  leftOffsetX: z.coerce.number(),
  leftOffsetY: z.coerce.number(),
  leftOffsetZ: z.coerce.number(),
  rightOffsetX: z.coerce.number(),
  rightOffsetY: z.coerce.number(),
  rightOffsetZ: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CalibrationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CalibrateSensorOffsetsOutput | null>(null);
  const { dictionary } = useDictionary();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      frontOffsetX: 0,
      frontOffsetY: 0,
      frontOffsetZ: 10,
      leftOffsetX: -15,
      leftOffsetY: 0,
      leftOffsetZ: 0,
      rightOffsetX: 15,
      rightOffsetY: 0,
      rightOffsetZ: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setResult(null);
    
    toast({
        title: dictionary.calibration.toastUnavailableTitle,
        description: dictionary.calibration.toastUnavailableDescription,
        variant: 'destructive',
        duration: 8000,
    });
    
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="mb-8 text-center md:text-left">
        <h1 className="font-headline text-4xl font-bold">{dictionary.calibration.title}</h1>
        <p className="text-muted-foreground">
         {dictionary.calibration.description}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <Card className="border-4 border-foreground shadow-lg">
          <CardHeader>
            <CardTitle>{dictionary.calibration.inputsCardTitle}</CardTitle>
            <CardDescription>{dictionary.calibration.inputsCardDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="knownPointCloudDataUri"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{dictionary.calibration.knownPointCloudLabel}</FormLabel>
                        <FormControl>
                          <Input type="file" accept=".ply,.xyz" onChange={e => field.onChange(e.target.files)} />
                        </FormControl>
                        <FormDescription>{dictionary.calibration.knownPointCloudDescription}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sensorReadingsDataUri"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{dictionary.calibration.sensorReadingsLabel}</FormLabel>
                        <FormControl>
                          <Input type="file" accept=".ply,.xyz" onChange={e => field.onChange(e.target.files)} />
                        </FormControl>
                        <FormDescription>{dictionary.calibration.sensorReadingsDescription}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <h3 className="text-lg font-semibold">{dictionary.calibration.initialOffsetsTitle}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[ 'front', 'left', 'right' ].map(sensor => (
                    <div key={sensor} className="space-y-2 p-3 border rounded-md">
                       <h4 className="font-medium capitalize">{dictionary.calibration.sensorNames[sensor as keyof typeof dictionary.calibration.sensorNames]}</h4>
                      <FormField
                        control={form.control}
                        name={`${sensor}OffsetX` as keyof FormValues}
                        render={({ field }) => <FormItem><FormLabel>X</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>}
                      />
                       <FormField
                        control={form.control}
                        name={`${sensor}OffsetY` as keyof FormValues}
                        render={({ field }) => <FormItem><FormLabel>Y</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>}
                      />
                       <FormField
                        control={form.control}
                        name={`${sensor}OffsetZ` as keyof FormValues}
                        render={({ field }) => <FormItem><FormLabel>Z</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>}
                      />
                    </div>
                  ))}
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>{dictionary.calibration.howToUseTitle}</AlertTitle>
                  <AlertDescription>
                     <ol className="list-decimal list-inside space-y-2 mt-2">
                      <li>{dictionary.calibration.howToUseStep1}</li>
                      <li>{dictionary.calibration.howToUseStep2}</li>
                      <li>{dictionary.calibration.howToUseStep3}</li>
                      <li>{dictionary.calibration.howToUseStep4}</li>
                      <li>{dictionary.calibration.howToUseStep5}</li>
                    </ol>
                  </AlertDescription>
                </Alert>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="mr-2 h-4 w-4" />
                  )}
                  {dictionary.calibration.calibrateButton}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-4 border-foreground shadow-lg">
          <CardHeader>
            <CardTitle>{dictionary.calibration.resultsCardTitle}</CardTitle>
            <CardDescription>{dictionary.calibration.resultsCardDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitting && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">{dictionary.calibration.analyzingText}</p>
              </div>
            )}
            {result && (
              <div className="space-y-6">
                  <div>
                      <h3 className="font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" /> {dictionary.calibration.adjustmentSummaryTitle}</h3>
                      <p className="text-sm text-muted-foreground mt-1 bg-muted p-3 rounded-md">{result.adjustmentSummary}</p>
                  </div>
                   <div>
                      <h3 className="font-semibold">{dictionary.calibration.confidenceScoreTitle}</h3>
                      <div className="flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2.5">
                              <div className="bg-accent h-2.5 rounded-full" style={{ width: `${result.confidence * 100}%` }}></div>
                          </div>
                          <span className="font-mono font-bold">{(result.confidence * 100).toFixed(0)}%</span>
                      </div>
                  </div>
                <div>
                  <h3 className="font-semibold">{dictionary.calibration.calibratedOffsetsTitle}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                     {Object.entries(result.calibratedOffsets).reduce((acc, [key, value], i) => {
                          const index = Math.floor(i / 3);
                          if (!acc[index]) acc[index] = [];
                          acc[index].push({ key, value });
                          return acc;
                      }, [] as {key: string; value: number}[][]).map((group, i) => (
                          <div key={i} className="p-3 border rounded-md space-y-1 bg-muted/50">
                              <h4 className="font-medium capitalize">{group[0].key.replace(/OffsetX$/, '')} Sensor</h4>
                              {group.map(({key, value}) => (
                                  <div key={key} className="flex justify-between items-center text-sm">
                                      <span className="text-muted-foreground">{key.slice(-1)}:</span>
                                      <span className="font-mono font-semibold">{value.toFixed(2)}</span>
                                  </div>
                              ))}
                          </div>
                     ))}
                  </div>
                </div>
              </div>
            )}
            {!isSubmitting && !result && (
               <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground">
                  <p>{dictionary.calibration.submitPrompt}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
