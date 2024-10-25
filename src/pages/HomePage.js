// HomePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Autocomplete } from '@react-google-maps/api';
import './HomePage.css';

function HomePage() {
  const [travelDate, setTravelDate] = useState('');
  const [locations, setLocations] = useState([{ startPoint: '', endPoint: '', durationHours: '0', durationMinutes: '0' }]);
  const [autocompleteStartRefs, setAutocompleteStartRefs] = useState([]);
  const [autocompleteEndRefs, setAutocompleteEndRefs] = useState([]);
  const [priority, setPriority] = useState('shortest_time'); // Priority factor state
  const navigate = useNavigate();

  const addLocation = () => {
    setLocations([...locations, { startPoint: '', endPoint: '', durationHours: '0', durationMinutes: '0' }]);
    setAutocompleteStartRefs([...autocompleteStartRefs, null]);
    setAutocompleteEndRefs([...autocompleteEndRefs, null]);
  };

  const updateAutocompleteRefs = (index, autocomplete, type) => {
    if (type === 'start') {
      const newAutocompleteRefs = [...autocompleteStartRefs];
      newAutocompleteRefs[index] = autocomplete;
      setAutocompleteStartRefs(newAutocompleteRefs);
    } else if (type === 'end') {
      const newAutocompleteRefs = [...autocompleteEndRefs];
      newAutocompleteRefs[index] = autocomplete;
      setAutocompleteEndRefs(newAutocompleteRefs);
    }
  };

  const handlePlaceSelect = (index, type) => {
    const place = type === 'start' ? autocompleteStartRefs[index]?.getPlace() : autocompleteEndRefs[index]?.getPlace();
    if (!place) {
      alert('Place selection failed. Please try again.');
      return;
    }
    const newLocations = [...locations];
    if (type === 'start') {
      newLocations[index].startPoint = place.formatted_address || '';
    } else {
      newLocations[index].endPoint = place.formatted_address || '';
    }
    setLocations(newLocations);
  };

  const removeLocation = (index) => {
    setLocations(locations.filter((_, i) => i !== index));
    setAutocompleteStartRefs(autocompleteStartRefs.filter((_, i) => i !== index));
    setAutocompleteEndRefs(autocompleteEndRefs.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    const newLocations = [...locations];
    newLocations[index][field] = value;
    setLocations(newLocations);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/results', { state: { travelDate, locations, priority } });
  };

  return (
    <div className="container home-container">
      <div className="text-center">
        <h1 className="mt-5 mb-2">Way Smoother</h1>
        <p className="catchphrase">Making Every Journey Count</p>
      </div>

      <div className="row justify-content-center mt-5">
        <div className="col-md-8 text-center">
          <img
            src="/HomePage_Image1.jpg"
            alt="Journey Planner"
            className="img-fluid journey-image"
          />
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <form onSubmit={handleSubmit} className="form-container">

            {/* Date of Travel */}
            <div className="form-group">
              <label htmlFor="travelDate">Date of Travel</label>
              <input
                type="date"
                className="form-control"
                id="travelDate"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                required
              />
            </div>

            {locations.map((location, index) => (
              <div key={index} className="journey-section">
                <h4 className="journey-heading">Journey {index + 1}</h4>
                <div className="form-row mb-3">
                  <div className="col">
                    <Autocomplete
                      onLoad={(autocomplete) => updateAutocompleteRefs(index, autocomplete, 'start')}
                      onPlaceChanged={() => handlePlaceSelect(index, 'start')}
                    >
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Start Point"
                        value={location.startPoint}
                        onChange={(e) => handleInputChange(index, 'startPoint', e.target.value)}
                        required
                      />
                    </Autocomplete>
                  </div>
                  <div className="col">
                    <Autocomplete
                      onLoad={(autocomplete) => updateAutocompleteRefs(index, autocomplete, 'end')}
                      onPlaceChanged={() => handlePlaceSelect(index, 'end')}
                    >
                      <input
                        type="text"
                        className="form-control"
                        placeholder="End Point"
                        value={location.endPoint}
                        onChange={(e) => handleInputChange(index, 'endPoint', e.target.value)}
                        required
                      />
                    </Autocomplete>
                  </div>

                  <div className="col">
                    <label>Time Duration You Will Spend at This End Point</label>
                    <div className="d-flex">
                      <select
                        className="form-control"
                        value={location.durationHours}
                        onChange={(e) => handleInputChange(index, 'durationHours', e.target.value)}
                      >
                        {Array.from({ length: 13 }, (_, i) => (
                          <option key={i} value={i}>{i} hours</option>
                        ))}
                      </select>
                      <select
                        className="form-control ml-2"
                        value={location.durationMinutes}
                        onChange={(e) => handleInputChange(index, 'durationMinutes', e.target.value)}
                      >
                        <option value="0">0 minutes</option>
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                      </select>
                    </div>
                  </div>
                </div>
                {index > 0 && (
                  <button type="button" className="btn btn-danger" onClick={() => removeLocation(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            <div className="form-group">
              <label>Priority</label>
              <select
                className="form-control"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="shortest_time">Shortest Travel Time</option>
                <option value="minimal_traffic">Minimal Traffic</option>
              </select>
            </div>
            <div className="button-group">
              <button
                type="button"
                className="btn btn-outline-primary add-button"
                onClick={addLocation}
              >
                Add Another Journey
              </button>
              <button
                type="submit"
                className="btn btn-primary plan-button"
              >
                Plan Journey
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
