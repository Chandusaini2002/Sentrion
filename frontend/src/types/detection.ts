/**
 * AI computer-vision detection data shown on the Live Monitoring page.
 * Mirrors the future FastAPI `DetectionSnapshot` schema, populated by
 * the YOLO / face-matching pipeline and pushed over WebSocket.
 */
export interface RecognizedProfile {
  id: string
  name: string
  initials: string
  matchedAt: string
  confidence: number
}

export interface DetectionEvent {
  id: string
  label: string
  timestamp: string
  severity: 'info' | 'warning' | 'critical'
}

export interface DetectionSnapshot {
  cameraId: string
  peopleDetected: number
  faceDetections: number
  detectionConfidence: number
  unknownPersonDetected: boolean
  recognizedProfiles: RecognizedProfile[]
  recentEvents: DetectionEvent[]
}
