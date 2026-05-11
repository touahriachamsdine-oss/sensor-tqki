
'use client';

import React, { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import type { SensorReading, ObjectPosition, Point3D, SensorOffsets, AppState, PlaybackState } from '@/types';
import { fusePointClouds, estimateObjectPosition } from '@/lib/data-processing';

// Updated offsets based on user's new description
const correctedOffsets: SensorOffsets = {
  front: { x: 0, y: 6.5, z: 0 },   // Middle sensor, raised by 6.5cm
  left: { x: -8, y: 4.5, z: 0 },   // 8cm to the left, 2cm under the middle one (6.5 - 2 = 4.5)
  right: { x: 8, y: 4.5, z: 0 },   // 8cm to the right, 2cm under the middle one (6.5 - 2 = 4.5)
};

const DATA_STALE_THRESHOLD_MS = 5000; // 5 seconds
const MAX_HISTORY_LENGTH = 1000;
const FETCH_INTERVAL_MS = 1000; // Poll every 1s

const SensorDataContext = createContext<AppState | undefined>(undefined);

export const SensorDataProvider = ({ children }: { children: ReactNode }) => {
  const [readings, setReadings] = useState<{ [key: string]: SensorReading | null }>({
    frontSensor: null,
    leftSensor: null,
    rightSensor: null,
  });
  const [fusedCloud, setFusedCloud] = useState<Point3D[]>([]);
  const [objectPosition, setObjectPosition] = useState<ObjectPosition | null>(null);
  const [history, setHistory] = useState<ObjectPosition[]>([]);
  const [offsets, setOffsets] = useState<SensorOffsets>(correctedOffsets);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState<ObjectPosition[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    index: 0,
    startTime: 0,
  });

  const [isPaused, setIsPaused] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const latestReadingsRef = useRef(readings);
  latestReadingsRef.current = readings;

  // NEON DATABASE POLLING (Replaces Firebase onValue)
  useEffect(() => {
    if (playbackState.isPlaying || isPaused) return;

    const fetchData = async () => {
      try {
        const response = await fetch('/api/sensors');
        if (response.ok) {
          const data = await response.json();
          setReadings(prev => ({
            frontSensor: data.frontSensor || prev.frontSensor,
            leftSensor: data.leftSensor || prev.leftSensor,
            rightSensor: data.rightSensor || prev.rightSensor,
          }));
          setLastUpdateTime(Date.now());
        }
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    };

    const interval = setInterval(fetchData, FETCH_INTERVAL_MS);
    fetchData(); // Initial fetch

    return () => clearInterval(interval);
  }, [playbackState.isPlaying, isPaused]);

  // LIVE DATA PROCESSING
  useEffect(() => {
    if (playbackState.isPlaying || isPaused) return; 

    const availableReadings = Object.values(latestReadingsRef.current).filter(Boolean) as SensorReading[];
    
    if (availableReadings.length > 0) {
      const readingsDict: { [key: string]: SensorReading } = {};
      availableReadings.forEach(r => {
        readingsDict[r.sensorId] = r; 
      });
      
      const newCloud = fusePointClouds(readingsDict, offsets);
      
      if (isScanning) {
        setFusedCloud(prevCloud => [...prevCloud, ...newCloud]);
      } else {
        setFusedCloud(newCloud);
      }

      const cloudForObjectDetection = isScanning ? [...fusedCloud, ...newCloud] : newCloud;
      const position = estimateObjectPosition(cloudForObjectDetection);
      const timestamp = Date.now();
      
      let newObjectPosition: ObjectPosition | null = null;
      if (position) {
        newObjectPosition = { 
          position, 
          timestamp,
          readings: latestReadingsRef.current 
        };
        setObjectPosition(newObjectPosition);
      } else {
        setObjectPosition(null);
      }

      setHistory(prev => {
        const entryToAdd = newObjectPosition || { position: {x:0,y:0,z:0}, timestamp, readings: latestReadingsRef.current, isEmpty: true };
        if (isRecording) {
            setRecordedData(rec => [...rec, entryToAdd]);
        }

        if (!newObjectPosition) return prev;

        if (!prev.length) return [newObjectPosition];
        
        const lastPos = prev[0].position;
        const dist = Math.sqrt(
            Math.pow(lastPos.x - position!.x, 2) +
            Math.pow(lastPos.y - position!.y, 2) +
            Math.pow(lastPos.z - position!.z, 2)
        );
        if (dist > 1) { 
            return [newObjectPosition, ...prev].slice(0, MAX_HISTORY_LENGTH);
        }
        return prev;
      });
    } else {
       setFusedCloud([]);
       setObjectPosition(null);
    }
  }, [readings, offsets, playbackState.isPlaying, isRecording, isPaused, isScanning]);
  
  // STALE DATA CHECK
  useEffect(() => {
    if (playbackState.isPlaying || isPaused) return;

    const interval = setInterval(() => {
      if (lastUpdateTime && (Date.now() - lastUpdateTime > DATA_STALE_THRESHOLD_MS)) {
        setReadings({ frontSensor: null, leftSensor: null, rightSensor: null });
        setLastUpdateTime(null);
      }
    }, DATA_STALE_THRESHOLD_MS / 2);

    return () => clearInterval(interval);
  }, [lastUpdateTime, playbackState.isPlaying, isPaused]);

  // PLAYBACK LOGIC
  useEffect(() => {
    if (!playbackState.isPlaying || recordedData.length === 0) return;

    let animationFrameId: number;
    const playbackLoop = () => {
      if (!playbackState.isPlaying) return;

      const { index, startTime } = playbackState;
      const elapsedTime = Date.now() - startTime;
      
      let nextIndex = index;
      while (nextIndex < recordedData.length -1 && (recordedData[nextIndex].timestamp - recordedData[0].timestamp < elapsedTime)) {
        nextIndex++;
      }

      const currentFrame = recordedData[nextIndex];

      if (currentFrame.readings) {
          setReadings(currentFrame.readings);
      }
      if (!currentFrame.isEmpty) {
        setObjectPosition(currentFrame);
      } else {
        setObjectPosition(null);
      }
      
      const availableReadings = Object.values(currentFrame.readings || {}).filter(Boolean) as SensorReading[];
      const readingsDict: { [key: string]: SensorReading } = {};
      availableReadings.forEach(r => { readingsDict[r.sensorId] = r; });
      setFusedCloud(fusePointClouds(readingsDict, offsets));

      if (nextIndex >= recordedData.length - 1) {
        setPlaybackState({ isPlaying: false, index: 0, startTime: 0 });
      } else {
        setPlaybackState(prev => ({ ...prev, index: nextIndex }));
      }
      animationFrameId = requestAnimationFrame(playbackLoop);
    };
    
    animationFrameId = requestAnimationFrame(playbackLoop);
    return () => cancelAnimationFrame(animationFrameId);

  }, [playbackState, recordedData, offsets]);


  const startRecording = () => {
    setRecordedData([]);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };
  
  const startPlayback = () => {
    if (recordedData.length === 0) return;
    setIsPaused(false);
    setPlaybackState({ isPlaying: true, index: 0, startTime: Date.now() });
  };
  
  const pauseProcessing = () => {
    setIsPaused(true);
  };

  const resumeProcessing = () => {
    setIsPaused(false);
  };
  
  const startScanning = () => setIsScanning(true);
  const stopScanning = () => setIsScanning(false);
  const clearFusedCloud = () => setFusedCloud([]);

  const frontReading = readings.frontSensor;
  const leftReading = readings.leftSensor;
  const rightReading = readings.rightSensor;

  const value: AppState = { 
    frontReading, 
    leftReading, 
    rightReading, 
    fusedCloud, 
    objectPosition, 
    history, 
    offsets, 
    setOffsets, 
    lastUpdateTime,
    isRecording,
    recordedData,
    playbackState,
    startRecording,
    stopRecording,
    startPlayback,
    isPaused,
    pauseProcessing,
    resumeProcessing,
    isScanning,
    startScanning,
    stopScanning,
    clearFusedCloud,
  };

  return (
    <SensorDataContext.Provider value={value}>
      {children}
    </SensorDataContext.Provider>
  );
};

export const useSensorData = (): AppState => {
  const context = useContext(SensorDataContext);
  if (context === undefined) {
    throw new Error('useSensorData must be used within a SensorDataProvider');
  }
  return context;
};
