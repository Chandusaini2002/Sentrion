"""
Sentrion API — FastAPI application entrypoint.

This stage wires up the database, CORS, and every resource router. It does
NOT create tables on startup — schema changes go through Alembic (see
alembic/ and README.md) so the migration history stays authoritative.
"""
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.routers import (
    auth,
    activity,
    alerts,
    cameras,
    dashboard,
    health,
    notifications,
    public,
    profile,
    security_events,
    users,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    description=(
        "Backend foundation for the Sentrion security monitoring platform. "
        "JWT authentication and user isolation are enabled. Authenticated RTSP cameras can be routed "
        "through MediaMTX for browser live viewing. AI detection is a later stage."
    ),
)

# Allow localhost, configured origins, Dev Tunnels (*.devtunnels.ms), and Cloudflare (*.trycloudflare.com)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins) + [
        "https://q00tr67r-5173.inc1.devtunnels.ms",
        "https://q00tr67r-8000.inc1.devtunnels.ms",
    ],
    allow_origin_regex=r"^https://.*(\.devtunnels\.ms|\.trycloudflare\.com|\.app\.github\.dev)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc: StarletteHTTPException) -> JSONResponse:
    """Consistent error shape: { "detail": "..." } for every HTTP error."""
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail}, headers=exc.headers)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc: RequestValidationError) -> JSONResponse:
    """422s from bad request bodies/query params, in the same { "detail": ... } shape."""
    return JSONResponse(status_code=422, content={"detail": [{"loc": list(e["loc"]), "msg": e["msg"], "type": e["type"]} for e in exc.errors()]})


api_prefix = settings.API_PREFIX
app.include_router(auth.router, prefix=api_prefix)
app.include_router(health.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(profile.router, prefix=api_prefix)
app.include_router(cameras.router, prefix=api_prefix)
app.include_router(alerts.router, prefix=api_prefix)
app.include_router(activity.router, prefix=api_prefix)
app.include_router(security_events.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(dashboard.router, prefix=api_prefix)
app.include_router(public.router, prefix=api_prefix)

# Looping visitor CCTV media. This contains only synthetic sample footage.
app.mount("/public-media", StaticFiles(directory="app/static/visitor"), name="public-media")


@app.get("/", tags=["Health"], summary="API root")
def read_root() -> dict:
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.API_VERSION,
        "docs": "/docs",
        "health": f"{api_prefix}/health",
    }