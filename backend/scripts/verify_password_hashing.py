"""
Standalone sanity check for the bcrypt/passlib fix — run this before
scripts/seed_dev_data.py if you want to confirm hashing works in
isolation, independent of the database.

Usage (from backend/, with the venv active and requirements installed):
    python -m scripts.verify_password_hashing
"""
from app.core.security import hash_password, verify_password


def main() -> None:
    import bcrypt
    import passlib

    print(f"passlib version: {passlib.__version__}")
    print(f"bcrypt version:  {getattr(bcrypt, '__about__', None) and bcrypt.__about__.__version__ or bcrypt.__version__}")

    password = "changeme123"
    hashed = hash_password(password)
    assert hashed != password, "hash_password returned the plaintext — something is very wrong"
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$"), f"unexpected hash format: {hashed}"
    print(f"hash_password('{password}') -> {hashed}")

    assert verify_password(password, hashed) is True, "verify_password failed to match the correct password"
    assert verify_password("wrong-password", hashed) is False, "verify_password incorrectly matched a wrong password"

    print("OK — hashing and verification both work correctly.")


if __name__ == "__main__":
    main()
