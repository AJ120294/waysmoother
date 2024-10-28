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
              <p className="tagline">Making Every Moment Count on Your Route <br /><span className="maori-translation">(Whaihua i Ia Wā i Tō Ara)</span></p>
            </div>
          </div>
        </div>

        <div className="journey-summary">
          <div className="travel-details">
            <div className="travel-box">
              <strong>Date of Travel</strong><br />
              <span className="maori-translation">(Te Rā mō te Haerenga)</span>
              <div>{travelDate}</div>
            </div>
            <div className="travel-box">
              <strong>Priority</strong><br />
              <span className="maori-translation">(Matua)</span>
              <div>{priority === 'shortest_time' ? 'Shortest Travel Time' : 'Minimal Traffic'}</div>
            </div>
          </div>
        </div>

        {journeyData.map((journey, index) => (
          <div key={index} className="journey-box">
              <h4>
                <span style={{ color: "#495057" }}>Journey {index + 1}</span>
                <br />
                <span className="maori-translation">(Haerenga {index + 1})</span>
              </h4>
            <div className="journey-locations">
              <div className="location-box">
                <strong>Start Point</strong><br />
                <span className="maori-translation">(Te Tānga Timatanga)</span>
                <div>{journey.startPoint}</div>
              </div>
              <div className="location-box">
                <strong>End Point</strong><br />
                <span className="maori-translation">(Te Tānga Mutunga)</span>
                <div>{journey.endPoint}</div>
              </div>
            </div>

            <div className="timing-row">
              <div className="timing-box">
                <strong>Preferred {journey.preferredTimeOption === 'start' ? 'Start Time' : 'Arrival Time'}</strong><br />
                <span className="maori-translation">{journey.preferredTimeOption === 'start' ? '(Te Wā Timatanga Pai)' : '(Te Wā Taenga Pai)'}</span>
                <div>{journey.preferredTime}</div>
              </div>
              <div className="timing-box">
                <strong>Optimal Departure Time</strong><br />
                <span className="maori-translation">(Te Wā Timatanga Pai)</span>
                <div>{journey.formattedStartTime}</div>
              </div>
            </div>

            <div className="timing-row">
              <div className="timing-box">
                <strong>Travel Time</strong><br />
                <span className="maori-translation">(Te Wā Haere)</span>
                <div>{journey.estimatedTravelTime}</div>
              </div>
              <div className="timing-box">
                <strong>End Time</strong><br />
                <span className="maori-translation">(Te Wā Mutunga)</span>
                <div>{journey.formattedEndTime}</div>
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
              <br />
              <span>(Tikina te Aronga)</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultPage;