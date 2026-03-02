const SUPABASE_URL = 'https://wrbrregubbsyqiunfamh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYnJyZWd1YmJzeXFpdW5mYW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjAyNTMsImV4cCI6MjA4ODAzNjI1M30.KojhdGy_rq2e854j2jBFS67qF0gBdd0rXeQMCLpkpww';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

let currentSlide = 0;
let totalSlides = 0;

async function loadProductDetails() {
    if(!productId) return window.location.href = 'index.html';
    
    const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
    if(error || !data) return window.location.href = 'index.html';

    document.getElementById('p-name').innerText = data.name;
    document.getElementById('p-type').innerText = data.type;
    document.getElementById('p-color').innerText = data.color || 'N/A';
    document.getElementById('p-desc').innerText = data.description || 'No description available.';
    document.getElementById('whatsapp-link').href = `https://wa.me/916309889433?text=I'm%20interested%20in%20buying%20${encodeURIComponent(data.name)}`;

    // Build Slider
    const track = document.getElementById('slider-track');
    const images = data.images && data.images.length > 0 ? data.images : ['assets/logo.png'];
    totalSlides = images.length;
    
    images.forEach(imgUrl => {
        const img = document.createElement('img');
        img.src = imgUrl;
        track.appendChild(img);
    });

    // Hide buttons if only 1 image
    if(totalSlides <= 1) {
        document.getElementById('prev-btn').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';
    }
}

// Slider controls (Looping)
document.getElementById('next-btn').addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % totalSlides;
    document.getElementById('slider-track').style.transform = `translateX(-${currentSlide * 100}%)`;
});

document.getElementById('prev-btn').addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    document.getElementById('slider-track').style.transform = `translateX(-${currentSlide * 100}%)`;
});

loadProductDetails();