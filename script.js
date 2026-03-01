const API_URL = 'http://localhost:5000/api/products';

document.addEventListener('DOMContentLoaded', () => {
    // Check which page we are currently on
    const homeGrid = document.getElementById('home-grid');
    const newArrivalsGrid = document.getElementById('new-arrivals-grid');
    const pattuGrid = document.getElementById('pattu-grid');
    const cottonGrid = document.getElementById('cotton-grid');
    const fancyGrid = document.getElementById('fancy-grid');
    const singleProductContainer = document.getElementById('single-product-container');

    // Route logic
    if(homeGrid) loadProducts(homeGrid, 'home');
    if(newArrivalsGrid) loadProducts(newArrivalsGrid, 'all');
    if(pattuGrid) loadProducts(pattuGrid, 'pattu');
    if(cottonGrid) loadProducts(cottonGrid, 'cotton');
    if(fancyGrid) loadProducts(fancyGrid, 'fancy');
    
    // If we are on the product.html page, load the single product details
    if(singleProductContainer) loadSingleProduct();

    setupLightbox(); // Keep the lightbox for zooming in on images
});

// --- GRID DISPLAY LOGIC ---
async function loadProducts(container, filterType) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Loading fresh collections...</p>';

    try {
        const response = await fetch(API_URL);
        let products = await response.json();

        if (filterType === 'home') {
            products = products.slice(0, 4); 
        } else if (filterType !== 'all') {
            products = products.filter(p => p.category === filterType);
        }

        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: gray;">No items available yet.</p>`;
            return;
        }

        products.forEach((product, index) => {
            const uniqueId = `prod-${index}`;
            let safeImages = Array.isArray(product.images) ? product.images : JSON.parse(product.images || "[]");
            let mainImgHtml = `<img src="assets/logo.png" class="main-img" id="main-img-${uniqueId}">`;
            
            if (safeImages.length > 0) {
                mainImgHtml = `<img src="${safeImages[0]}" class="main-img" id="main-img-${uniqueId}">`;
            }

            const newBadge = product.isNew ? `<span class="badge-new">NEW</span>` : '';

            // Notice we wrap the image and title in an <a> tag pointing to product.html
            const cardHTML = `
                <div class="product-card">
                    <div class="image-container">
                        ${newBadge}
                        <div class="badge-heart" onclick="toggleHeart(this)"><i class="far fa-heart"></i></div>
                        <a href="product.html?id=${product.id}">${mainImgHtml}</a>
                    </div>
                    <div class="product-info">
                        <a href="product.html?id=${product.id}" style="text-decoration: none;">
                            <p class="product-title">${product.name}</p>
                            <p class="product-details">Color: ${product.color}</p>
                        </a>
                        <a href="product.html?id=${product.id}" class="btn-outline" style="margin-top: 15px; width: 100%; border-radius: 8px;">View Details</a>
                    </div>
                </div>
            `;
            container.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: red;">Failed to load products. Is the server running?</p>';
    }
}

