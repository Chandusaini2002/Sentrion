"""
Sentrion API application package.

This check runs the moment anything under `app` is imported (by
uvicorn, Alembic's env.py, or scripts/*.py) — before SQLAlchemy ever
tries to evaluate a model's type annotations.

Why this exists: the models/schemas throughout this project use PEP 604
union syntax (e.g. `Mapped[str | None]`), which requires the `|` operator
to work between types. That operator support was added in Python 3.10.
On Python 3.9 or older, SQLAlchemy's Mapped[...] resolution fails with a
cryptic, hard-to-diagnose error such as:

    TypeError: unsupported operand type(s) for |: 'type' and 'NoneType'

That error is a symptom of the wrong interpreter, not a bug in the model
code — so the fix is never to rewrite annotations back to
`Optional[str]`; it's to run this project on Python 3.11+ as documented
in README.md. This guard turns that confusing failure into a clear one.
"""
import sys

_MIN_PYTHON = (3, 11)

if sys.version_info < _MIN_PYTHON:
    running = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    required = ".".join(str(part) for part in _MIN_PYTHON)
    raise RuntimeError(
        "\n\n"
        f"Sentrion API requires Python {required}+ but this process is running "
        f"under Python {running} ({sys.executable}).\n\n"
        "This codebase uses PEP 604 union syntax (e.g. `str | None`) throughout "
        "its SQLAlchemy models and Pydantic schemas, which needs Python 3.10+ "
        "at minimum — this project targets 3.11+. Recreate the virtual "
        "environment with a supported interpreter; see the 'Requirements' "
        "section of backend/README.md for the exact commands (pyenv install, "
        "venv recreation, etc.).\n"
    )
