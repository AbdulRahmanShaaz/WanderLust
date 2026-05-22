
const locationCoords = {
  "Goa": [73.9500, 15.2993],
  "Manali": [77.1887, 32.2432],
  "Jaipur": [75.7873, 26.9124],
  "Udaipur": [73.7125, 24.5854],
  "Mumbai": [72.8777, 19.0760],
  "Delhi": [77.2090, 28.6139],
  "Bangkok": [100.5018, 13.7563],
  "Paris": [2.3522, 48.8566],
  "New York": [-74.0060, 40.7128],
  "Bali": [115.1889, -8.3405],
  "Santorini": [25.4615, 36.3932],
  "Dubai": [55.2708, 25.2048],
  "Amsterdam": [4.9041, 52.3676],
  "Tokyo": [139.6917, 35.6895],
  "London": [-0.1278, 51.5074],
  "Tuscany": [11.2463, 43.7711],
  "Serengeti": [34.8320, -2.3342],
  "Boston": [-71.0589, 42.3601],
  "Banff": [-115.5708, 51.1784],
  "Miami": [-80.1918, 25.7617],
  "Phuket": [98.3923, 7.9519],
  "Scotland": [-4.2026, 57.4721],
  "Montana": [-110.3626, 46.8797],
  "Greece": [23.7275, 37.9838],
  "Charleston": [-79.9311, 32.7765],
  "Maldives": [73.2207, 3.2028],
  "Aspen": [-106.8175, 39.1911],
  "Costa Rica": [-84.0861, 9.7489],
  "Cancun": [-86.8515, 21.1619]
};

function getCoordinates(location, country) {
  for (const key in locationCoords) {
    if (location && location.includes(key)) {
      return locationCoords[key];
    }
    if (country && country.includes(key)) {
      return locationCoords[key];
    }
  }
  return [77.209, 28.6139];
}

module.exports = { getCoordinates };
