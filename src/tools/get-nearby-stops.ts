import axios from 'axios';
import { z } from 'zod';

async function postalCodeToCoordinates(postalCode: string): Promise<[number, number]> {
  // This is a placeholder. In a real implementation, you would use a geocoding service.
  // For demonstration, we'll return fixed coordinates for Toronto.
  return [43.6532, -79.3832];
}

export const getNearbyStopsSchema = {
  name: 'get_nearby_stops',
  description: 'Get nearby TTC stops for a given postal code',
  parameters: {
    postalCode: z.string().describe('The postal code to search near'),
  },
  returns: z.array(z.object({
    id: z.string(),
    name: z.string(),
    distance: z.number(),
  })).describe('A list of nearby stops'),
};

export async function getNearbyStops(params: {postalCode: string}): Promise<{id: string, name: string, distance: number}[]> {
  try {
    const [lat, lon] = await postalCodeToCoordinates(params.postalCode);
    
    const response = await axios.get('https://transit.land/api/v2/rest/stops.json', {
      params: {
        api_key: process.env.TRANSITLAND_API_KEY,
        lat,
        lon,
        radius: 500, // 500 meter radius
        limit: 5,
      },
    });

    return response.data.stops.map((stop: any) => ({
      id: stop.onestop_id,
      name: stop.stop_name,
    }));
  } catch (error) {
    console.error('Error fetching nearby stops:', error);
    throw new Error('Failed to fetch nearby stops. Please try again later.');
  }
}
