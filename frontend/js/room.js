let currentRoom = null;
let currentBookingId = null;

function handleImageError(img) {
    img.onerror = null;
    img.src = "../images/property-fallback.jpg";
}

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    const content = document.getElementById('room-content');

    if (!roomId) {
        content.innerHTML = '<div style="text-align:center; padding: 50px;">Room not found.</div>';
        return;
    }

    try {
        const room = await api.getRoom(roomId);
        currentRoom = room;
        
        let images = room.images || [];
        if (images.length === 0) {
            images = [{ image: '../images/property-fallback.jpg' }];
        }

        // Build premium gallery
        let galleryHtml = '<div class="premium-gallery">';
        
        // Main hero image
        galleryHtml += `
            <div class="gallery-main" onclick="openLightbox(0)">
                <img src="${images[0].image}" alt="Main View" onerror="handleImageError(this)">
            </div>
        `;
        
        // Secondary images
        galleryHtml += '<div class="gallery-secondary">';
        if (images[1]) {
            galleryHtml += `
                <div class="gallery-side" onclick="openLightbox(1)">
                    <img src="${images[1].image}" alt="View 2" onerror="handleImageError(this)">
                </div>
            `;
        }
        if (images[2]) {
            const hasMore = images.length > 3;
            galleryHtml += `
                <div class="gallery-side" onclick="openLightbox(2)">
                    <img src="${images[2].image}" alt="View 3" onerror="handleImageError(this)">
                    ${hasMore ? `<div class="gallery-overlay">+${images.length - 3} MORE PHOTOS</div>` : ''}
                </div>
            `;
        }
        galleryHtml += '</div></div>'; // end secondary and premium-gallery

        const facilitiesHtml = room.facilities.map(f => `
            <div class="facility-item"><i class="${f.icon || 'fas fa-check'}"></i> ${f.name}</div>
        `).join('');

        const reviewsHtml = room.reviews && room.reviews.length > 0 
            ? room.reviews.map(r => `
                <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
                    <div style="font-weight: 600;">${r.user_name} <span style="color: #F59E0B; font-size: 0.9em; margin-left:10px;"><i class="fas fa-star"></i> ${r.rating}</span></div>
                    <p style="color: #666; margin-top: 5px;">${r.comment}</p>
                </div>
            `).join('')
            : '<p>No reviews yet.</p>';

        const userStr = localStorage.getItem('user');
        const isLoggedIn = !!userStr;

        content.innerHTML = `
            <div class="room-header">
                <h1 class="room-title">${room.title}</h1>
                <div class="room-location"><i class="fas fa-map-marker-alt"></i> ${room.location}</div>
            </div>
            
            ${galleryHtml}
            
            <div class="room-layout">
                <div class="room-main">
                    <div class="room-info">
                        <h3>About this space</h3>
                        <p>${room.description.replace(/\n/g, '<br>')}</p>
                        
                        <h3 style="margin-top:40px;">What this place offers</h3>
                        <div class="facilities-list">
                            ${facilitiesHtml}
                        </div>
                        
                        <h3 style="margin-top:40px;">Location</h3>
                        <div class="map-container">
                            <div style="text-align:center;"><i class="fas fa-map-marked-alt" style="font-size: 2rem; margin-bottom: 10px; display:block;"></i> Map View:<br>${room.address}</div>
                        </div>

                        <h3 style="margin-top:40px;">Reviews</h3>
                        <div>${reviewsHtml}</div>
                    </div>
                </div>
                
                <div class="room-sidebar">
                    <div class="booking-card">
                        <div class="booking-price">₹${room.price} <span>/ month</span></div>
                        <div style="margin-bottom: 20px; color: ${room.is_available ? 'green' : 'red'}; font-weight: 500;">
                            ${room.is_available ? '<i class="fas fa-check-circle"></i> Available Now' : '<i class="fas fa-times-circle"></i> Not Available'}
                        </div>
                        
                        <div style="margin-bottom: 20px; font-size: 0.9rem; color: #666;">
                            <strong>Owner:</strong> ${room.owner_name}
                        </div>

                        ${room.is_available ? `
                            <button class="btn btn-primary" style="width:100%; margin-bottom: 10px;" onclick="${isLoggedIn ? 'openBookingModal()' : 'window.location.href=\'auth.html\''}">
                                ${isLoggedIn ? 'Book Now' : 'Login to Book'}
                            </button>
                        ` : `
                            <button class="btn btn-outline" style="width:100%; margin-bottom: 10px;" disabled>Currently Booked</button>
                        `}
                        
                        <button class="btn btn-outline" style="width:100%;" onclick="${isLoggedIn ? 'contactOwner()' : 'window.location.href=\'auth.html\''}">
                            Message Owner
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Setup booking form calculations
        const cin = document.getElementById('book-checkin');
        const cout = document.getElementById('book-checkout');
        const updatePrice = () => {
            if (cin && cin.value && cout && cout.value) {
                const d1 = new Date(cin.value);
                const d2 = new Date(cout.value);
                const months = (d2.getTime() - d1.getTime()) / (1000 * 3600 * 24 * 30);
                if (months > 0) {
                    const total = Math.ceil(months * parseFloat(room.price));
                    document.getElementById('calc-total').textContent = `₹${total}`;
                    document.getElementById('pay-amount').textContent = `₹${total}`;
                }
            }
        };
        if(cin) cin.addEventListener('change', updatePrice);
        if(cout) cout.addEventListener('change', updatePrice);

    } catch (e) {
        console.error(e);
        content.innerHTML = '<div style="text-align:center; padding: 50px; color: red;">Error loading room details.</div>';
    }
});

function openBookingModal() {
    document.getElementById('booking-modal').style.display = 'flex';
}

function closeBookingModal() {
    document.getElementById('booking-modal').style.display = 'none';
}

const bForm = document.getElementById('booking-form');
if (bForm) {
    bForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const cin = document.getElementById('book-checkin').value;
        const cout = document.getElementById('book-checkout').value;
        const totalText = document.getElementById('calc-total').textContent.replace('₹', '');
        
        if (new Date(cin) >= new Date(cout)) {
            alert("Check-out must be after check-in");
            return;
        }

        try {
            const bookBtn = e.target.querySelector('button');
            bookBtn.textContent = 'Processing...';
            bookBtn.disabled = true;

            const booking = await api.createBooking({
                room: currentRoom.id,
                check_in_date: cin,
                check_out_date: cout,
                total_amount: totalText
            });
            
            currentBookingId = booking.id;
            
            document.getElementById('booking-step-1').style.display = 'none';
            document.getElementById('booking-step-2').style.display = 'block';
            
        } catch (e) {
            alert("Booking failed. " + (e.message || ''));
            const bookBtn = e.target.querySelector('button');
            bookBtn.textContent = 'Proceed to Payment';
            bookBtn.disabled = false;
        }
    });
}

async function processMockPayment() {
    try {
        const btn = document.getElementById('pay-btn');
        btn.textContent = 'Processing Secure Payment...';
        btn.disabled = true;
        
        await new Promise(r => setTimeout(r, 1500));
        await api.processPayment(currentBookingId, { method: 'mock_card' });
        
        document.getElementById('booking-step-2').style.display = 'none';
        document.getElementById('booking-step-3').style.display = 'block';
        
    } catch(e) {
        alert("Payment failed: " + e.message);
        const btn = document.getElementById('pay-btn');
        btn.textContent = `Pay ${document.getElementById('pay-amount').textContent}`;
        btn.disabled = false;
    }
}

function contactOwner() {
    alert("Messaging module requires a full implementation. This will be connected to the messaging dashboard.");
}

/* ==========================================================================
   Lightbox Logic
   ========================================================================== */
let currentLightboxIndex = 0;

function openLightbox(index) {
    const modal = document.getElementById('gallery-lightbox');
    if (!modal) return;
    
    currentLightboxIndex = index;
    modal.classList.add('active');
    updateLightbox();
}

function closeLightbox() {
    const modal = document.getElementById('gallery-lightbox');
    if (modal) modal.classList.remove('active');
}

function nextLightboxImage() {
    if (!currentRoom || !currentRoom.images) return;
    currentLightboxIndex = (currentLightboxIndex + 1) % currentRoom.images.length;
    updateLightbox();
}

function prevLightboxImage() {
    if (!currentRoom || !currentRoom.images) return;
    currentLightboxIndex = (currentLightboxIndex - 1 + currentRoom.images.length) % currentRoom.images.length;
    updateLightbox();
}

function setLightboxImage(index) {
    currentLightboxIndex = index;
    updateLightbox();
}

function updateLightbox() {
    if (!currentRoom || !currentRoom.images || currentRoom.images.length === 0) return;
    
    const imgEl = document.getElementById('lightbox-main-img');
    const counterEl = document.getElementById('lightbox-counter');
    
    imgEl.src = currentRoom.images[currentLightboxIndex].image;
    counterEl.textContent = `${currentLightboxIndex + 1} / ${currentRoom.images.length}`;
    
    // Update active state of thumbnails
    document.querySelectorAll('.lightbox-thumb').forEach((thumb, idx) => {
        if (idx === currentLightboxIndex) {
            thumb.classList.add('active');
            // scroll into view smoothly
            thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            thumb.classList.remove('active');
        }
    });
}

// Global Event Listeners for Lightbox
document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('gallery-lightbox');
    if (modal && modal.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextLightboxImage();
        if (e.key === 'ArrowLeft') prevLightboxImage();
    }
});

// Build lightbox DOM dynamically if missing
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('gallery-lightbox')) return;
    
    const lightboxHtml = `
        <div id="gallery-lightbox" class="lightbox-modal">
            <span class="lightbox-close" onclick="closeLightbox()">&times;</span>
            <div class="lightbox-counter" id="lightbox-counter"></div>
            
            <div class="lightbox-content" onclick="if(event.target === this) closeLightbox()">
                <div class="lightbox-prev" onclick="prevLightboxImage()">&#10094;</div>
                <img id="lightbox-main-img" class="lightbox-img" src="" alt="Gallery Image" onerror="handleImageError(this)">
                <div class="lightbox-next" onclick="nextLightboxImage()">&#10095;</div>
            </div>
            
            <div class="lightbox-thumbnails" id="lightbox-thumbnails"></div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHtml);
    
    // Once room loads, populate thumbnails
    const observer = new MutationObserver(() => {
        if (currentRoom && currentRoom.images) {
            const thumbContainer = document.getElementById('lightbox-thumbnails');
            if (thumbContainer && thumbContainer.innerHTML === '') {
                thumbContainer.innerHTML = currentRoom.images.map((img, idx) => `
                    <img src="${img.image}" class="lightbox-thumb" onclick="setLightboxImage(${idx})" onerror="handleImageError(this)">
                `).join('');
            }
        }
    });
    observer.observe(document.getElementById('room-content'), { childList: true });
});
