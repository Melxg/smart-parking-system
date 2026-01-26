let map;
let markers = [];

const findBtn = document.getElementById("findParkingBtn");
const parkingList = document.getElementById("parking-list");

findBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      initMap(lat, lng);
      searchNearby(lat, lng);
    },
    () => {
      alert("Location permission denied");
    }
  );
});

function initMap(lat, lng) {
  if (!map) {
    map = L.map("map").setView([lat, lng], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);
  }

  // User location marker
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup("📍 You are here")
    .openPopup();
}

async function searchNearby(lat, lng) {
  parkingList.innerHTML = "Searching parking...";
  clearMarkers();

  const parkings = await API.searchParking(lat, lng);
  renderParkings(parkings);
  renderMarkers(parkings);
}

function renderMarkers(parkings) {
  parkings.forEach((p) => {
    const loc = p.parkingLocations[0];

    const marker = L.marker([loc.latitude, loc.longitude])
      .addTo(map)
      .bindPopup(`
        <b>${p.name}</b><br/>
        Available: ${p.available_spots}<br/>
        <button onclick="startParking(${p.id})">
          Start Parking
        </button>
      `);

    markers.push(marker);
  });
}

function renderParkings(parkings) {
  parkingList.innerHTML = "";

  if (parkings.length === 0) {
    parkingList.innerHTML = "<p>No parking available</p>";
    return;
  }

  parkings.forEach((p) => {
    const div = document.createElement("div");
    div.className = "parking-card";

    div.innerHTML = `
      <h3>${p.name}</h3>
      <p>Available spots: ${p.available_spots}</p>
      <p>Price/hour: ${p.price_per_hour}</p>
      <button onclick="startParking(${p.id})">
        Start Parking
      </button>
    `;

    parkingList.appendChild(div);
  });
}

function clearMarkers() {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];
}
