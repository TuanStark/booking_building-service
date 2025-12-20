export interface GeocodeResult {
    formattedAddress: string;
    location: { latitude: number; longtitude: number };
    placeId?: string;
    types?: string[];
  }