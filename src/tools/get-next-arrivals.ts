import axios from 'axios';

const TRANSITLAND_API_KEY = process.env.TRANSITLAND_API_KEY;

export async function getNextArrivals(stopId: string, routeId?: string) {
  try {
    const response = await axios.get('https://transit.land/api/v2/rest/stop_times', {
      params: {
        api_key: TRANSITLAND_API_KEY,
        stop_onestop_id: stopId,
        route_onestop_id: routeId,
        limit: 5,
        sort_by: 'arrival_time',
      },
    });

    const arrivals = response.data.stop_times.map((stopTime: any) => ({
      routeId: stopTime.route_onestop_id,
      routeName: stopTime.route_name,
      arrivalTime: stopTime.arrival_time,
      departureTime: stopTime.departure_time,
      tripHeadsign: stopTime.trip_headsign,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(arrivals, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching next arrivals:', error);
    return {
      content: [
        {
          type: 'text',
          text: 'Error fetching next arrivals. Please try again later.',
        },
      ],
      isError: true,
    };
  }
}
