import googlemaps
import random
from datetime import datetime, timedelta
from flask import Flask, render_template, request

app = Flask(__name__)

# Set up your Google Maps API key
gmaps = googlemaps.Client(key='AIzaSyBlCG_B-dTqzrexzWxe8D8wyJ24UmtCf-c')



def get_estimated_travel_time(origin, destination, mode, current_time):
    """
    Gets real-time travel time estimation based on current traffic conditions.
    """
    # Ensure the departure_time is always set to a future time
    if current_time < datetime.now():
        current_time = datetime.now()

    # Use the Google Maps Directions API to get real-time travel time
    directions_result = gmaps.directions(
        origin,
        destination,
        mode=mode,
        departure_time=current_time,
        traffic_model='best_guess'
    )

    if directions_result and 'legs' in directions_result[0]:
        # Get the travel duration in traffic
        duration_in_traffic = directions_result[0]['legs'][0]['duration_in_traffic']['value']
        return timedelta(seconds=duration_in_traffic)
    else:
        # Fallback if no traffic data is available
        return timedelta(minutes=30)  # Default to 30 minutes



def create_daily_plan(home, places, day_of_week, current_time=None):
    """
    Creates a schedule for the day based on the list of places and estimated travel times.
    """
    # Start at 8:00 AM if no current_time is provided
    if current_time is None:
        current_time = datetime.now().replace(hour=8, minute=0, second=0, microsecond=0)

    schedule = []
    origin = home

    for destination in places:
        # Get the real-time estimated travel time using the current time
        travel_time = get_estimated_travel_time(origin, destination, mode="driving", current_time=current_time)
        arrival_time = current_time + travel_time
        # Add activity to the schedule
        schedule.append({
            "origin": origin,
            "destination": destination,
            "departure_time": current_time.strftime("%H:%M"),
            "arrival_time": arrival_time.strftime("%H:%M"),
            "estimated_travel_time": travel_time
        })
        # Update the current time and origin for the next leg
        current_time = arrival_time + timedelta(hours=1)  # Assume 1 hour at each destination
        origin = destination

    return schedule, current_time  # Also return the updated current_time for chaining


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/directions', methods=['POST'])
def get_directions():
    # Get the list of starting points and destinations from the form
    start_points = request.form.getlist('start_points[]')
    destinations = request.form.getlist('destinations[]')

    if len(start_points) != len(destinations):
        # If the number of starting points and destinations don't match, show an error
        return "The number of starting points and destinations must be equal.", 400

    # Generate a daily plan for each route
    all_routes = []
    current_time = None
    for start_point, destination in zip(start_points, destinations):
        day_of_week = datetime.now().strftime('%A')
        # Create a daily plan for the current route, using the current_time
        daily_plan, current_time = create_daily_plan(start_point, [destination], day_of_week, current_time)
        all_routes.append(daily_plan)

    # Pass the list of daily plans to the template
    return render_template('directions.html', all_routes=all_routes)




if __name__ == '__main__':
    app.run(debug=True)