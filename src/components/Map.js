import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '10px',
};

const center = {
  lat: -36.848461, // Example: Auckland, NZ coordinates
  lng: 174.763336,
};

function Map() {
  return (
    <div className="map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  );
}

export default Map;
