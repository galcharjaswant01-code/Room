document.addEventListener('DOMContentLoaded', () => {
    const filterForm = document.getElementById('filter-form');
    const priceRange = document.getElementById('filter-price');
    const priceVal = document.getElementById('price-val');
    const sortSelect = document.getElementById('sort-select');
    const resultsContainer = document.getElementById('search-results');
    const resultsCount = document.getElementById('results-count');

    // Parse URL params for initial state
    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('location')) document.getElementById('filter-location').value = urlParams.get('location');
    if(urlParams.get('room_type')) document.getElementById('filter-type').value = urlParams.get('room_type');
    if(urlParams.get('price_max')) {
        priceRange.value = urlParams.get('price_max');
        priceVal.textContent = '₹' + (priceRange.value / 1000) + 'k';
    }

    priceRange.addEventListener('input', (e) => {
        priceVal.textContent = '₹' + (e.target.value / 1000) + 'k';
    });

    window.handleImageError = function(img) {
        img.onerror = null;
        img.src = "../images/property-fallback.jpg";
    };

    async function loadRooms() {
        resultsContainer.innerHTML = '<div class="loading-spinner">Loading rooms...</div>';
        
        // Build query string
        const params = new URLSearchParams();
        const loc = document.getElementById('filter-location').value;
        const type = document.getElementById('filter-type').value;
        const maxPrice = document.getElementById('filter-price').value;
        const sort = sortSelect.value;

        if (loc) params.append('search', loc); // DRF search filter applies to title, desc, location
        if (type) params.append('room_type', type);
        if (sort) params.append('ordering', sort);
        
        try {
            const data = await api.getRooms(params.toString());
            // Filter by price on frontend since we didn't add django-filter price range yet (to keep it simple)
            // Ideally should be backend filter ?price__lte=maxPrice
            const rooms = data.filter(r => parseFloat(r.price) <= parseFloat(maxPrice));
            
            resultsCount.textContent = `${rooms.length} Room${rooms.length !== 1 ? 's' : ''} Found`;
            
            if (rooms.length === 0) {
                resultsContainer.innerHTML = '<div class="text-center" style="grid-column: 1/-1; padding: 40px;">No rooms found matching your criteria.</div>';
                return;
            }

            resultsContainer.innerHTML = rooms.map(room => `
                <div class="property-card">
                    <div class="property-image">
                        ${room.is_available ? '<span class="property-badge" style="color: green">Available</span>' : '<span class="property-badge" style="color: red">Booked</span>'}
                        <button class="property-fav-btn"><i class="far fa-heart"></i></button>
                        ${room.images && room.images.length > 0 ? `<div class="property-image-count"><i class="fas fa-camera"></i> ${room.images.length}</div>` : ''}
                        <img src="${room.images && room.images.length > 0 ? room.images[0].image : '../images/property-fallback.jpg'}" alt="${room.title}" onerror="handleImageError(this)">
                    </div>
                    <div class="property-content">
                        <div class="property-price">₹${room.price} <span>/ month</span></div>
                        <h3 class="property-title">${room.title}</h3>
                        <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${room.location}</p>
                        <div class="property-meta" style="margin-bottom: 10px;">
                            <span><i class="fas fa-bed"></i> ${room.room_type}</span>
                            <span class="property-rating"><i class="fas fa-star"></i> ${room.reviews && room.reviews.length > 0 ? (room.reviews.reduce((a,b)=>a+b.rating,0)/room.reviews.length).toFixed(1) : 'New'}</span>
                        </div>
                        <a href="room_detail.html?id=${room.id}" class="btn btn-outline" style="width: 100%; text-align: center;">View Details</a>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            resultsContainer.innerHTML = '<div style="color:red; grid-column: 1/-1;">Error loading rooms. Ensure backend is running.</div>';
            resultsCount.textContent = 'Error';
        }
    }

    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loadRooms();
    });

    sortSelect.addEventListener('change', () => {
        loadRooms();
    });

    document.getElementById('reset-filters').addEventListener('click', () => {
        filterForm.reset();
        priceVal.textContent = '₹50k';
        loadRooms();
    });

    // Initial load
    loadRooms();
});
