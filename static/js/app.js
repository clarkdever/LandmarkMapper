document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map').setView([30.2672, -97.7431], 13); // Set initial view to Austin, TX
    let markers = L.layerGroup().addTo(map);
    let cachedLandmarks = {};
    let cachedLandmarkInfo = {};
    let currentFilter = 'all';
    let landmarkCounts = {};

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function fetchLandmarks() {
        document.getElementById('loading-indicator').style.display = 'block';
        const bounds = map.getBounds();
        const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
        console.log('Fetching landmarks for bbox:', bbox);

        fetch(`/get_landmarks?bbox=${bbox}`)
            .then(response => response.json())
            .then(data => {
                console.log('Fetched landmarks:', data.landmarks.length);
                data.landmarks.forEach(landmark => {
                    if (!cachedLandmarks[landmark.pageid]) {
                        cachedLandmarks[landmark.pageid] = landmark;
                    }
                });
                landmarkCounts = data.counts;
                updateMarkers();
                updateFilterButtons();
                document.getElementById('loading-indicator').style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching landmarks:', error);
                document.getElementById('loading-indicator').style.display = 'none';
            });
    }

    const debouncedFetchLandmarks = debounce(fetchLandmarks, 300);
    map.on('moveend', debouncedFetchLandmarks);
    map.on('zoomend', debouncedFetchLandmarks);

    function updateMarkers() {
        markers.clearLayers();
        const bounds = map.getBounds();
        Object.values(cachedLandmarks).forEach(landmark => {
            if (bounds.contains([landmark.lat, landmark.lon]) && 
                (currentFilter === 'all' || landmark.type === currentFilter)) {
                const marker = L.marker([landmark.lat, landmark.lon])
                    .bindPopup(`<h3>${landmark.title}</h3><p>Loading...</p>`, { className: 'landmark-popup' });
                
                marker.on('click', () => {
                    if (cachedLandmarkInfo[landmark.pageid]) {
                        updatePopupContent(marker, cachedLandmarkInfo[landmark.pageid], landmark);
                    } else {
                        fetch(`/get_landmark_info/${landmark.pageid}`)
                            .then(response => response.json())
                            .then(info => {
                                cachedLandmarkInfo[landmark.pageid] = info;
                                updatePopupContent(marker, info, landmark);
                            });
                    }
                });

                markers.addLayer(marker);
            }
        });
    }

    function updatePopupContent(marker, info, landmark) {
        const wikipediaLink = `https://en.wikipedia.org/wiki?curid=${landmark.pageid}`;
        marker.setPopupContent(`
            <h3>${info.title}</h3>
            <p>${info.extract}</p>
            <p>Type: ${landmark.type}</p>
            <p class='more-info-link'><a href='${wikipediaLink}' target='_blank'>Would you like to know more?</a></p>
        `);
        marker.openPopup();
    }

    function updateFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            const type = button.getAttribute('data-type');
            const count = landmarkCounts[type] || 0;
            button.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} (${count})`;
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

    // Set Location functionality
    const setLocationBtn = document.getElementById('set-location-btn');
    setLocationBtn.addEventListener('click', () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    map.setView([lat, lon], 13);
                    L.marker([lat, lon]).addTo(map)
                        .bindPopup('Your current location')
                        .openPopup();
                    fetchLandmarks();
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Unable to retrieve your location. Please make sure you've granted permission to access your location.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    });

    // Initial fetch of landmarks
    fetchLandmarks();
});
