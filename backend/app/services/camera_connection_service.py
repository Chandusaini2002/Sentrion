"""Real RTSP connectivity checks for authenticated Sentrion cameras.

This service intentionally does not log camera URLs or credentials. It first
checks TCP reachability, then asks ffprobe to open the RTSP stream and report
basic video metadata. ffprobe is provided by FFmpeg and is an OS dependency,
not a Python package.
"""
from __future__ import annotations

import ipaddress
import json
import shutil
import socket
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from urllib.parse import quote, urlsplit, urlunsplit


@dataclass(slots=True)
class CameraConnectionResult:
    success: bool
    reachable: bool
    stream_verified: bool
    message: str
    redacted_url: str
    host: str
    port: int
    codec: str | None = None
    width: int | None = None
    height: int | None = None


def build_cp_plus_rtsp_url(
    host: str,
    port: int = 554,
    channel: int = 1,
    stream_profile: str = "sub",
) -> str:
    """Build the common CP PLUS/Dahua-compatible RTSP channel URL."""
    host = host.strip()
    if not host:
        raise ValueError("Recorder IP address or hostname is required.")
    if "://" in host or any(ch in host for ch in "/@?# "):
        raise ValueError("Recorder address must be an IP address or hostname only.")
    if not 1 <= port <= 65535:
        raise ValueError("RTSP port must be between 1 and 65535.")
    if not 1 <= channel <= 128:
        raise ValueError("Channel must be between 1 and 128.")
    if stream_profile not in {"main", "sub"}:
        raise ValueError("Stream profile must be main or sub.")
    subtype = 0 if stream_profile == "main" else 1
    return f"rtsp://{host}:{port}/cam/realmonitor?channel={channel}&subtype={subtype}"


def _redact_url(value: str) -> str:
    try:
        parsed = urlsplit(value)
        host = parsed.hostname or ""
        port = f":{parsed.port}" if parsed.port else ""
        return urlunsplit((parsed.scheme, f"{host}{port}", parsed.path, parsed.query, ""))
    except ValueError:
        return "rtsp://configured-stream"


def with_credentials(url: str, username: str | None, password: str | None) -> str:
    """Return a private RTSP URL containing credentials when supplied.

    Callers must never log or return the result to a browser.
    """
    parsed = urlsplit(url)
    if parsed.scheme not in {"rtsp", "rtsps"} or not parsed.hostname:
        raise ValueError("Provide a valid RTSP URL.")

    if parsed.username is not None:
        return url

    host = parsed.hostname
    if ":" in host and not host.startswith("["):
        host = f"[{host}]"
    port = f":{parsed.port}" if parsed.port else ""
    if username:
        userinfo = quote(username, safe="")
        if password:
            userinfo += f":{quote(password, safe='')}"
        netloc = f"{userinfo}@{host}{port}"
    else:
        netloc = f"{host}{port}"
    return urlunsplit((parsed.scheme, netloc, parsed.path, parsed.query, parsed.fragment))


