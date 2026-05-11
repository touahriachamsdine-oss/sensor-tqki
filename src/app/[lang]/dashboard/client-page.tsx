
'use client';

import { useSensorData } from '@/hooks/use-sensor-data';
import HeatmapGrid from '@/components/dashboard/heatmap-grid';
import ObjectPositionDisplay from '@/components/dashboard/object-position';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FsIcon } from '@/components/icons/fs-icon';
import { Button } from '@/components/ui/button';
import { Circle, Play, Square, Pause } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDictionary } from '@/hooks/use-dictionary';


function PlaybackControls() {
  const {
    isRecording,
    recordedData,
    playbackState,
    startRecording,
    stopRecording,
    startPlayback,
    isPaused,
    pauseProcessing,
    resumeProcessing,
  } = useSensorData();
  const { dictionary } = useDictionary();

  const isPlaying = playbackState.isPlaying;

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={isPaused ? resumeProcessing : pauseProcessing}
              disabled={isRecording || isPlaying}
            >
              {isPaused ? <Play className="fill-current" /> : <Pause className="fill-current" />}
              <span className="sr-only">{isPaused ? 'Resume' : 'Pause'}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isPaused ? 'Resume Live Data' : 'Pause Live Data'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>


      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isPlaying}
            >
              {isRecording ? <Square className="text-destructive-foreground fill-current" /> : <Circle className="text-destructive fill-current" />}
              <span className="sr-only">{isRecording ? dictionary.dashboard.stopRecording : dictionary.dashboard.startRecording}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isRecording ? dictionary.dashboard.stopRecording : dictionary.dashboard.recordSession}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
             <Button
                variant="outline"
                size="icon"
                onClick={startPlayback}
                disabled={isPlaying || recordedData.length === 0 || isRecording}
              >
                <Play className="fill-current" />
                <span className="sr-only">{dictionary.dashboard.playback}</span>
              </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{dictionary.dashboard.playback} ({recordedData.length} {dictionary.dashboard.frames})</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isPlaying && <Badge variant="secondary" className="animate-pulse">{dictionary.dashboard.playingBadge}</Badge>}
      {isRecording && <Badge variant="destructive" className="animate-pulse">{dictionary.dashboard.recordingBadge}</Badge>}
      {isPaused && !isPlaying && <Badge variant="outline">Paused</Badge>}
    </div>
  );
}


export default function DashboardClientPage() {
  const { frontReading, leftReading, rightReading, objectPosition } = useSensorData();
  const { dictionary } = useDictionary();

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div className="text-center md:text-left">
          <h1 className="font-headline text-4xl font-bold">{dictionary.dashboard.title}</h1>
          <p className="text-muted-foreground">{dictionary.dashboard.description}</p>
        </div>
        <PlaybackControls />
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          <Card className="border-4 border-foreground shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FsIcon className="h-6 w-6 text-primary" />
                {dictionary.dashboard.frontSensor}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {frontReading ? <HeatmapGrid data={frontReading.matrix} /> : <Skeleton className="h-48 w-full" />}
            </CardContent>
          </Card>

          <Card className="border-4 border-foreground shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FsIcon className="h-6 w-6 text-primary" />
                {dictionary.dashboard.leftSensor}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leftReading ? <HeatmapGrid data={leftReading.matrix} /> : <Skeleton className="h-48 w-full" />}
            </CardContent>
          </Card>

          <Card className="border-4 border-foreground shadow-lg sm:col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FsIcon className="h-6 w-6 text-primary" />
                {dictionary.dashboard.rightSensor}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rightReading ? <HeatmapGrid data={rightReading.matrix} /> : <Skeleton className="h-48 w-full" />}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <ObjectPositionDisplay position={objectPosition?.position} timestamp={objectPosition?.timestamp} />
        </div>
      </div>
    </>
  );
}
