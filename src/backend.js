export const calculateOptimalJourneys = async (travelDate, locations) => {
  const directionsService = new window.google.maps.DirectionsService();
  const initialJourneys = [];

  // Function to format travel time in hours and minutes
  const formatTravelTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} mins` : ''}`.trim();
    }
    return `${mins} mins`;
  };

  for (const [index, location] of locations.entries()) {
    let optimalStartTime = null;
    let bestDirections = null;

    const preferredDateTime = new Date(`${travelDate}T${location.preferredTime}`);
    const directionsRequest = {
      origin: location.startPoint,
      destination: location.endPoint,
      travelMode: 'DRIVING',
      drivingOptions: {
        trafficModel: 'bestguess',
      },
    };

    if (location.preferredTimeOption === 'start') {
      // Set departureTime to preferred start time for "start" option
      directionsRequest.drivingOptions.departureTime = preferredDateTime;

      try {
        const result = await new Promise((resolve, reject) => {
          directionsService.route(directionsRequest, (result, status) => {
            if (status === 'OK') {
              resolve(result);
            } else {
              reject(null);
            }
          });
        });

        if (result) {
          // Use the bestguess estimated travel time to set optimalStartTime
          optimalStartTime = preferredDateTime;
          bestDirections = result;
        }
      } catch (error) {
        console.error(`Exception during directions request for journey ${index + 1}:`, error);
      }
    } else if (location.preferredTimeOption === 'arrival') {
      // Set departure time to 1 hour before the preferred arrival time for "arrival" option
      const departureEstimateTime = new Date(preferredDateTime.getTime() - 60 * 60 * 1000);
      directionsRequest.drivingOptions.departureTime = departureEstimateTime;

      try {
        const result = await new Promise((resolve, reject) => {
          directionsService.route(directionsRequest, (result, status) => {
            if (status === 'OK') {
              resolve(result);
            } else {
              reject(null);
            }
          });
        });

        if (result) {
          const travelTimeInSeconds = result.routes[0].legs[0].duration_in_traffic.value;

          // Calculate optimalStartTime as preferred arrival time - travel time - 5 minutes
          optimalStartTime = new Date(preferredDateTime.getTime() - travelTimeInSeconds * 1000 - 5 * 60 * 1000);
          bestDirections = result;
        }
      } catch (error) {
        console.error(`Exception during directions request for journey ${index + 1}:`, error);
      }
    }

    // Calculate end time as optimalStartTime + rounded estimated travel time
    if (optimalStartTime instanceof Date && !isNaN(optimalStartTime) && bestDirections) {
      // Round the duration_in_traffic to the nearest minute in seconds
      const travelTimeInMinutes = Math.round(bestDirections.routes[0].legs[0].duration_in_traffic.value / 60);
      const travelTimeInMilliseconds = travelTimeInMinutes * 60 * 1000;

      const endTime = new Date(optimalStartTime.getTime() + travelTimeInMilliseconds);

      const formattedStartTime = optimalStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const formattedEndTime = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

      initialJourneys.push({
        startPoint: location.startPoint,
        endPoint: location.endPoint,
        preferredTimeOption: location.preferredTimeOption,
        preferredTime: location.preferredTime,
        optimalStartTime,
        formattedStartTime,
        formattedEndTime,
        estimatedTravelTime: formatTravelTime(travelTimeInMinutes), // Display the formatted travel time
        endTime,
        directions: bestDirections,
        originalIndex: index,
      });
    } else {
      console.error(`Could not find a suitable departure time or directions for journey ${index + 1}.`);
    }
  }

  console.log("Calculated journeys:", initialJourneys);

  return initialJourneys;
};
