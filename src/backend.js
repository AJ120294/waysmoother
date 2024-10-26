// backend.js
export const calculateOptimalJourneys = async (travelDate, locations) => {
  const directionsService = new window.google.maps.DirectionsService();
  const journeyList = [];

  // Helper function to calculate the end time based on the start time, travel time, and duration at the destination
  const calculateEndTime = (startTime, travelTimeInMinutes, durationHours, durationMinutes) => {
    // Calculate the arrival time
    const arrivalTime = new Date(startTime);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + travelTimeInMinutes);

    // Calculate the end time based on the arrival time and duration at the destination
    const endTime = new Date(arrivalTime);
    endTime.setHours(endTime.getHours() + durationHours);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);

    return endTime;
  };

  // Helper function to format time in 24-hour format for display
  const formatTime24Hour = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Step 1: Find the optimal start time for each journey within 8:00 to 23:59 (24-hour format)
  for (const [index, location] of locations.entries()) {
    let optimalStartTime = null;
    let minimumTravelTime = Infinity;
    let bestDirections = null;

    // Start checking from 8:00 on the travel date in 24-hour format
    const lowerLimit = new Date(`${travelDate}T08:00`);
    const upperLimit = new Date(`${travelDate}T23:59`);

    // Request the route from the DirectionsService with the bestguess traffic model
    const directionsRequest = {
      origin: location.startPoint,
      destination: location.endPoint,
      travelMode: "DRIVING",
      drivingOptions: {
        departureTime: lowerLimit, // Starting from 8:00
        trafficModel: "bestguess",
      },
    };

    try {
      const result = await new Promise((resolve, reject) => {
        directionsService.route(directionsRequest, (result, status) => {
          if (status === "OK") {
            resolve(result);
          } else {
            reject(`Error fetching directions for journey ${index + 1}: ${status}`);
          }
        });
      });

      const travelTimeInSeconds = result.routes[0].legs[0].duration_in_traffic
        ? result.routes[0].legs[0].duration_in_traffic.value
        : result.routes[0].legs[0].duration.value;

      // Find the optimal start time based on the travel time
      const travelTimeInMinutes = travelTimeInSeconds / 60;
      const arrivalTime = new Date(lowerLimit);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + travelTimeInMinutes);

      // Ensure the arrival time is within the allowed range
      if (arrivalTime <= upperLimit) {
        optimalStartTime = lowerLimit;
        minimumTravelTime = travelTimeInSeconds;
        bestDirections = result;
      }
    } catch (error) {
      console.error(error);
    }

    // Add the journey if a valid optimal start time was found
    if (optimalStartTime && bestDirections) {
      // Calculate the travel time and duration
      const travelTimeInMinutes = minimumTravelTime / 60;
      const durationHours = parseInt(location.durationHours, 10);
      const durationMinutes = parseInt(location.durationMinutes, 10);

      // Calculate the end time using the helper function
      const endTime = calculateEndTime(optimalStartTime, travelTimeInMinutes, durationHours, durationMinutes);

      // Format the start and end times in 24-hour format for display
      const formattedStartTime = formatTime24Hour(optimalStartTime);
      const formattedEndTime = formatTime24Hour(endTime);

      journeyList.push({
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

  // Step 2: Rearrange the journeys based on their optimal start times
  journeyList.sort((a, b) => a.optimalStartTime - b.optimalStartTime);

  // Step 3: Iterate through all journeys and adjust the start and end times to prevent overlaps
  for (let i = 1; i < journeyList.length; i++) {
    const previousJourney = journeyList[i - 1];
    const currentJourney = journeyList[i];

    // If the current journey's optimal start time falls within the previous journey's end time, adjust it
    if (currentJourney.optimalStartTime < previousJourney.endTime) {
      // Adjust the start time to be after the previous journey's end time
      currentJourney.optimalStartTime = new Date(previousJourney.endTime);

      // Recalculate the end time based on the adjusted start time and travel time
      const travelTimeInMinutes = (currentJourney.directions.routes[0].legs[0].duration_in_traffic
        ? currentJourney.directions.routes[0].legs[0].duration_in_traffic.value
        : currentJourney.directions.routes[0].legs[0].duration.value) / 60;
      const durationHours = parseInt(currentJourney.duration.split(" ")[0], 10);
      const durationMinutes = parseInt(currentJourney.duration.split(" ")[2], 10);
      currentJourney.endTime = calculateEndTime(currentJourney.optimalStartTime, travelTimeInMinutes, durationHours, durationMinutes);

      // Update the formatted start and end times in 24-hour format for display
      currentJourney.formattedStartTime = formatTime24Hour(currentJourney.optimalStartTime);
      currentJourney.formattedEndTime = formatTime24Hour(currentJourney.endTime);
    }
  }

  // Step 4: Return the rearranged and adjusted list of journeys
  return journeyList;
};
