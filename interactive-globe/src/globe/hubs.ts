export type Hub = { name: string; lat: number; lng: number };

export const HUBS: Hub[] = [
  { name: 'San Francisco', lat: 37.77, lng: -122.42 },
  { name: 'New York', lat: 40.71, lng: -74.01 },
  { name: 'São Paulo', lat: -23.55, lng: -46.63 },
  { name: 'London', lat: 51.51, lng: -0.13 },
  { name: 'Frankfurt', lat: 50.11, lng: 8.68 },
  { name: 'Lagos', lat: 6.52, lng: 3.38 },
  { name: 'Cape Town', lat: -33.92, lng: 18.42 },
  { name: 'Dubai', lat: 25.2, lng: 55.27 },
  { name: 'Mumbai', lat: 19.08, lng: 72.88 },
  { name: 'Singapore', lat: 1.35, lng: 103.82 },
  { name: 'Tokyo', lat: 35.68, lng: 139.69 },
  { name: 'Sydney', lat: -33.87, lng: 151.21 },
];

export const HUB_LATENCY = HUBS.map((_, i) => 12 + ((i * 13) % 34));

export const hubLabel = (index: number) => `${HUBS[index].name} · ${HUB_LATENCY[index]} ms`;
