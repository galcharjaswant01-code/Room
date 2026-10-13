document.addEventListener('DOMContentLoaded', () => {
    const featuredContainer = document.getElementById('featured-rooms-container');

    async function loadFeaturedRooms() {
        if (!featuredContainer) return;
        
        window.handleImageError = function(img) {
            img.onerror = null;
            img.src = "images/property-fallback.jpg";
        };
        
        try {
            // Fetch latest 4 available rooms
            const rooms = await api.getRooms('ordering=-created_at&is_available=true');
            const featured = rooms.slice(0, 4);

            if (featured.length === 0) {
                featuredContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No rooms available at the moment.</div>';
                return;
            }

            featuredContainer.innerHTML = featured.map(room => `
                <div class="property-card">
                    <div class="property-image">
                        <span class="property-badge" style="color: green">Available</span>
                        <button class="property-fav-btn"><i class="far fa-heart"></i></button>
                        ${room.images && room.images.length > 0 ? `<div class="property-image-count"><i class="fas fa-camera"></i> ${room.images.length}</div>` : ''}
                        <img src="${room.images && room.images.length > 0 ? room.images[0].image : 'images/property-fallback.jpg'}" alt="${room.title}" onerror="handleImageError(this)">
                    </div>
                    <div class="property-content">
                        <div class="property-price">₹${room.price} <span>/ month</span></div>
                        <h3 class="property-title">${room.title}</h3>
                        <p class="property-location"><i class="fas fa-map-marker-alt"></i> ${room.location}</p>
                        <div class="property-meta" style="margin-bottom: 10px;">
                            <span><i class="fas fa-bed"></i> ${room.room_type}</span>
                            <span class="property-rating"><i class="fas fa-star"></i> ${room.reviews && room.reviews.length > 0 ? (room.reviews.reduce((a,b)=>a+b.rating,0)/room.reviews.length).toFixed(1) : 'New'}</span>
                        </div>
                        <a href="pages/room_detail.html?id=${room.id}" class="btn btn-outline" style="width: 100%; text-align: center;">View Details</a>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            featuredContainer.innerHTML = '<div style="color:red; grid-column: 1/-1;">Error loading featured rooms. Make sure backend is running.</div>';
        }
    }

    loadFeaturedRooms();
    
    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if (mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            document.querySelector('.nav-links').style.display = 
                document.querySelector('.nav-links').style.display === 'flex' ? 'none' : 'flex';
            document.querySelector('.nav-actions').style.display = 
                document.querySelector('.nav-actions').style.display === 'flex' ? 'none' : 'flex';
        });
    }
});
