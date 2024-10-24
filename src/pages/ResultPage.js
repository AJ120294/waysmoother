import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';

function ResultPage() {
  const location = useLocation();
  const { travelDate, locations, priority } = location.state || {}; // Receiving data from the homepage

  // Example data structure returned from the backend for each journey
  const [journeyData, setJourneyData] = useState([]);

  // Map container style
  const containerStyle = {
    width: '100%',
    height: '400px',
  };

  useEffect(() => {
    // Ensure locations is defined before trying to map over it
    if (!locations || locations.length === 0) {
      console.error('Locations data is not available.');
      return;
    }

    // Call Google Directions API for each journey
    const directionsService = new window.google.maps.DirectionsService();

    const fetchDirections = async () => {
      const updatedJourneys = await Promise.all(
        locations.map(async (location, index) => {
          const directionsRequest = {
            origin: location.startPoint,
            destination: location.endPoint,
            travelMode: 'DRIVING',
          };

          return new Promise((resolve, reject) => {
            directionsService.route(directionsRequest, (result, status) => {
              if (status === 'OK') {
                resolve({
                  startPoint: location.startPoint,
                  endPoint: location.endPoint,
                  duration: `${location.durationHours} hours ${location.durationMinutes} minutes`,
                  optimalStartTime: `08:00 AM`, // Mock data, replace with actual analysis
                  estimatedTravelTime: result.routes[0].legs[0].duration.text,
                  endTime: '09:00 AM', // Mock data, replace with actual calculated end time
                  directions: result,
                });
              } else {
                console.error(`Error fetching directions for journey ${index + 1}:`, status);
                reject(status);
              }
            });
          });
        })
      );
      setJourneyData(updatedJourneys);
    };

    fetchDirections();
  }, [locations]);

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

      {/* Journey Summary */}
      <div className="journey-summary">
        <h3>Date of Travel: {travelDate}</h3>
        <h3>Priority: {priority === 'shortest_time' ? 'Shortest Travel Time' : 'Minimal Traffic'}</h3>
      </div>

      {/* Display Each Journey */}
      {journeyData.map((journey, index) => (
        <div key={index} className="journey-box">
          <h4>Journey {index + 1}</h4>
          <p><strong>Start Point:</strong> {journey.startPoint}</p>
          <p><strong>End Point:</strong> {journey.endPoint}</p>
          <p><strong>Duration at End Point:</strong> {journey.duration}</p>
          <p><strong>Optimal Start Time:</strong> {journey.optimalStartTime}</p>
          <p><strong>Estimated Travel Time:</strong> {journey.estimatedTravelTime}</p>
          <p><strong>End Time:</strong> {journey.endTime}</p>

          {/* Map for each journey */}
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