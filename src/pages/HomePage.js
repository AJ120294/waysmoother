// HomePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Autocomplete } from '@react-google-maps/api';
import './HomePage.css';

function HomePage() {
  const [travelDate, setTravelDate] = useState('');
  const [locations, setLocations] = useState([{ 
    startPoint: '', 
    endPoint: '', 
    preferredTimeOption: '', 
    preferredTime: '' 
  }]);
  const [autocompleteStartRefs, setAutocompleteStartRefs] = useState([]);
  const [autocompleteEndRefs, setAutocompleteEndRefs] = useState([]);
  const [priority, setPriority] = useState('');
  const navigate = useNavigate();

  const addLocation = () => {
    setLocations([...locations, { startPoint: '', endPoint: '', preferredTimeOption: '', preferredTime: '' }]);
    setAutocompleteStartRefs([...autocompleteStartRefs, null]);
    setAutocompleteEndRefs([...autocompleteEndRefs, null]);
  };

  const updateAutocompleteRefs = (index, autocomplete, type) => {
    if (type === 'start') {
      const newAutocompleteRefs = [...autocompleteStartRefs];
      newAutocompleteRefs[index] = autocomplete;
      setAutocompleteStartRefs(newAutocompleteRefs);
    } else {
      const newAutocompleteEndRefs = [...autocompleteEndRefs];
      newAutocompleteEndRefs[index] = autocomplete;
      setAutocompleteEndRefs(newAutocompleteEndRefs);
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
      <form onSubmit={handleSubmit} className="form-container">
        <div className="background-image">
          <div className="overlay-text">
            <h1 className="title">Way Smoother</h1>
            <p className="catchphrase">Making Every Journey Count (Te Aro o ia Haerenga)</p>
          </div>
        </div>

        {/* Date and Priority Fields in Line */}
        <div className="date-priority-row">
          <div className="date-box">
            <label htmlFor="travelDate">Date of Travel (Te Rā mō te Haerenga)</label>
            <input
              type="date"
              className="form-control"
              id="travelDate"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              required
            />
          </div>

          <div className="priority-box">
            <label>Priority (Matua)</label>
            <select
              className="form-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
            >
              <option value="" disabled>Select Priority (Tīpakohia te Matua)</option>
              <option value="shortest_time">Shortest Travel Time (Te Wā Poto Rawa)</option>
              <option value="minimal_traffic">Minimal Traffic (Iti te Waka)</option>
            </select>
          </div>
        </div>

        {locations.map((location, index) => (
          <div key={index} className="journey-section">
            <h4 className="journey-heading">Journey {index + 1} (Haerenga {index + 1})</h4>
            <div className="form-row mb-3">
              <div className="col">
                <Autocomplete
                  onLoad={(autocomplete) => updateAutocompleteRefs(index, autocomplete, 'start')}
                  onPlaceChanged={() => handlePlaceSelect(index, 'start')}
                >
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Start Point (Te Tānga Timatanga)"
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
                    placeholder="End Point (Te Tānga Mutunga)"
                    value={location.endPoint}
                    onChange={(e) => handleInputChange(index, 'endPoint', e.target.value)}
                    required
                  />
                </Autocomplete>
              </div>
            </div>

            {/* Preferred Time Option and Preferred Time in Same Line */}
            <div className="form-row mb-3 preferred-time-row">
              <div className="col">
                <label>Preferred Time Option (Te Kōwhiringa Wā Pai)</label>
                <select
                  className="form-control"
                  value={location.preferredTimeOption}
                  onChange={(e) => handleInputChange(index, 'preferredTimeOption', e.target.value)}
                  required
                >
                  <option value="" disabled>Select Preferred Time Option (Tīpakohia te Wā Pai)</option>
                  <option value="start">Preferred Start Time (Te Wā Timatanga Pai)</option>
                  <option value="arrival">Preferred Arrival Time (Te Wā Taenga Pai)</option>
                </select>
              </div>

              <div className="col">
                <label>
                  {location.preferredTimeOption 
                    ? `Preferred ${location.preferredTimeOption === 'start' ? 'Start' : 'Arrival'} Time (Te Wā Pai ${location.preferredTimeOption === 'start' ? 'Timatanga' : 'Taenga'})` 
                    : 'Preferred Time (Te Wā Pai)'}
                </label>
                <input
                  type="time"
                  className="form-control"
                  value={location.preferredTime}
                  onChange={(e) => handleInputChange(index, 'preferredTime', e.target.value)}
                  required
                />
              </div>
            </div>

            {index > 0 && (
              <button type="button" className="btn btn-danger" onClick={() => removeLocation(index)}>
                Remove (Tangohia)
              </button>
            )}
          </div>
        ))}
        
        <div className="button-group">
          <button
            type="button"
            className="btn btn-outline-primary add-button"
            onClick={addLocation}
          >
            Add Another Journey
            <br />
            <span>(Tāpiri Ētahi Atu Haerenga)</span>
          </button>
          <button
            type="submit"
            className="btn btn-primary plan-button"
          >
            Plan Journey
            <br />
            <span>(Whakamāherea te Haerenga)</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default HomePage;