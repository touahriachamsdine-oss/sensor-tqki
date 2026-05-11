
export type SensorReading = {
  id: string;
  sensorId: 'frontSensor' | 'leftSensor' | 'rightSensor';
  matrix: number[][]; // 8x8 depth values in mm
  timestamp: number;
};

export type Point3D = {
  x: number;
  y: number;
  z: number;
};

export type ObjectPosition = {
  position: Point3D;
  timestamp: number;
  // Used for playback
  readings?: { [key: string]: SensorReading | null };
  isEmpty?: boolean; // To signify a frame with no object
};

export type SensorOffsets = {
  front: Point3D;
  left: Point3D;
  right: Point3D;
};


export type PlaybackState = {
  isPlaying: boolean;
  index: number;
  startTime: number;
};

export type AppState = {
  frontReading: SensorReading | null;
  leftReading: SensorReading | null;
  rightReading: SensorReading | null;
  fusedCloud: Point3D[];
  objectPosition: ObjectPosition | null;
  history: ObjectPosition[];
  offsets: SensorOffsets;
  setOffsets: (offsets: SensorOffsets) => void;
  lastUpdateTime: number | null;
  isRecording: boolean;
  recordedData: ObjectPosition[];
  playbackState: PlaybackState;
  startRecording: () => void;
  stopRecording: () => void;
  startPlayback: () => void;
  isPaused: boolean;
  pauseProcessing: () => void;
  resumeProcessing: () => void;
  isScanning: boolean;
  startScanning: () => void;
  stopScanning: () => void;
  clearFusedCloud: () => void;
};
