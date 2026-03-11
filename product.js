// PUT YOUR REAL SUPABASE DETAILS HERE
const SUPABASE_URL = window.location.origin + '/supabase-api';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYnJyZWd1YmJzeXFpdW5mYW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjAyNTMsImV4cCI6MjA4ODAzNjI1M30.KojhdGy_rq2e854j2jBFS67qF0gBdd0rXeQMCLpkpww';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

let currentSlide = 0;
let totalSlides = 0;

async function loadProductDetails() {
    if(!productId) return window.location.href = 'index.html';
    
    const { data, error } = await supabaseClient.from('products').select('*').eq('id', productId).single();
    if(error || !data) return window.location.href = 'index.html';

    document.getElementById('p-name').innerText = data.name;
    document.getElementById('p-type').innerText = data.type;
    document.getElementById('p-color').innerText = data.color || 'N/A';
    
    // Status Logic
    const statusEl = document.getElementById('p-status');
    statusEl.innerText = data.status || 'In Stock';
    if(data.status === 'Sold Out') {
        statusEl.style.color = 'red';
        const waBtn = document.getElementById('whatsapp-link');
        waBtn.innerText = "Sold Out";
        waBtn.style.backgroundColor = "#999";
        waBtn.style.pointerEvents = "none";
        waBtn.removeAttribute('href');
        waBtn.classList.remove('whatsapp-action-btn');
        waBtn.classList.add('whatsapp-action-btn', 'btn-disabled');
    } else {
        statusEl.style.color = '#25D366'; // Green for In Stock
        document.getElementById('whatsapp-link').href = `https://wa.me/917286931958?text=I'm%20interested%20in%20buying%20${encodeURIComponent(data.name)}`;
    }

    document.getElementById('p-desc').innerHTML = (data.description || '').replace(/\n/g, '<br>');

    const track = document.getElementById('slider-track');
    const dotsContainer = document.getElementById('slider-dots'); 
    const images = data.images && data.images.length > 0 ? data.images : ['assets/logo.png'];
    totalSlides = images.length;
    
    images.forEach((imgUrl, index) => {
        const img = document.createElement('img');
        img.src = imgUrl;
        
        // OPEN FULLSCREEN ON CLICK
        img.addEventListener('click', () => {
            document.getElementById('slider-container').classList.add('fullscreen-active');
            document.body.style.overflow = 'hidden'; // Stop background scrolling
        });
        
        track.appendChild(img);

        if (dotsContainer) {
            const dot = document.createElement('div');
            dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
            dotsContainer.appendChild(dot);
        }
    });

    if(totalSlides <= 1) {
        document.getElementById('prev-btn').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none'; 
    }
}

function updateSlider() {
    document.getElementById('slider-track').style.transform = `translateX(-${currentSlide * 100}%)`;
    const dots = document.querySelectorAll('.slider-dot');
    dots.forEach((dot, index) => {
        if(index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

document.getElementById('next-btn').addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSlider(); 
});

document.getElementById('prev-btn').addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateSlider(); 
});

// CLOSE FULLSCREEN ON CLICK
document.getElementById('close-fs-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('slider-container').classList.remove('fullscreen-active');
    document.body.style.overflow = 'auto'; // Re-enable scrolling
});


// TOUCH SWIPING LOGIC FOR MOBILE 
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

const sliderContainer = document.getElementById('slider-container');

sliderContainer.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, {passive: true});

sliderContainer.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, {passive: true});

function handleSwipe() {
    const xDiff = touchStartX - touchEndX;
    const yDiff = touchStartY - touchEndY;
    
    // Check if the user is swiping horizontally (not scrolling up/down)
    if (Math.abs(xDiff) > Math.abs(yDiff) && totalSlides > 1) {
        if (xDiff > 40) {
            // Swiped left -> Next image
            document.getElementById('next-btn').click();
        } else if (xDiff < -40) {
            // Swiped right -> Previous image
            document.getElementById('prev-btn').click();
        }
    }
}

loadProductDetails();