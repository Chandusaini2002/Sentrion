/**
 * Placeholder for the future WebSocket connection to FastAPI.
 *
 * Once the backend exposes a WS channel (e.g. /ws/notifications or
 * /ws/cameras/{id}/detections), replace the no-op implementation
 * below with a real WebSocket client. Components should keep
 * consuming this through a hook (see src/hooks) so the transport can
 * change without touching UI code.
 *
 * Not part of the backend foundation stage — that stage is REST-only
 * (see backend/README.md). Real-time channels arrive with the
 * streaming/AI stages.
 */
export type RealtimeHandler<T> = (payload: T) => void

export function subscribe<T>(
  _channel: string,
  _onMessage: RealtimeHandler<T>,
): () => void {
  // No-op until the WebSocket backend exists.
  // Returns an unsubscribe function to match the future real API.
  void _channel; void _onMessage
  return () => {}
}
