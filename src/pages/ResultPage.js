import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';

function ResultPage() {
  const location = useLocation();
  const { travelDate, locations, priority } = location.state || {}; // Receiving data from the homepage

  const [journeyData, setJourneyData] = useState([]);

  // Map container style
  const containerStyle = {
    width: '100%',
    height: '400px',
  };

  useEffect(() => {
    if (!locations || locations.length === 0) {
      console.error('Locations data is not available.');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    const fetchDirections = async () => {
      const updatedJourneys = [];
      let previousEndTime = new Date(`${travelDate}T08:00`); // Start at 8:00 AM on the travelDate

      for (const [index, location] of locations.entries()) {
        let optimalStartTime = null;
        let minimumTravelTime = Infinity;
        let bestDirections = null;

        // Loop through different times within one hour starting from the previous journey's end time
        for (let i = 0; i <= 60; i += 5) {
          // Create a departure time between the previousEndTime and one hour after
          const departureTime = new Date(previousEndTime);
          departureTime.setMinutes(departureTime.getMinutes() + i);

          const directionsRequest = {
            origin: location.startPoint,
            destination: location.endPoint,
            travelMode: 'DRIVING',
            drivingOptions: {
              departureTime: departureTime, // Testing this departure time
              trafficModel: 'bestguess',    // Use "bestguess" traffic model
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

          updatedJourneys.push({
            startPoint: location.startPoint,
            endPoint: location.endPoint,
            duration: `${location.durationHours} hours ${location.durationMinutes} minutes`,
            optimalStartTime: formattedStartTime,
            estimatedTravelTime: bestDirections.routes[0].legs[0].duration_in_traffic
              ? bestDirections.routes[0].legs[0].duration_in_traffic.text
              : bestDirections.routes[0].legs[0].duration.text,
            endTime: formattedEndTime,
            directions: bestDirections,
            originalIndex: index, // Keep track of the original index for sorting reference
          });

          // Update the previous end time to be the end time of the current journey
          previousEndTime = endTime;
        } else {
          console.error(`Could not find a suitable departure time for journey ${index + 1}.`);
        }
      }

      // Sort journeys based on the optimal start time
      updatedJourneys.sort((a, b) => new Date(a.optimalStartTime) - new Date(b.optimalStartTime));

      setJourneyData(updatedJourneys);
    };

    fetchDirections();
  }, [locations, travelDate]);

  if (!locations || locations.length === 0) {
    return (
      <div className="container result-container">
        <h1 className="text-center mt-5">No Journey Data</h1>
        <p>Please go back to the homepage and plan a journey.</p>
      </div>
    );
  }

  return (
    <div className="container result-container">
      <h1 className="text-center mt-5">Journey Summary</h1>

      <div className="journey-summary">
        <h3>Date of Travel: {travelDate}</h3>
        <h3>Priority: {priority === 'shortest_time' ? 'Shortest Travel Time' : 'Minimal Traffic'}</h3>
      </div>

      {journeyData.map((journey, index) => (
        <div key={index} className="journey-box">
          <h4>Journey {index + 1}</h4>
          <p><strong>Start Point:</strong> {journey.startPoint}</p>
          <p><strong>End Point:</strong> {journey.endPoint}</p>
          <p><strong>Duration at End Point:</strong> {journey.duration}</p>
          <p><strong>Optimal Start Time:</strong> {journey.optimalStartTime}</p>
          <p><strong>Estimated Travel Time:</strong> {journey.estimatedTravelTime}</p>
          <p><strong>End Time:</strong> {journey.endTime}</p>

          <div className="map-container">
            <GoogleMap
              mapContainerStyle={containerStyle}
              zoom={10}
              center={journey.directions?.routes[0]?.legs[0]?.start_location || { lat: -36.848461, lng: 174.763336 }} // Fallback to default
            >
              {journey.directions && <DirectionsRenderer directions={journey.directions} />}
            </GoogleMap>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ResultPage;
