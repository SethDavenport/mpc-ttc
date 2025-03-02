import axios from 'axios';
import { z } from 'zod';
import { TRANSITLAND_API_KEY, TRANSITLAND_BASE_URL, GEOCODER_CA_BASE_URL } from './constants.js';

async function postalCodeToCoordinates(postalCode: string): Promise<[number, number]> {
  try {
    const response = await axios.get(`${GEOCODER_CA_BASE_URL}/${postalCode}`, {
      params: { json: 1 },
    });

    return [response.data.latt, response.data.longt];
  } catch (error) {
    console.error('Failed to geocode postal code.', error);
    throw new Error('Failed to geocode postal code.');
  }
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
    const response = await axios.get(`${TRANSITLAND_BASE_URL}/stops.json`, {
      params: {
        api_key: TRANSITLAND_API_KEY,
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
