# 🌤 Weather App Poco

This is a simple weather app that shows the current weather of any city.  
It uses the **OpenWeatherMap API** to get weather data.

🔗 **Live Page:** [Weather App Poco](https://recep-demir.github.io/weather-app-poco/)

---

## 📷 Screenshot
![Weather App Screenshot](./img/image.png)

---

## ⚙️ Features
- Search for any city
- Shows temperature and weather condition
- Dynamic background (warm or cold)
- Responsive design for mobile and desktop

---

## 🧩 Technologies Used
- HTML  
- CSS  
- JavaScript  
- [OpenWeatherMap API](https://openweathermap.org/)  
- [SweetAlert2](https://sweetalert2.github.io/)

---

## 🚀 How to Run
1. Clone or download this repository.  
2. Open `index.html` in your browser.  
3. Type a city name and press **Search**.

---

## 💡 API Key
You can get your own API key from [OpenWeatherMap](https://openweathermap.org/api)  
Then put it in `app.js`:
```js
const api = {
  key: "YOUR_API_KEY",
  base: "https://api.openweathermap.org/data/2.5/"
}
```

---

## 🧑‍💻 Authors
This project was created by a team:  

- **Recep Demir** → [@recep-demir](https://github.com/recep-demir)  
- **Burcu Aksoy** → [@burcuaksoy-ch](https://github.com/burcuaksoy-ch)  
- **Muhammet Şantas** → [@muhammetsnts](https://github.com/muhammetsnts)  
- **İlker Güler** → [@igulernavy](https://github.com/igulernavy)

---

### 📱 Responsive View
Works well on both desktop and mobile devices.

---

## 🆕 New features (added)

- Map-based location picker: click on the map to choose a location and load its weather.
- Save weather results: after searching or picking on the map, use "Save Location" to store the result locally (stored in your browser's localStorage).
- Compare saved locations: open "Show Saved", check two or more saved items and press "Compare Selected" to view a side-by-side comparison.

Dependencies added: Leaflet (loaded from CDN) for the interactive map.

### Additional improvements (Nov 2025)

- Reverse geocoding: when you click the map, the app uses OpenWeatherMap's reverse geocoding to show a nicer place name (if available).
- Edit & Delete saved entries: open "Show Saved" to rename or remove saved locations.
- Comparison charts: when comparing saved locations, a Chart.js bar chart displays temperatures for quick visual comparison.

Notes:
- Chart.js and Leaflet are loaded via CDN in `index.html`. No extra install is required for local testing — just open `index.html` in a browser.
- Reverse geocoding uses your OpenWeatherMap API key (same key used for weather). If you replace the key in `app.js`, reverse geocoding will continue to work.
