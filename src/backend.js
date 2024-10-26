// backend.js
export const calculateOptimalJourneys = async (travelDate, locations) => {
  const directionsService = new window.google.maps.DirectionsService();
  const initialJourneys = [];

  // Step 1: Find the optimal start time for each journey independently
  for (const [index, location] of locations.entries()) {
    let optimalStartTime = null;
    let minimumTravelTime = Infinity;
    let bestDirections = null;

    // Start checking from 7 AM on the travel date
    let currentTime = new Date(`${travelDate}T07:00`);

    // Increment by 30 minutes for each check to find a potentially better time
    for (let i = 0; i < 48; i++) { // 24-hour check with 30-minute increments
      const departureTime = new Date(currentTime);
      departureTime.setMinutes(departureTime.getMinutes() + i * 30);

      const directionsRequest = {
        origin: location.startPoint,
        destination: location.endPoint,
        travelMode: 'DRIVING',
        drivingOptions: {
          departureTime: departureTime,
          trafficModel: 'bestguess',
        },
      };

      try {
        const result = await new Promise((resolve, reject) => {
          directionsService.route(directionsRequest, (result, status) => {
            if (status === 'OK') {
              resolve(result);
            } else {
              reject(`Error fetching directions for journey ${index + 1}: ${status}`);
            }
          });
        });

        const travelTimeInSeconds = result.routes[0].legs[0].duration_in_traffic
          ? result.routes[0].legs[0].duration_in_traffic.value
          : result.routes[0].legs[0].duration.value;

        // If this travel time is shorter than the current minimum, update the optimal time
        if (travelTimeInSeconds < minimumTravelTime) {
          minimumTravelTime = travelTimeInSeconds;
          optimalStartTime = departureTime;
          bestDirections = result;
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (optimalStartTime && bestDirections) {
      const travelTimeInMinutes = minimumTravelTime / 60;

      // Calculate the end time of the current journey
      const endTime = new Date(optimalStartTime);
      endTime.setMinutes(endTime.getMinutes() + travelTimeInMinutes);

      // Add the duration at the end point
      const durationHours = parseInt(location.durationHours, 10);
      const durationMinutes = parseInt(location.durationMinutes, 10);
      endTime.setHours(endTime.getHours() + durationHours);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);

      // Format the start and end times
      const formattedStartTime = optimalStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formattedEndTime = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      initialJourneys.push({
        startPoint: location.startPoint,
        endPoint: location.endPoint,
        duration: `${location.durationHours} hours ${location.durationMinutes} minutes`,
        optimalStartTime,
        formattedStartTime,
        formattedEndTime,
        estimatedTravelTime: bestDirections.routes[0].legs[0].duration_in_traffic
          ? bestDirections.routes[0].legs[0].duration_in_traffic.text
          : bestDirections.routes[0].legs[0].duration.text,
        endTime,
        directions: bestDirections,
        originalIndex: index, // Keep the original index to maintain the original title
      });
    } else {
      console.error(`Could not find a suitable departure time for journey ${index + 1}.`);
    }
  }

  // Step 2: Rearrange journeys based on calculated optimal times
  const finalJourneys = [];
  let lastEndTime = null;

  while (initialJourneys.length > 0) {
    let nextJourney = null;
    let nextIndex = -1;

    // Find the journey with the earliest optimal start time after lastEndTime
    for (let i = 0; i < initialJourneys.length; i++) {
      const journey = initialJourneys[i];
      if (!lastEndTime || journey.optimalStartTime >= lastEndTime) {
        if (!nextJourney || journey.optimalStartTime < nextJourney.optimalStartTime) {
          nextJourney = journey;
          nextIndex = i;
        }
      }
    }

    if (nextJourney) {
      finalJourneys.push(nextJourney);
      lastEndTime = nextJourney.endTime;
      initialJourneys.splice(nextIndex, 1);
    } else {
      // If no journey can start after the last end time, add the remaining journeys as is
      finalJourneys.push(...initialJourneys);
      break;
    }
  }

  return finalJourneys;
};