def _resolve_safe_addresses(host: str) -> list[str]:
    try:
        infos = socket.getaddrinfo(host, None, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise ValueError("Camera hostname could not be resolved.") from exc

    addresses: list[str] = []
    for info in infos:
        address = info[4][0]
        try:
            ip = ipaddress.ip_address(address)
        except ValueError:
            continue
        # Private LAN addresses are intentionally allowed because cameras and
        # NVRs normally live on RFC1918 networks. Host-local, link-local,
        # multicast and unspecified destinations remain blocked.
        if ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_unspecified:
            raise ValueError("That camera address is not allowed.")
        addresses.append(address)
    if not addresses:
        raise ValueError("Camera hostname did not resolve to a usable address.")
    return list(dict.fromkeys(addresses))


def _tcp_reachable(host: str, port: int, timeout: float = 3.0) -> bool:
    addresses = _resolve_safe_addresses(host)
    for address in addresses:
        family = socket.AF_INET6 if ":" in address else socket.AF_INET
        sock = socket.socket(family, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        try:
            sock.connect((address, port))
            return True
        except OSError:
            continue
        finally:
            sock.close()
    return False


def _friendly_ffprobe_error(stderr: str) -> str:
    lower = stderr.lower()
    if "401 unauthorized" in lower or "authorization failed" in lower:
        return "Recorder reached, but the username or password was rejected."
    if "404 not found" in lower or "method describe failed: 404" in lower:
        return "Recorder reached, but this RTSP path/channel was not found."
    if "connection refused" in lower:
        return "Recorder refused the RTSP connection. Check the RTSP port and device settings."
    if "timed out" in lower or "timeout" in lower:
        return "Recorder was reached, but the RTSP stream timed out."
    if "server returned 4" in lower:
        return "Recorder rejected the RTSP request. Check credentials, channel, and stream settings."
    return "Recorder is reachable, but Sentrion could not open a video stream with these settings."


def test_rtsp_connection(
    rtsp_url: str,
    username: str | None = None,
    password: str | None = None,
    timeout_seconds: float = 8.0,
) -> CameraConnectionResult:
    parsed = urlsplit(rtsp_url)
    if parsed.scheme not in {"rtsp", "rtsps"} or not parsed.hostname:
        raise ValueError("Provide a valid RTSP URL.")
    try:
        port = parsed.port or (322 if parsed.scheme == "rtsps" else 554)
    except ValueError as exc:
        raise ValueError("RTSP URL contains an invalid port.") from exc

    host = parsed.hostname
    redacted = _redact_url(rtsp_url)

    if not _tcp_reachable(host, port):
        return CameraConnectionResult(
            success=False,
            reachable=False,
            stream_verified=False,
            message=f"Could not reach {host}:{port}. Check that the recorder is online and reachable from the Sentrion backend.",
            redacted_url=redacted,
            host=host,
            port=port,
        )

    ffprobe = shutil.which("ffprobe")
    if not ffprobe:
        return CameraConnectionResult(
            success=False,
            reachable=True,
            stream_verified=False,
            message=(
                "Recorder is reachable, but FFmpeg/ffprobe is not installed on the Sentrion backend. "
                "Install it with `brew install ffmpeg`, then test again."
            ),
            redacted_url=redacted,
            host=host,
            port=port,
        )

    private_url = with_credentials(rtsp_url, username, password)
    command = [
        ffprobe,
        "-v",
        "error",
        "-rtsp_transport",
        "tcp",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=codec_name,width,height",
        "-of",
        "json",
        private_url,
    ]
    try:
        completed = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=timeout_seconds,
            check=False,
        )
    except subprocess.TimeoutExpired:
        return CameraConnectionResult(
            success=False,
            reachable=True,
            stream_verified=False,
            message="Recorder is reachable, but the RTSP stream did not respond in time.",
            redacted_url=redacted,
            host=host,
            port=port,
        )

    if completed.returncode != 0:
        return CameraConnectionResult(
            success=False,
            reachable=True,
            stream_verified=False,
            message=_friendly_ffprobe_error(completed.stderr),
            redacted_url=redacted,
            host=host,
            port=port,
        )

    try:
        payload = json.loads(completed.stdout or "{}")
        stream = (payload.get("streams") or [None])[0]
    except (json.JSONDecodeError, TypeError, IndexError):
        stream = None

    if not stream:
        return CameraConnectionResult(
            success=False,
            reachable=True,
            stream_verified=False,
            message="RTSP session opened, but no video stream was detected.",
            redacted_url=redacted,
            host=host,
            port=port,
        )

    codec = stream.get("codec_name")
    width = stream.get("width")
    height = stream.get("height")
    detail = "Video stream verified"
    if codec:
        detail += f" ({str(codec).upper()}"
        if width and height:
            detail += f", {width}×{height}"
        detail += ")"
    return CameraConnectionResult(
        success=True,
        reachable=True,
        stream_verified=True,
        message=f"{detail}. You can save this camera.",
        redacted_url=redacted,
        host=host,
        port=port,
        codec=codec,
        width=width,
        height=height,
    )


def test_cp_plus_channel_numbers(
    host: str,
    port: int,
    channels: list[int],
    stream_profile: str,
    username: str | None,
    password: str | None,
) -> list[tuple[int, CameraConnectionResult]]:
    """Test specific CP PLUS NVR channels concurrently."""
    unique_channels = sorted(set(channels))
    if not unique_channels or any(channel < 1 or channel > 128 for channel in unique_channels):
        raise ValueError("Channel numbers must be between 1 and 128.")

    def probe(channel: int) -> tuple[int, CameraConnectionResult]:
        url = build_cp_plus_rtsp_url(host, port, channel, stream_profile)
        return channel, test_rtsp_connection(url, username, password)

    results: dict[int, CameraConnectionResult] = {}
    workers = min(4, len(unique_channels))
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(probe, channel): channel for channel in unique_channels}
        for future in as_completed(futures):
            channel = futures[future]
            try:
                _, result = future.result()
            except ValueError as exc:
                url = build_cp_plus_rtsp_url(host, port, channel, stream_profile)
                parsed = urlsplit(url)
                result = CameraConnectionResult(
                    success=False,
                    reachable=False,
                    stream_verified=False,
                    message=str(exc),
                    redacted_url=_redact_url(url),
                    host=parsed.hostname or host,
                    port=parsed.port or port,
                )
            results[channel] = result

    return [(channel, results[channel]) for channel in unique_channels]


def scan_cp_plus_channels(
    host: str,
    port: int,
    channel_count: int,
    stream_profile: str,
    username: str | None,
    password: str | None,
) -> list[tuple[int, CameraConnectionResult]]:
    """Test channels 1..channel_count on a CP PLUS NVR concurrently.

    This is channel probing, not ONVIF discovery. It is useful when the owner
    already knows the recorder has (for example) four connected cameras.
    """
    if not 1 <= channel_count <= 32:
        raise ValueError("Channel count must be between 1 and 32.")
    return test_cp_plus_channel_numbers(
        host=host,
        port=port,
        channels=list(range(1, channel_count + 1)),
        stream_profile=stream_profile,
        username=username,
        password=password,
    )
