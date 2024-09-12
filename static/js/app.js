document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([0, 0], 2);
    let markers = L.layerGroup().addTo(map);
    let allLandmarks = [];
    let currentFilter = 'all';

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Use HTML5 Geolocation API to center the map on the user's location
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 13);
            fetchLandmarks();
        }, () => {
            console.error("Unable to retrieve your location");
        });
    }

    map.on('moveend', fetchLandmarks);

    function fetchLandmarks() {
        const bounds = map.getBounds();
        const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

        fetch(`/get_landmarks?bbox=${bbox}`)
            .then(response => response.json())
            .then(landmarks => {
                allLandmarks = landmarks;
                updateMarkers();
            })
            .catch(error => console.error('Error fetching landmarks:', error));
    }

    function updateMarkers() {
        markers.clearLayers();
        allLandmarks.forEach(landmark => {
            if (currentFilter === 'all' || landmark.type === currentFilter) {
                const marker = L.marker([landmark.lat, landmark.lon])
                    .bindPopup(`<h3>${landmark.title}</h3><p>Loading...</p>`, { className: 'landmark-popup' });
                
                marker.on('click', () => {
                    fetch(`/get_landmark_info/${landmark.pageid}`)
                        .then(response => response.json())
                        .then(info => {
                            marker.setPopupContent(`<h3>${info.title}</h3><p>${info.extract}</p><p>Type: ${landmark.type}</p>`);
                            marker.openPopup();
                        });
                });

                markers.addLayer(marker);
            }
        });
    }

    // Add event listeners to filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentFilter = button.getAttribute('data-type');
            updateMarkers();
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
});