// --- SINGLE PRODUCT PAGE LOGIC ---
async function loadSingleProduct() {
    const container = document.getElementById('single-product-container');
    
    // Get the product ID from the website URL (e.g., product.html?id=prod_12345)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        container.innerHTML = '<p style="text-align: center; margin: 100px 0;">Product not found.</p>';
        return;
    }

    try {
        const response = await fetch(API_URL);
        const products = await response.json();
        
        // Find the exact product
        const product = products.find(p => p.id === productId);

        if (!product) {
            container.innerHTML = '<p style="text-align: center; margin: 100px 0;">Product not found.</p>';
            return;
        }

        let safeImages = Array.isArray(product.images) ? product.images : JSON.parse(product.images || "[]");
        let safeIgLinks = Array.isArray(product.igLinks) ? product.igLinks : JSON.parse(product.igLinks || "[]");
        
        // Generate Image Gallery
        let mainImgHtml = `<img src="assets/logo.png" class="sp-main-img expandable" id="sp-main-image">`;
        let thumbnailsHtml = '';

        if (safeImages.length > 0) {
            mainImgHtml = `<img src="${safeImages[0]}" class="sp-main-img expandable" id="sp-main-image">`;
            if (safeImages.length > 1) {
                thumbnailsHtml = `<div class="sp-thumbnails">`;
                safeImages.forEach((img, i) => {
                    let activeClass = i === 0 ? 'active' : '';
                    thumbnailsHtml += `<img src="${img}" class="${activeClass}" onclick="changeMainImage('sp-main-image', this.src, this)">`;
                });
                thumbnailsHtml += `</div>`;
            }
        }

        // Generate Instagram Reels
        let igHtml = '';
        if (safeIgLinks.length > 0) {
            igHtml = '<h4 style="margin-top: 30px; margin-bottom: 10px; font-family: \'Playfair Display\';">Watch the Video</h4>';
            safeIgLinks.forEach(link => {
                let embedLink = link.includes('/embed') ? link : link.split('?')[0] + 'embed';
                igHtml += `<div class="ig-video-container"><iframe src="${embedLink}" scrolling="no" allowtransparency="true"></iframe></div>`;
            });
        }

        // WhatsApp Order Button
        const waMessage = encodeURIComponent(`Hi AnushaLabel! I am interested in buying the ${product.name} (${product.color}).`);

        const singleProductHTML = `
            <div class="single-product-wrapper">
                
                <div class="sp-image-gallery">
                    ${mainImgHtml}
                    ${thumbnailsHtml}
                </div>

                <div class="sp-details">
                    <p class="sp-category">${product.category}</p>
                    <h1 class="sp-title">${product.name}</h1>
                    <p class="sp-color">Color: ${product.color}</p>
                    
                    <a href="https://wa.me/918985175287?text=${waMessage}" target="_blank" class="whatsapp-action-btn" style="max-width: 300px; padding: 15px;">
                        <i class="fab fa-whatsapp" style="font-size: 1.5rem;"></i> Inquire / Order Now
                    </a>

                    ${igHtml}
                </div>
            </div>
        `;
        
        container.innerHTML = singleProductHTML;
        attachLightboxEvents(); // Allow zooming in on the main image on the product page

    } catch (error) {
        console.error("Error fetching single product:", error);
        container.innerHTML = '<p style="text-align: center; margin: 100px 0; color: red;">Failed to load product details.</p>';
    }
}

// --- HELPERS ---
window.changeMainImage = function(imageId, newSrc, thumbnailElement) {
    document.getElementById(imageId).src = newSrc;
    let siblings = thumbnailElement.parentElement.children;
    for(let el of siblings) el.classList.remove('active');
    thumbnailElement.classList.add('active');
}

window.toggleHeart = function(element) {
    const icon = element.querySelector('i');
    if(icon.classList.contains('far')) {
        icon.classList.replace('far', 'fas');
        icon.style.color = '#D81B60';
    } else {
        icon.classList.replace('fas', 'far');
        icon.style.color = '#999';
    }
}

// --- LIGHTBOX ---
function setupLightbox() {
    if(!document.getElementById('lightbox')) {
        const lb = document.createElement('div');
        lb.id = 'lightbox';
        lb.innerHTML = `<span class="lightbox-close" onclick="closeLightbox()">&times;</span><img id="lightbox-img" src="" alt="Expanded Image">`;
        document.body.appendChild(lb);
    }
}

function attachLightboxEvents() {
    const expandableImages = document.querySelectorAll('.expandable');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    expandableImages.forEach(img => img.replaceWith(img.cloneNode(true))); 

    document.querySelectorAll('.expandable').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src; 
            lightbox.classList.add('active'); 
        });
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target !== lightboxImg) closeLightbox();
    });
}

window.closeLightbox = function() {
    document.getElementById('lightbox').classList.remove('active');
}