// ResultPage.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import { calculateOptimalJourneys } from '../backend';
import './ResultPage.css';

function ResultPage() {
  const location = useLocation();
  const { travelDate, locations, priority } = location.state || {};

  const [journeyData, setJourneyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerStyle = {
    width: '100%',
    height: window.innerWidth > 768 ? '300px' : '200px',
  };

  useEffect(() => {
    if (!locations || locations.length === 0) {
      console.error('Locations data is not available.');
      return;
    }

    const fetchJourneyData = async () => {
      try {
        setIsLoading(true);
        const results = await calculateOptimalJourneys(travelDate, locations);
        setJourneyData(results);
      } catch (err) {
        setError('Failed to load journey data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJourneyData();
  }, [locations, travelDate]);

  const handleGetDirections = (startPoint, endPoint) => {
    const origin = encodeURIComponent(startPoint);
    const destination = encodeURIComponent(endPoint);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(googleMapsUrl, '_blank');
  };

  if (isLoading) {
    return <p>Loading journey data...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

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
      <div className="result-inner-container">
        <div className="background-image-container">
          <div className="background-image">
            <div className="overlay-text">
              <h1 className="title">Optimized Journey Plan</h1>
              <p className="tagline">Making Every Moment Count on Your Route</p>
            </div>
          </div>
        </div>

        <div className="journey-summary">
          <div className="travel-details">
            <div className="travel-box">
              <strong>Date of Travel:</strong> {travelDate}
            </div>
            <div className="travel-box">
              <strong>Priority:</strong> {priority === 'shortest_time' ? 'Shortest Travel Time' : 'Minimal Traffic'}
            </div>
          </div>
        </div>

        {journeyData.map((journey, index) => (
          <div key={index} className="journey-box">
            <h4>Journey {journey.originalIndex + 1}</h4>

            <div className="journey-locations">
              <div className="location-box">
                <strong>Start Point:</strong> {journey.startPoint}
              </div>
              <div className="location-box">
                <strong>End Point:</strong> {journey.endPoint}
              </div>
            </div>

            <div className="timing-row">
              <div className="timing-box">
                <strong>
                  Preferred {journey.preferredTimeOption === 'start' ? 'Start Time' : 'Arrival Time'}:
                </strong> {journey.preferredTime}
              </div>
              <div className="timing-box">
                <strong>Optimal Departure Time:</strong> {journey.formattedStartTime}
              </div>
            </div>

            <div className="timing-row">
              <div className="timing-box">
                <strong>Travel Time:</strong> {journey.estimatedTravelTime}
              </div>
              <div className="timing-box">
                <strong>End Time:</strong> {journey.formattedEndTime}
              </div>
            </div>

            <div className="map-container">
              <GoogleMap
                mapContainerStyle={containerStyle}
                zoom={10}
                center={journey.directions?.routes[0]?.legs[0]?.start_location || { lat: -36.848461, lng: 174.763336 }}
              >
                {journey.directions && <DirectionsRenderer directions={journey.directions} />}
              </GoogleMap>
            </div>

            <button 
              className="directions-button" 
              onClick={() => handleGetDirections(journey.startPoint, journey.endPoint)}
            >
              Get Directions
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultPage;
