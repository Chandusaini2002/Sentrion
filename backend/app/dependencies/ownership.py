from fastapi import HTTPException
from app.models.camera import Camera

def validate_camera_owner(db, camera_id, owner_id):
    if camera_id is None:
        return
    camera = db.get(Camera, camera_id)
    if not camera or camera.owner_id != owner_id:
        raise HTTPException(404, "Camera not found.")
