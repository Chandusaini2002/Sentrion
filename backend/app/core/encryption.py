"""Authenticated encryption for existing write-only camera fields."""
from cryptography.fernet import Fernet
from sqlalchemy import Text
from sqlalchemy.types import TypeDecorator
from app.core.config import settings

def cipher():
    return Fernet(settings.CAMERA_ENCRYPTION_KEY.encode())

class EncryptedText(TypeDecorator):
    impl = Text
    cache_ok = True
    def process_bind_param(self, value, dialect):
        return cipher().encrypt(value.encode()).decode() if value is not None else None
    def process_result_value(self, value, dialect):
        return cipher().decrypt(value.encode()).decode() if value is not None else None
