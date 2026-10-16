from __future__ import annotations

import random
import time
from datetime import datetime, timedelta, timezone


CAMERAS = [
    {
        "id": "visitor-cam-1",
        "name": "Front entrance",
        "location": "Main building · Ground floor",
        "address": "192.0.2.10",
        "connection_type": "rtsp",
        "status": "online",
        "has_credentials": True,
        "is_enabled": True,
        "people_detected": 2,
        "stream_path": "/public-media/front-entrance.mp4",
    },
    {
        "id": "visitor-cam-2",
        "name": "Rear parking lot",
        "location": "West wing · Level 1",
        "address": "192.0.2.11",
        "connection_type": "rtsp",
        "status": "online",
        "has_credentials": True,
        "is_enabled": True,
        "people_detected": 0,
        "stream_path": "/public-media/rear-parking.mp4",
    },
    {
        "id": "visitor-cam-3",
        "name": "Main corridor",
        "location": "Main building · Level 1",
        "address": "192.0.2.12",
        "connection_type": "network_camera",
        "status": "online",
        "has_credentials": True,
        "is_enabled": True,
        "people_detected": 3,
        "stream_path": "/public-media/main-corridor.mp4",
    },
    {
        "id": "visitor-cam-4",
        "name": "Loading dock",
        "location": "Warehouse · Rear access",
        "address": "192.0.2.13",
        "connection_type": "ip_camera",
        "status": "offline",
        "has_credentials": True,
        "is_enabled": True,
        "people_detected": 0,
        "stream_path": "/public-media/loading-dock.mp4",
    },
    {
        "id": "visitor-cam-5",
        "name": "Server room",
        "location": "East wing · Level 2",
        "address": "192.0.2.14",
        "connection_type": "rtsp",
        "status": "online",
        "has_credentials": True,
        "is_enabled": True,
        "people_detected": 1,
        "stream_path": "/public-media/server-room.mp4",
    },
    {
        "id": "visitor-cam-6",
        "name": "West gate",
        "location": "Perimeter · Vehicle gate",
        "address": "192.0.2.15",
        "connection_type": "rtsp",
        "status": "online",
        "has_credentials": True,
        "is_enabled": True,
        "people_detected": 1,
        "stream_path": "/public-media/west-gate.mp4",
    },
]

_ALERT_TYPES = [
    ("Unknown person detected", "Person not matched to an authorized profile", "critical"),
    ("Motion detected", "Movement detected inside the configured monitoring zone", "medium"),
    ("Vehicle detected", "Vehicle entered the monitored parking area", "low"),
    ("Camera disconnected", "Camera stream stopped responding", "high"),
    ("Person detected", "Person entered the monitored area", "medium"),
    ("Restricted area activity", "Movement detected near a restricted access point", "high"),
]


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def get_cameras() -> list[dict]:
    now = _utcnow()
    items: list[dict] = []
    for index, camera in enumerate(CAMERAS):
        online = camera["status"] == "online"
        last_seen = now - timedelta(seconds=(index + 1) * 19 if online else 3 * 60 * 60)
        items.append(
            {
                **camera,
                "last_connection_at": last_seen.isoformat(),
                "last_activity_at": (now - timedelta(seconds=(index + 1) * 11)).isoformat() if online else None,
                # Keep a recorded preview available for every sample camera.
                # Live Monitoring still respects the camera online/offline status.
                "stream_url": camera["stream_path"],
            }
        )
    return items


def get_alerts() -> list[dict]:
    # Advance by one event every 8 seconds. Older rows remain in the list,
    # so the table feels like a live feed instead of completely reshuffling.
    newest_bucket = int(time.time() // 8)
    online_cameras = [c for c in CAMERAS if c["status"] == "online"]
    alerts: list[dict] = []

    for index in range(6):
        bucket = newest_bucket - index
        rng = random.Random(bucket)
        camera = rng.choice(online_cameras)
        alert_type, info, severity = rng.choice(_ALERT_TYPES)
        if alert_type == "Camera disconnected":
            camera = next(c for c in CAMERAS if c["status"] == "offline")
        occurred = datetime.fromtimestamp(bucket * 8, tz=timezone.utc)
        alerts.append(
            {
                "id": f"visitor-alert-{bucket}",
                "camera_id": camera["id"],
                "camera_name": camera["name"],
                "type": alert_type,
                "detection_info": info,
                "severity": severity,
                "status": "unresolved" if index < 4 else "resolved",
                "occurred_at": occurred.isoformat(),
            }
        )
    return alerts


def get_events(limit: int = 5) -> list[dict]:
    alerts = get_alerts()[: max(1, min(limit, 20))]
    return [
        {
            "id": item["id"].replace("alert", "event"),
            "camera_id": item["camera_id"],
            "camera_name": item["camera_name"],
            "event_type": item["type"],
            "detection_result": item["detection_info"],
            "severity": item["severity"],
            "status": item["status"],
            "occurred_at": item["occurred_at"],
        }
        for item in alerts
    ]


def get_dashboard_summary() -> dict:
    cameras = get_cameras()
    alerts = get_alerts()
    return {
        "total_cameras": len(cameras),
        "cameras_online": sum(1 for c in cameras if c["status"] == "online"),
        "cameras_offline": sum(1 for c in cameras if c["status"] == "offline"),
        "active_alerts": sum(1 for a in alerts if a["status"] == "unresolved"),
        "people_detected_today": sum(int(c["people_detected"]) for c in cameras),
        "security_events_7d": 27,
    }


def get_notifications() -> list[dict]:
    alerts = get_alerts()[:3]
    severity_map = {"critical": "critical", "high": "warning", "medium": "warning", "low": "info"}
    return [
        {
            "id": f"visitor-notification-{a['id']}",
            "title": a["type"],
            "message": f"{a['camera_name']}: {a['detection_info']}",
            "severity": severity_map[a["severity"]],
            "is_read": False,
            "created_at": a["occurred_at"],
        }
        for a in alerts
    ]


def get_detection(camera_id: str) -> dict:
    bucket = int(time.time() // 6)
    rng = random.Random(f"{camera_id}-{bucket}")
    people = rng.randint(0, 4)
    return {
        "camera_id": camera_id,
        "people_count": people,
        "faces_recognized": rng.randint(0, people),
        "confidence": round(rng.uniform(0.84, 0.98), 2),
        "unknown_person": people > 0 and rng.random() > 0.65,
        "updated_at": _utcnow().isoformat(),
    }
