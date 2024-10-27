// backend.js
export const calculateOptimalJourneys = async (travelDate, locations) => {
  const directionsService = new window.google.maps.DirectionsService();
  const initialJourneys = [];

  for (const [index, location] of locations.entries()) {
    let optimalStartTime = null;
    let minimumTravelTime = Infinity;
    let bestDirections = null;

    const preferredDateTime = new Date(`${travelDate}T${location.preferredTime}`);
    const windowStartTime = new Date(preferredDateTime.getTime() - 30 * 60 * 1000);

    let directionsRequest = {
      origin: location.startPoint,
      destination: location.endPoint,
      travelMode: 'DRIVING',
      drivingOptions: {
        trafficModel: 'bestguess',
      },
    };

    const timeIncrement = 5 * 60 * 1000; // 5-minute increments for more granularity
    let foundSuitableJourney = false;

    // Attempt to find optimal journey within the 30-minute window
    for (let i = 0; i <= 6; i++) {
      const departureTime = new Date(windowStartTime.getTime() + i * timeIncrement);
      directionsRequest.drivingOptions.departureTime = departureTime;

      try {
        const result = await new Promise((resolve, reject) => {
          directionsService.route(directionsRequest, (result, status) => {
            if (status === 'OK') {
              resolve(result);
            } else {
              console.error(`Error fetching directions for journey ${index + 1} at ${departureTime.toLocaleTimeString()}: ${status}`);
              reject(null);
            }
          });
        });

        if (!result) continue;

        const travelTimeInSeconds = result.routes[0].legs[0].duration_in_traffic
          ? result.routes[0].legs[0].duration_in_traffic.value
          : result.routes[0].legs[0].duration.value;

        const arrivalTime = new Date(departureTime.getTime() + travelTimeInSeconds * 1000);

        if (location.preferredTimeOption === 'arrival' && arrivalTime <= preferredDateTime && travelTimeInSeconds / 60 <= 30) {
          foundSuitableJourney = true;
          if (travelTimeInSeconds < minimumTravelTime) {
            minimumTravelTime = travelTimeInSeconds;
            optimalStartTime = departureTime;
            bestDirections = result;
          }
        } else if (location.preferredTimeOption === 'start' && departureTime >= preferredDateTime && travelTimeInSeconds / 60 <= 30) {
          foundSuitableJourney = true;
          if (travelTimeInSeconds < minimumTravelTime) {
            minimumTravelTime = travelTimeInSeconds;
            optimalStartTime = departureTime;
            bestDirections = result;
          }
        }
      } catch (error) {
        console.error(`Exception during directions request for journey ${index + 1}:`, error);
      }
    }

    // Fallback logic if no suitable journey found within the window
    if (!foundSuitableJourney) {
      if (location.preferredTimeOption === 'arrival') {
        // Use 30 minutes before preferred arrival as fallback
        optimalStartTime = windowStartTime;
      } else if (location.preferredTimeOption === 'start') {
        // Use the exact preferred start time as fallback
        optimalStartTime = preferredDateTime;
      }

      directionsRequest.drivingOptions.departureTime = optimalStartTime;
      bestDirections = await new Promise((resolve, reject) => {
        directionsService.route(directionsRequest, (result, status) => {
          if (status === 'OK') {
            resolve(result);
          } else {
            console.error(`Fallback error fetching directions for journey ${index + 1}: ${status}`);
            resolve(null);
          }
        });
      });
    }

    if (optimalStartTime && bestDirections) {
      const travelTimeInMinutes = minimumTravelTime / 60;
      const endTime = new Date(optimalStartTime);
      endTime.setMinutes(endTime.getMinutes() + travelTimeInMinutes);

      const durationHours = parseInt(location.durationHours, 10) || 0;
      const durationMinutes = parseInt(location.durationMinutes, 10) || 0;
      endTime.setHours(endTime.getHours() + durationHours);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);

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
      console.error(`Could not find a suitable departure time for journey ${index + 1}.`);
    }
  }

  console.log("Calculated journeys:", initialJourneys);

  return initialJourneys;
};
