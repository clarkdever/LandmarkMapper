# Local Landmarks Map

This web application displays local landmarks on an interactive map using Wikipedia data. It's built with Flask for the backend and Vanilla JavaScript with Leaflet.js for the frontend.

## Features

- Interactive map centered on Austin, TX (customizable)
- Display of local landmarks fetched from Wikipedia
- Filtering options for different types of landmarks (historical, natural, cultural, other)
- Popup information for each landmark with a brief description
- "Set Location" feature to center the map on the user's current location
- Responsive design for both desktop and mobile devices

## Tech Stack

- Backend: Flask (Python)
- Frontend: HTML, CSS, JavaScript
- Map: Leaflet.js
- Data Source: Wikipedia API

## Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install dependencies:
   ```
   pip install flask requests
   ```

3. Run the application:
   ```
   python main.py
   ```

4. Open a web browser and navigate to `http://localhost:5000` to view the application.

## Usage

- Pan and zoom the map to explore different areas
- Click on landmark markers to view information about each location
- Use the filter buttons to show specific types of landmarks
- Click the "Set Location" button to center the map on your current location (requires location permissions)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
