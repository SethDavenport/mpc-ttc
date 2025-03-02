import axios from 'axios';

const TRANSITLAND_API_KEY = process.env.TRANSITLAND_API_KEY;

export async function getRoutesForStop(stopId: string) {
  try {
    const response = await axios.get('https://transit.land/api/v2/rest/routes', {
      params: {
        api_key: TRANSITLAND_API_KEY,
        served_by: stopId,
        limit: 10,
      },
    });

    const routes = response.data.routes.map((route: any) => ({
      id: route.onestop_id,
      name: route.name,
      shortName: route.short_name,
      longName: route.long_name,
      vehicleType: route.vehicle_type,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(routes, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('Error fetching routes for stop:', error);
    return {
      content: [
        {
          type: 'text',
          text: 'Error fetching routes for the stop. Please try again later.',
        },
      ],
      isError: true,
    };
  }
}
