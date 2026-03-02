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
    document.getElementById('p-desc').innerText = data.description || '';
    document.getElementById('whatsapp-link').href = `https://wa.me/916309889433?text=I'm%20interested%20in%20buying%20${encodeURIComponent(data.name)}`;

    const track = document.getElementById('slider-track');
    const dotsContainer = document.getElementById('slider-dots'); // Targeting the dots container
    const images = data.images && data.images.length > 0 ? data.images : ['assets/logo.png'];
    totalSlides = images.length;
    
    images.forEach((imgUrl, index) => {
        // 1. Create the Image
        const img = document.createElement('img');
        img.src = imgUrl;
        track.appendChild(img);

        // 2. Create the Dot
        if (dotsContainer) {
            const dot = document.createElement('div');
            dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
            dotsContainer.appendChild(dot);
        }
    });

    if(totalSlides <= 1) {
        document.getElementById('prev-btn').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';
        if (dotsContainer) dotsContainer.style.display = 'none'; // Hide dots if only 1 image
    }
}

// NEW FUNCTION: Updates the image position AND the active dot
function updateSlider() {
    // Move the image track
    document.getElementById('slider-track').style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update active dot styling
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

loadProductDetails();