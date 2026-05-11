
'use client';

import { useSensorData } from '@/hooks/use-sensor-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Wifi, CheckCircle, XCircle, Library } from 'lucide-react';
import type { SensorReading } from '@/types';
import { useDictionary } from '@/hooks/use-dictionary';

const SensorStatus = ({ name, reading }: { name: string; reading: SensorReading | null }) => {
  const isConnected = !!reading;
  const lastUpdate = reading ? new Date(reading.timestamp).toLocaleTimeString() : 'N/A';
  const { dictionary } = useDictionary();

  return (
    <div className="flex items-center justify-between rounded-lg bg-muted p-4">
      <div className="flex flex-col">
        <span className="font-semibold">{name}</span>
        <span className="text-xs text-muted-foreground">{dictionary.connect.lastUpdate}: {lastUpdate}</span>
      </div>
      <div className={`flex items-center gap-2 font-medium ${isConnected ? 'text-green-600' : 'text-destructive'}`}>
        {isConnected ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
        {isConnected ? dictionary.connect.connected : dictionary.connect.disconnected}
      </div>
    </div>
  );
};


export default function ConnectClientPage() {
  const { frontReading, leftReading, rightReading } = useSensorData();
  const { dictionary } = useDictionary();

  const arduinoCode = `/*
  FaresSensor_ESP32_Neon_HTTP.ino
*/

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "SparkFun_VL53L5CX_Library.h"

// ====================== WIFI ======================
#define WIFI_SSID       "YOUR_WIFI_SSID"
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"

// ====================== NEON API ======================
#define API_URL       "https://your-app.vercel.app/api/sensors"

// ====================== HARDWARE ======================
#define SDA_PIN 21
#define SCL_PIN 22
#define TCA_ADDR 0x70
#define BUZZER_PIN 12

// ====================== SENSORS ======================
const int NUM_SENSORS = 3;
const uint8_t SENSOR_CHANNELS[NUM_SENSORS] = {0, 1, 2};
const char* SENSOR_IDS[NUM_SENSORS] = {
  "frontSensor",
  "leftSensor",
  "rightSensor"
};

#define SENSOR_READ_INTERVAL 1000
#define TCA_SELECT_DELAY 15

// ====================== SENSOR OBJECTS ======================
SparkFun_VL53L5CX sensor0, sensor1, sensor2;
SparkFun_VL53L5CX* sensors[NUM_SENSORS] = { &sensor0, &sensor1, &sensor2 };
bool sensorOK[NUM_SENSORS] = {false};

// ====================== TCA SELECT ======================
bool safeTCASelect(uint8_t channel) {
  if (channel > 7) return false;
  Wire.beginTransmission(TCA_ADDR);
  Wire.write(1 << channel);
  if (Wire.endTransmission() != 0) return false;
  delay(TCA_SELECT_DELAY);
  return true;
}

void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  Wire.begin(SDA_PIN, SCL_PIN);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected");

  for (int i = 0; i < NUM_SENSORS; i++) {
    if (safeTCASelect(SENSOR_CHANNELS[i]) && sensors[i]->begin()) {
      sensors[i]->setResolution(64);
      sensors[i]->startRanging();
      sensorOK[i] = true;
    }
  }
}

void loop() {
  static unsigned long lastRead = 0;
  if (millis() - lastRead < SENSOR_READ_INTERVAL) return;
  lastRead = millis();

  if (WiFi.status() != WL_CONNECTED) return;

  for (int i = 0; i < NUM_SENSORS; i++) {
    if (!sensorOK[i] || !safeTCASelect(SENSOR_CHANNELS[i])) continue;

    VL53L5CX_ResultsData data;
    if (!sensors[i]->isDataReady() || !sensors[i]->getRangingData(&data)) continue;

    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<2048> doc;
    doc["sensorId"] = SENSOR_IDS[i];
    doc["timestamp"] = millis();
    JsonArray matrix = doc.createNestedArray("matrix");
    for (int y = 0; y < 8; y++) {
      JsonArray row = matrix.createNestedArray();
      for (int x = 0; x < 8; x++) row.add(data.distance_mm[y * 8 + x]);
    }

    String body;
    serializeJson(doc, body);
    int code = http.POST(body);
    
    if (code > 0) Serial.printf("📡 %s sent: %d\\n", SENSOR_IDS[i], code);
    else Serial.println("❌ Send failed");
    
    http.end();
  }
}
`;

  return (
    <>
      <div className="mb-8 text-center md:text-left">
        <h1 className="font-headline text-4xl font-bold">{dictionary.connect.title}</h1>
        <p className="text-muted-foreground">
          {dictionary.connect.description}
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="border-4 border-foreground shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-6 w-6 text-primary" />
                {dictionary.connect.cardTitle}
              </CardTitle>
              <CardDescription>
                {dictionary.connect.cardDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold">{dictionary.connect.firstStepsTitle}</h3>
                <ol className="list-decimal list-inside text-muted-foreground mt-2 space-y-2">
                  <li>{dictionary.connect.firstStep1}</li>
                  <li>{dictionary.connect.firstStep2}</li>
                  <li>{dictionary.connect.firstStep3}</li>
                </ol>
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Library className="h-5 w-5" />
                  {dictionary.connect.librarySetupTitle}
                </h3>
                <p className="text-muted-foreground mt-2">
                  {dictionary.connect.librarySetupDescription}
                </p>
                <ol className="list-decimal list-inside text-muted-foreground mt-2 space-y-1 pl-4">
                  <li><b className="text-foreground">Firebase ESP Client</b> by Mobizt</li>
                  <li><b className="text-foreground">SparkFun VL53L5CX</b> by SparkFun Electronics</li>
                </ol>
              </div>
               <div>
                <h3 className="font-semibold">{dictionary.connect.wifiCredentialsTitle}</h3>
                <p className="text-muted-foreground mt-2">
                  {dictionary.connect.wifiCredentialsDescription}
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>{dictionary.connect.wifiCredentialsInstruction}</li>
                </ul>
              </div>
               <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {dictionary.connect.sketchTitle}
                </h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  {dictionary.connect.sketchDescription}
                </p>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                  <code>{arduinoCode}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
           <Card className="border-4 border-foreground shadow-lg sticky top-20">
            <CardHeader>
              <CardTitle>{dictionary.connect.statusTitle}</CardTitle>
              <CardDescription>{dictionary.connect.statusDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SensorStatus name={dictionary.connect.frontSensor} reading={frontReading} />
              <SensorStatus name={dictionary.connect.leftSensor} reading={leftReading} />
              <SensorStatus name={dictionary.connect.rightSensor} reading={rightReading} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
