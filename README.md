# Way Smoother

**Way Smoother** is a web-based journey planning application designed to help users plan trips with optimal routes based on historical and real-time traffic data. It enables users to select a travel date and time, and generates routes that minimize travel delays, allowing for a smoother journey experience. 

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Contributions](#contributions)
- [License](#license)
- [Contribute](#contribute)

## Project Overview
The WaySmoother project aims to enhance journey planning by allowing users to input multiple travel points, dates, and preferences for an optimized journey. Unlike traditional navigation tools, Way Smoother provides predictions based on historical traffic patterns, giving users the advantage of planning ahead for future dates. This application uses data-driven techniques for journey optimization and offers flexibility through customizable routing options.

## Features
- **Route Optimization**: Generate routes based on historical traffic data and current traffic conditions.
- **Flexible Travel Preferences**: Choose options like shortest travel time or minimal traffic for route selection.
- **Multi-Point Travel**: Allows users to input multiple starting and ending points.
- **Customizable Travel Dates and Times**: Enables travel planning for future dates.
- **Map Visualization**: Integrated Google Maps for interactive route visualization.
- **Responsive Design**: Ensures compatibility across devices, including desktops, tablets, and mobile devices.

## Tech Stack
- **Frontend**: React.js
- **Backend**: Node.js (for API endpoints)
- **Map Integration**: Google Maps API
- **Styling**: CSS, Bootstrap
- **Version Control**: GitHub
- **Task Management**: Trello
- **Documentation**: LaTeX for project and technical documentation

## Installation

To set up this project locally, please follow these steps:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/AJ120294/waysmoother.git
   cd waysmoother
   ```

2. **Install Dependencies**
   - Navigate to both frontend and backend directories and install dependencies:
     ```bash
     # For frontend
     cd frontend
     npm install

     # For backend
     cd ../backend
     npm install
     ```

3. **Google Maps API Key**
   - Obtain a Google Maps API key from [Google Cloud Platform](https://console.cloud.google.com/).
   - Add the API key to the `.env` file in both frontend and backend directories:
     ```bash
     REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     ```

4. **Start the Application**
   - Run the frontend and backend servers:
     ```bash
     # Frontend
     cd frontend
     npm start

     # Backend
     cd ../backend
     npm start
     ```

5. **Access the Application**
   - Visit `http://localhost:3000` in your browser.

## Usage
1. **Input Details**: Enter multiple journey start and end points along with travel preferences.
2. **Set Date and Time**: Select a date and time for future planning.
3. **Route Generation**: Generate the route based on selected preferences and view detailed journey information.
4. **Map Interaction**: Use the embedded map for an interactive view of routes and directions.
5. **View Journey Summary**: Check the optimized route summary with time estimations, travel duration, and traffic considerations.

## Configuration
The following configuration options can be set in the `.env` files:

- **REACT_APP_GOOGLE_MAPS_API_KEY**: Google Maps API Key for map and route functionalities.
- **PORT**: Define backend server port (default is 5000).

For any additional configurations (e.g., map styling, traffic data intervals), please refer to the documentation on the [Google Maps API](https://developers.google.com/maps/documentation/).

## Contributions

### Aman Jain
- **Role**: Front-End Developer, Quality Assurance
- **Contributions**:
  - Developed the user interface using React.js
  - Integrated Google Maps API for route display
  - Documented the project in LaTeX for clear, professional reporting
  - Managed version control and task tracking on GitHub and Trello
  
### Nicolay Anderson Christian
- **Role**: Backend Developer
- **Contributions**:
  - Built journey optimization logic and integrated traffic data with backend
  - Ensured proper functionality and error handling
  - Contributed to backend documentation and maintained API configurations

## Acknowledgments

- **Te Tiriti o Waitangi** principles were incorporated to ensure the application aligns with New Zealand’s commitment to cultural inclusivity, especially in terms of UI/UX design considerations.

## Future Enhancements

- Adding public transportation integration
- Developing offline mode functionality
- Push notifications for real-time traffic alerts

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

## Contribute
We welcome contributions from the community. To contribute:

1. **Fork the Project**
2. **Create a Branch** (`feature/YourFeature`)
3. **Commit Your Changes** (`git commit -m 'Add some feature'`)
4. **Push to the Branch** (`git push origin feature/YourFeature`)
5. **Open a Pull Request**

For major changes, please open an issue first to discuss what you would like to change.
