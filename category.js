// PUT YOUR REAL SUPABASE DETAILS HERE
const SUPABASE_URL = window.location.origin + '/supabase-api';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYnJyZWd1YmJzeXFpdW5mYW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjAyNTMsImV4cCI6MjA4ODAzNjI1M30.KojhdGy_rq2e854j2jBFS67qF0gBdd0rXeQMCLpkpww';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const urlParams = new URLSearchParams(window.location.search);
const categoryType = urlParams.get('type');

document.addEventListener('DOMContentLoaded', () => {
    if(!categoryType) {
        window.location.href = 'index.html'; 
        return;
    }
    
    document.getElementById('category-title').innerText = categoryType + " Collection";
    document.title = categoryType + " | AnushaLabel";
    
    fetchCategoryProducts();
});

async function fetchCategoryProducts() {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('type', categoryType) 
            .order('created_at', { ascending: false });
            
        const container = document.getElementById('category-products-container');
        container.innerHTML = ''; 
        
        if (error || !data || data.length === 0) {
            container.innerHTML = `<p style="text-align:center; width:100%; grid-column: 1 / -1; padding: 50px 0; font-family: 'Poppins';">We are updating our ${categoryType} collection. Check back soon!</p>`;
            return;
        }
        
        data.forEach(item => {
            const coverImg = (item.images && item.images.length > 0) ? item.images[0] : 'assets/logo.png';
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.cursor = 'pointer';
            card.onclick = () => window.location.href = `product.html?id=${item.id}`;
            
            const isSoldOut = item.status === 'Sold Out';
            const badgeHTML = isSoldOut ? `<span class="badge-sold-out">SOLD OUT</span>` : `<span class="badge-new">NEW</span>`;
            
            const productUrl = `${window.location.origin}/product.html?id=${item.id}`;
            
            // The raw coverImg link at the bottom triggers WhatsApp's automatic photo preview
            const waMessage = `Hi AnushaLabel, I'm interested in this product:
*Name:* ${item.name}
*Category:* ${item.type}
*Color:* ${item.color || 'N/A'}
*Product Page:* ${productUrl}

${coverImg}`;

            // If sold out, show the disabled Sold Out button instead of the Order button
            const actionBtnHTML = isSoldOut 
                ? `<button class="whatsapp-action-btn btn-disabled" onclick="event.stopPropagation();">Sold Out</button>`
                : `<a href="https://wa.me/916309889433?text=${encodeURIComponent(waMessage)}" target="_blank" class="whatsapp-action-btn" onclick="event.stopPropagation();"><i class="fab fa-whatsapp"></i> Order</a>`;

            card.innerHTML = `
                <div class="image-container">
                    ${badgeHTML}
                    <div class="badge-heart"><i class="far fa-heart"></i></div>
                    <img src="${coverImg}" alt="${item.name}">
                </div>
                <div class="product-info">
                    <p class="product-title">${item.name}</p>
                    ${actionBtnHTML}
                </div>
            `;
            container.appendChild(card);
        });
    } catch(err) { 
        console.error("Error fetching category products", err); 
    }
}