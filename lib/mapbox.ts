export const MAPBOX_STYLE = "mapbox://styles/mapbox/dark-v11"

export function getMapboxToken(): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) {
    throw new Error("NEXT_PUBLIC_MAPBOX_TOKEN is not set")
  }
  return token
}
