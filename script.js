// --- CONFIGURATION ---
const SUPABASE_URL = 'https://wrbrregubbsyqiunfamh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYnJyZWd1YmJzeXFpdW5mYW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjAyNTMsImV4cCI6MjA4ODAzNjI1M30.KojhdGy_rq2e854j2jBFS67qF0gBdd0rXeQMCLpkpww';

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// --- BULLETPROOF MENU TOGGLE LOGIC ---
function toggleAdminMenu(event) {
    event.stopPropagation(); 
    const dropdown = document.getElementById('admin-dropdown');
    
    if (dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
    } else {
        dropdown.style.display = 'block';
    }
}

document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('admin-dropdown');
    if (dropdown && dropdown.style.display === 'block') {
        if (!dropdown.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    }
}); 

// --- LIGHTBOX IMAGE EXPANSION LOGIC ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.lightbox-close');

function attachLightboxListeners() {
    const expandableImages = document.querySelectorAll('.expandable');
    expandableImages.forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation(); 
            lightboxImg.src = img.src; 
            lightbox.classList.add('active'); 
            document.body.style.overflow = 'hidden'; 
        });
    });
}

if(closeBtn && lightbox) {
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; 
        setTimeout(() => {
            if(!lightbox.classList.contains('active')) lightboxImg.src = '';
        }, 300); 
    }
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target !== lightboxImg) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
    });
}

// --- WISH LIST HEART TOGGLE LOGIC (Event Delegation) ---
document.addEventListener('click', function(e) {
    const heartBadge = e.target.closest('.badge-heart');
    if(heartBadge) {
        e.preventDefault(); 
        e.stopPropagation(); 
        const icon = heartBadge.querySelector('i');
        if(icon.classList.contains('far')) {
            icon.classList.replace('far', 'fas');
            icon.style.color = '#D81B60';
        } else {
            icon.classList.replace('fas', 'far');
            icon.style.color = '#999';
        }
    }
});

// --- FETCH PRODUCTS FROM SUPABASE ---
async function fetchProducts() {
    if(!supabaseClient) return; 
    
    try {
        const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
        if (error) return console.error(error);
        
        const container = document.getElementById('products-container');
        if(!container) return;
        
        container.innerHTML = ''; 
        
        data.forEach(item => {
            const coverImg = (item.images && item.images.length > 0) ? item.images[0] : 'assets/logo.png';
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cursor = 'pointer';
            
            card.onclick = () => window.location.href = `product.html?id=${item.id}`;
            
            card.innerHTML = `
                <div class="image-container">
                    <span class="badge-new">NEW</span>
                    <div class="badge-heart"><i class="far fa-heart"></i></div>
                    <img src="${coverImg}" alt="${item.name}">
                </div>
                <div class="product-info">
                    <p class="product-title">${item.name}</p>
                    <a href="https://wa.me/916309889433?text=I'm%20interested%20in%20buying%20${encodeURIComponent(item.name)}" 
                       target="_blank" class="whatsapp-action-btn" onclick="event.stopPropagation();">
                        <i class="fab fa-whatsapp"></i> order now
                    </a>
                </div>
            `;
            container.appendChild(card);
        });
    } catch(err) {
        console.error("Network timeout fetching products.");
    }
}

// --- FETCH INSTAGRAM LINKS FROM SUPABASE ---
async function fetchIGLinks() {
    if(!supabaseClient) return;

    try {
        const { data, error } = await supabaseClient.from('instagram_links').select('*').order('created_at', { ascending: false });
        if (error) return console.error(error);
        
        const container = document.getElementById('ig-container');
        if(!container) return;
        
        container.innerHTML = '';
        
        data.forEach(item => {
            const blockquote = document.createElement('blockquote');
            blockquote.className = 'instagram-media';
            blockquote.setAttribute('data-instgrm-permalink', item.url);
            blockquote.setAttribute('data-instgrm-version', '14');
            blockquote.style.cssText = 'background:#FFF; border:0; border-radius:12px; box-shadow:0 8px 20px rgba(0,0,0,0.05); margin: 0 auto; max-width:400px; min-width:326px; padding:0; width:99.375%;';
            container.appendChild(blockquote);
        });
        
        if(window.instgrm) window.instgrm.Embeds.process();
    } catch(err) {
        console.error("Network timeout fetching Instagram links.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    attachLightboxListeners(); 
    fetchProducts();
    fetchIGLinks();
});