
import type { Point3D, SensorReading, SensorOffsets } from '@/types';

const SENSOR_FOV_DEGREES = 45;
const SENSOR_RESOLUTION = 8;

/**
 * Converts a single sensor's 8x8 depth matrix to a point cloud.
 * @param reading - The sensor reading with the 8x8 matrix.
 * @param offset - The sensor's (x, y, z) offset in cm.
 * @param orientation - 'front', 'left', or 'right'.
 * @returns An array of 3D points.
 */
function sensorToPoints(reading: SensorReading, offset: Point3D, orientation: 'front' | 'left' | 'right'): Point3D[] {
  const points: Point3D[] = [];
  const fovRadians = (SENSOR_FOV_DEGREES * Math.PI) / 180;
  const anglePerPixel = fovRadians / SENSOR_RESOLUTION;
  const centerOffset = (SENSOR_RESOLUTION - 1) / 2;

  if (!reading || !reading.matrix) return [];

  for (let row = 0; row < SENSOR_RESOLUTION; row++) {
    for (let col = 0; col < SENSOR_RESOLUTION; col++) {
      const depth = reading.matrix[row][col] / 10; // convert mm to cm
      if (depth <= 0) continue; // Ignore invalid readings

      // Angles relative to the sensor's center axis
      const angleX = (col - centerOffset) * anglePerPixel;
      const angleY = (row - centerOffset) * anglePerPixel;

      // Local coordinates from the sensor's perspective
      let localX = depth * Math.tan(angleX);
      let localY = depth * Math.tan(angleY);
      let localZ = depth;
      
      let worldX = 0, worldY = 0, worldZ = 0;

      // Rotate and translate to world coordinates based on orientation
      switch (orientation) {
        case 'front':
          // Sensor faces positive Z
          worldX = localX + offset.x;
          worldY = localY + offset.y;
          worldZ = localZ + offset.z;
          break;
        case 'left':
          // Sensor faces negative X
          worldX = -localZ + offset.x;
          worldY = localY + offset.y;
          worldZ = localX + offset.z;
          break;
        case 'right':
          // Sensor faces positive X
          worldX = localZ + offset.x;
          worldY = localY + offset.y;
          worldZ = -localX + offset.z;
          break;
      }

      points.push({ x: worldX, y: worldY, z: worldZ });
    }
  }

  return points;
}

/**
 * Fuses point clouds from multiple sensors into one coordinate system.
 * @param readings - An object containing readings from any available sensors.
 * @param offsets - The known offsets for each sensor.
 * @returns A single array of 3D points representing the fused cloud.
 */
export function fusePointClouds(
  readings: { [key: string]: SensorReading },
  offsets: SensorOffsets
): Point3D[] {
  let allPoints: Point3D[] = [];

  if (readings.frontSensor) {
    allPoints.push(...sensorToPoints(readings.frontSensor, offsets.front, 'front'));
  }
  if (readings.leftSensor) {
    allPoints.push(...sensorToPoints(readings.leftSensor, offsets.left, 'left'));
  }
  if (readings.rightSensor) {
    allPoints.push(...sensorToPoints(readings.rightSensor, offsets.right, 'right'));
  }

  return allPoints;
}

/**
 * Estimates the object position from a fused point cloud.
 * This is a simplified implementation that finds the centroid of the closest points.
 * @param fusedCloud - The fused point cloud.
 * @param distanceThreshold - The max distance from origin (cm) to consider a point part of an object.
 * @returns The estimated 3D position of the object or null if no object is found.
 */
export function estimateObjectPosition(fusedCloud: Point3D[], distanceThreshold: number = 200): Point3D | null {
  if (fusedCloud.length === 0) return null;

  // Filter points that are reasonably close to be considered an object
  const objectPoints = fusedCloud.filter(p => {
    const distance = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
    return distance > 0 && distance < distanceThreshold;
  });

  if (objectPoints.length === 0) return null;

  // For simplicity, we'll find the centroid of all these points.
  // A more advanced algorithm would use DBSCAN or similar to find the densest cluster.
  const centroid = objectPoints.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z }),
    { x: 0, y: 0, z: 0 }
  );

  centroid.x /= objectPoints.length;
  centroid.y /= objectPoints.length;
  centroid.z /= objectPoints.length;

  return centroid;
}
