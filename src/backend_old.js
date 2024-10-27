// backend.js
export const calculateOptimalJourneys = async (travelDate, locations) => {
  const directionsService = new window.google.maps.DirectionsService();
  const journeyList = [];

  // Helper function to calculate the end time based on the start time, travel time, and duration at the destination
  const calculateEndTime = (startTime, travelTimeInMinutes, durationHours, durationMinutes) => {
  const arrivalTime = new Date(startTime);
  arrivalTime.setMinutes(arrivalTime.getMinutes() + travelTimeInMinutes);

  const endTime = new Date(arrivalTime);
  endTime.setHours(endTime.getHours() + durationHours);

  // Add duration minutes and handle overflow
  const totalMinutes = endTime.getMinutes() + durationMinutes;
  endTime.setHours(endTime.getHours() + Math.floor(totalMinutes / 60));
  endTime.setMinutes(totalMinutes % 60);

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

    const lowerLimit = new Date(`${travelDate}T08:00`);
    const upperLimit = new Date(`${travelDate}T23:59`);

    const directionsRequest = {
      origin: location.startPoint,
      destination: location.endPoint,
      travelMode: "DRIVING",
      drivingOptions: {
        departureTime: lowerLimit,
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

      const travelTimeInMinutes = travelTimeInSeconds / 60;
      const arrivalTime = new Date(lowerLimit);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + travelTimeInMinutes);

      if (arrivalTime <= upperLimit) {
        optimalStartTime = lowerLimit;
        minimumTravelTime = travelTimeInSeconds;
        bestDirections = result;
      }
    } catch (error) {
      console.error(error);
    }

    if (optimalStartTime && bestDirections) {
      const travelTimeInMinutes = minimumTravelTime / 60;
      const durationHours = parseInt(location.durationHours, 10);
      const durationMinutes = parseInt(location.durationMinutes, 10);

      const endTime = calculateEndTime(optimalStartTime, travelTimeInMinutes, durationHours, durationMinutes);
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
        originalIndex: index,
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
    let currentJourney = journeyList[i];

    // If the current journey's optimal start time falls within the previous journey's end time, adjust it
    if (currentJourney.optimalStartTime < previousJourney.endTime) {
      // Re-request the bestguess optimal start time after the end of the previous journey
      const adjustedRequest = {
        origin: currentJourney.startPoint,
        destination: currentJourney.endPoint,
        travelMode: "DRIVING",
        drivingOptions: {
          departureTime: previousJourney.endTime, // New start time after previous journey ends
          trafficModel: "bestguess",
        },
      };

      try {
        const adjustedResult = await new Promise((resolve, reject) => {
          directionsService.route(adjustedRequest, (result, status) => {
            if (status === "OK") {
              resolve(result);
            } else {
              reject(`Error fetching adjusted directions for journey ${currentJourney.originalIndex + 1}: ${status}`);
            }
          });
        });

        const adjustedTravelTimeInSeconds = adjustedResult.routes[0].legs[0].duration_in_traffic
          ? adjustedResult.routes[0].legs[0].duration_in_traffic.value
          : adjustedResult.routes[0].legs[0].duration.value;

        const adjustedTravelTimeInMinutes = adjustedTravelTimeInSeconds / 60;
        const durationHours = parseInt(currentJourney.duration.split(" ")[0], 10);
        const durationMinutes = parseInt(currentJourney.duration.split(" ")[2], 10);

        // Set the new optimal start and end times based on the re-requested bestguess
        currentJourney.optimalStartTime = previousJourney.endTime;
        currentJourney.endTime = calculateEndTime(currentJourney.optimalStartTime, adjustedTravelTimeInMinutes, durationHours, durationMinutes);
        currentJourney.formattedStartTime = formatTime24Hour(currentJourney.optimalStartTime);
        currentJourney.formattedEndTime = formatTime24Hour(currentJourney.endTime);
        currentJourney.directions = adjustedResult;

      } catch (error) {
        console.error(error);
      }
    }
  }

  // Step 4: Return the rearranged and adjusted list of journeys
  return journeyList;
};
