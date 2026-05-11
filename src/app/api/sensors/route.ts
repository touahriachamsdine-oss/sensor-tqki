import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { sensorId, matrix, timestamp } = data;

    if (!sensorId || !matrix || timestamp === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert the sensor first to ensure it exists
    await prisma.sensor.upsert({
      where: { sensorId },
      update: {},
      create: { sensorId },
    });

    // Create the reading
    const reading = await prisma.reading.create({
      data: {
        sensorId,
        matrix,
        timestamp: BigInt(timestamp),
      },
    });

    // Return success
    return NextResponse.json({ success: true, id: reading.id });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get the latest reading for each sensor
    const sensors = ['frontSensor', 'leftSensor', 'rightSensor'];
    const latestReadings = await Promise.all(
      sensors.map(async (id) => {
        return prisma.reading.findFirst({
          where: { sensorId: id },
          orderBy: { timestamp: 'desc' },
        });
      })
    );

    // Format for frontend
    const result: any = {};
    latestReadings.forEach((r, i) => {
      if (r) {
        result[sensors[i]] = {
          ...r,
          timestamp: Number(r.timestamp), // Convert BigInt to Number for JSON
        };
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
