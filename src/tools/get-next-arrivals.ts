import axios from 'axios';
import { z } from 'zod';
import { TRANSITLAND_API_KEY } from './constants.js';

export const getNextArrivalsSchema = {
  name: 'get_next_arrivals',
  description: 'Get next arrival times for a specific TTC stop and route',
  parameters: z.object({
    stopId: z.string().describe('The ID of the stop to get arrivals for'),
    routeId: z.string().optional().describe('Optional: The ID of the route to filter arrivals'),
  }),
  returns: z.array(z.object({
    stopId: z.string(),
    stopName: z.string(),
    departures: z.array(z.object({
      routeId: z.string(),
      departureTime: z.string(),
      routeName: z.string(),
    })),
  })).describe('A list of upcoming arrivals'),
};


type Params = z.infer<typeof getNextArrivalsSchema['parameters']>;
type RVal = z.infer<typeof getNextArrivalsSchema['returns']>;
export async function getNextArrivals(params: Params): Promise<RVal> {
  try {
    const response = await axios.get(`https://transit.land/api/v2/rest/stops/${params.stopId}/departures`, {
      params: {
        api_key: TRANSITLAND_API_KEY,
        stop_key: params.stopId,
        limit: 5,
        sort_by: 'departure_time',
      },
    });

    const acc: Record<string, RVal[number]> = {};
    for (const stop of response.data.stops) {
      const departures = acc[stop.onestop_id]?.departures || [];
      const newDepartures = stop.departures.map((d: any) => ({
        routeId: d.trip.route_onestop_id,
        departureTime: d.departure.scheduled_utc,
        routeName: d.trip.trip_headsign,
      }));
      
      // Deduplicate departures
      const uniqueDepartures = [...departures, ...newDepartures].reduce((unique: any[], item) => {
        const exists = unique.find(u => 
          u.routeId === item.routeId && 
          u.departureTime === item.departureTime && 
          u.routeName === item.routeName
        );
        if (!exists) {
          unique.push(item);
        }
        return unique;
      }, []);

      acc[stop.onestop_id] = {
        stopId: stop.onestop_id,
        stopName: stop.stop_name,
        departures: uniqueDepartures,
      };
    }
    return Object.values(acc);
  } catch (error) {
    console.error('Error fetching next arrivals:', error);
    throw new Error('Failed to fetch next arrivals. Please try again later.');
  }
}
