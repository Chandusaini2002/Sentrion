/**
 * TEMPORARY UI DATA — replace with a live WebSocket subscription to
 * /ws/cameras/{cameraId}/detections once the YOLO / face-matching
 * pipeline is in place.
 */
import type { DetectionSnapshot } from '@/types'

export const mockDetectionByCamera: Record<string, DetectionSnapshot> = {
  cam_1: {
    cameraId: 'cam_1',
    peopleDetected: 2,
    faceDetections: 2,
    detectionConfidence: 96,
    unknownPersonDetected: true,
    recognizedProfiles: [
      {
        id: 'usr_1',
        name: 'Aditi Rao',
        initials: 'AR',
        matchedAt: '2026-09-04T08:57:03Z',
        confidence: 98,
      },
    ],
    recentEvents: [
      { id: 'de_1', label: 'Unknown person detected', timestamp: '2026-09-04T09:12:44Z', severity: 'critical' },
      { id: 'de_2', label: 'Face matched — Aditi Rao', timestamp: '2026-09-04T08:57:03Z', severity: 'info' },
      { id: 'de_3', label: 'Motion detected near entrance', timestamp: '2026-09-04T08:41:19Z', severity: 'warning' },
    ],
  },
}

export const defaultDetectionSnapshot: DetectionSnapshot = {
  cameraId: '',
  peopleDetected: 0,
  faceDetections: 0,
  detectionConfidence: 0,
  unknownPersonDetected: false,
  recognizedProfiles: [],
  recentEvents: [],
}
