# weather-app
### A client-server web application with TypeScript and Node.js
![weather-app](https://github.com/PrisonerM13/weather-app/blob/master/gif/weather-app.gif "weather-app")

### Tools & Libraries
- [Node.js](https://nodejs.org/dist/latest-v10.x/docs/api/) - Server
- [node-fetch](https://www.npmjs.com/package/node-fetch) - Communication with Weather API
- [OpenWeatherMap](https://openweathermap.org/api "OpenWeatherMap") - Weather API
- [Leaflet](http://leafletjs.com/ "Leaflet") - Interactive map
- [leaflet-color-markers](https://github.com/pointhi/leaflet-color-markers) - Map markers
- [lodash](https://www.npmjs.com/package/lodash)

### Features
#### Responsive design - The display is adjusted to screen dimensions

#### Caching:
Server side:

- Static files (html, css, js, json, images)
- Weather data (with a predetermined expiration time)

Client side:

- Cities data (coordinates, country, state etc)
- Weather data (with a predetermined expiration time)

### Installation & Run:

1. Open command prompt in 'weather-app' folder
2. Type 'npm install' - that will install all the required packages for the application
3. Type 'npm start' - that will run the server
4. Open a browser at http://localhost:8080

### Routes:

| Route                           | Description
| ------------------------------- | -----------
| /                               | Root - Weather data is not displayed and map is scaled to fit the world
| /weather?city={city},{country}  | City's weather - Displays the weather of the selected city and zooms the map on that city

### User Interface

#### Selecting a city:
Option 1: Select a city from the dropdown list above the weather panel

Option 2: Click on a city marker on the map

> Upon selecting a city, the map is zoomed on that city and the city's weather is displayed in the weather panel
