// Interactive Heart Logic
document.querySelectorAll('.badge-heart').forEach(heart => {
    heart.addEventListener('click', function(e) {
        e.preventDefault(); 
        const icon = this.querySelector('i');
        if(icon.classList.contains('far')) {
            icon.classList.replace('far', 'fas');
            icon.style.color = '#D81B60';
        } else {
            icon.classList.replace('fas', 'far');
            icon.style.color = '#999';
        }
    });
});

// --- Lightbox Image Expansion Logic ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.lightbox-close');

const expandableImages = document.querySelectorAll('.expandable');

expandableImages.forEach(img => {
    img.addEventListener('click', () => {
        lightboxImg.src = img.src; 
        lightbox.classList.add('active'); 
        document.body.style.overflow = 'hidden'; 
    });
});

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto'; 
    setTimeout(() => {
        if(!lightbox.classList.contains('active')) lightboxImg.src = '';
    }, 300); 
}

closeBtn.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) {
        closeLightbox();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
    }
});