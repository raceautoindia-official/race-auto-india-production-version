export function corsHeaders(origin?: string | null) {
  const allowedOrigins = [
    "https://raceautoanalytics.com",
    "https://www.raceautoanalytics.com",
    "http://localhost:3000",
  ];

  const safeOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": safeOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}