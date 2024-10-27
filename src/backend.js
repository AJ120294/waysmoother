export const calculateOptimalJourneys = async (travelDate, locations) => {
  const directionsService = new window.google.maps.DirectionsService();
  const initialJourneys = [];

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

    // Check the estimated travel time based on preferred time option
    if (location.preferredTimeOption === 'start') {
      // Start-based: Set departureTime to preferred start time and calculate travel time
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
          optimalStartTime = preferredDateTime;
          bestDirections = result;
        }
      } catch (error) {
        console.error(`Exception during directions request for journey ${index + 1}:`, error);
      }
    } else if (location.preferredTimeOption === 'arrival') {
      // Arrival-based: Set departureTime to 30 minutes before preferred arrival time and calculate travel time
      const windowStartTime = new Date(preferredDateTime.getTime() - 30 * 60 * 1000);
      directionsRequest.drivingOptions.departureTime = windowStartTime;

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
          const travelTimeInSeconds = result.routes[0].legs[0].duration_in_traffic
            ? result.routes[0].legs[0].duration_in_traffic.value
            : result.routes[0].legs[0].duration.value;

          // Set optimalStartTime without the additional 5-minute buffer
          optimalStartTime = new Date(preferredDateTime.getTime() - travelTimeInSeconds * 1000);
          bestDirections = result;
        }
      } catch (error) {
        console.error(`Exception during directions request for journey ${index + 1}:`, error);
      }
    }

    // Calculate end time directly as optimalStartTime + estimated travel time
    if (optimalStartTime instanceof Date && !isNaN(optimalStartTime) && bestDirections) {
      const travelTimeInMilliseconds = bestDirections.routes[0].legs[0].duration.value * 1000;
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
        estimatedTravelTime: bestDirections.routes[0].legs[0].duration_in_traffic
          ? bestDirections.routes[0].legs[0].duration_in_traffic.text
          : bestDirections.routes[0].legs[0].duration.text,
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
