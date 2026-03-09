// PUT YOUR REAL SUPABASE DETAILS HERE
const SUPABASE_URL =window.location.origin + '/supabase-api';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYnJyZWd1YmJzeXFpdW5mYW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjAyNTMsImV4cCI6MjA4ODAzNjI1M30.KojhdGy_rq2e854j2jBFS67qF0gBdd0rXeQMCLpkpww';

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Menu Toggle
function toggleAdminMenu(event) {
    event.stopPropagation(); 
    const dropdown = document.getElementById('admin-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('admin-dropdown');
    if (dropdown && dropdown.style.display === 'block' && !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

// Heart Toggle
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

// Fetch Products
async function fetchProducts() {
    if(!supabaseClient) return; 
    try {
        const { data, error } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
        const container = document.getElementById('products-container');
        if(!container) return;
        container.innerHTML = ''; 
        
        data.forEach(item => {
            const coverImg = (item.images && item.images.length > 0) ? item.images[0] : 'assets/logo.png';
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cursor = 'pointer';
            card.onclick = () => window.location.href = `product.html?id=${item.id}`;
            
            const isSoldOut = item.status === 'Sold Out';
            const badgeHTML = isSoldOut ? `<span class="badge-sold-out">SOLD OUT</span>` : `<span class="badge-new">NEW</span>`;
            
            // This places the status bar ON the photo
            const statusBarHTML = isSoldOut
                ? `<div class="image-status-bar status-bar-sold-out">Sold Out</div>`
                : `<div class="image-status-bar status-bar-in-stock">In Stock</div>`;

            const actionBtnHTML = isSoldOut 
                ? `<button class="whatsapp-action-btn btn-disabled" onclick="event.stopPropagation();">Sold Out</button>`
                : `<a href="https://wa.me/917286931958?text=I'm%20interested%20in%20buying%20${encodeURIComponent(item.name)}" target="_blank" class="whatsapp-action-btn" onclick="event.stopPropagation();"><i class="fab fa-whatsapp"></i> Order</a>`;

            card.innerHTML = `
                <div class="image-container">
                    ${badgeHTML}
                    <div class="badge-heart"><i class="far fa-heart"></i></div>
                    <img src="${coverImg}" alt="${item.name}">
                    ${statusBarHTML} </div>
                <div class="product-info">
                    <p class="product-title">${item.name}</p>
                    ${actionBtnHTML}
                </div>
            `;
            container.appendChild(card);
        });
    } catch(err) { console.error("Error fetching products", err); }
}

// Fetch IG Links
async function fetchIGLinks() {
    if(!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient.from('instagram_links').select('*').order('created_at', { ascending: false });
        const container = document.getElementById('ig-container');
        if(!container) return;
        container.innerHTML = '';
        
        data.forEach(item => {
            const blockquote = document.createElement('blockquote');
            blockquote.className = 'instagram-media';
            blockquote.setAttribute('data-instgrm-permalink', item.url);
            blockquote.setAttribute('data-instgrm-version', '14');
            blockquote.style.cssText = 'background:#FFF; border:0; border-radius:12px; margin: 0 auto; max-width:400px; min-width:326px; width:99.375%;';
            container.appendChild(blockquote);
        });
        if(window.instgrm) window.instgrm.Embeds.process();
    } catch(err) {}
}

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    fetchIGLinks();
});