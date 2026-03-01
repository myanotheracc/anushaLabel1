const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dfkuht22n/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'anusha_sarees'; 
const API_URL = 'http://localhost:5000/api/products';

let selectedFiles = [];
let existingImagesOnEdit = []; 
let allProducts = []; 

function checkAuth() {
    const pass = document.getElementById('admin-password').value;
    if (pass === "admin123") { 
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
        renderAdminTable(); 
    } else {
        alert("Incorrect Password");
    }
}

function previewImages() {
    const previewArea = document.getElementById('image-preview');
    selectedFiles = document.getElementById('p-photos').files;
    previewArea.innerHTML = '';
    Array.from(selectedFiles).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            previewArea.appendChild(img);
        }
        reader.readAsDataURL(file);
    });
}

document.getElementById('product-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.innerText = "Processing... Please wait";
    submitBtn.disabled = true;

    try {
        const editId = document.getElementById('edit-id').value;
        let imageUrls = [];

        if (selectedFiles.length > 0) {
            for (let file of selectedFiles) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                const cloudinaryRes = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData });
                const imgData = await cloudinaryRes.json();
                imageUrls.push(imgData.secure_url);
            }
        } else {
            imageUrls = existingImagesOnEdit;
        }

        const rawIgLinks = document.getElementById('p-ig').value || "";
        const igLinksArray = rawIgLinks.split(',').map(link => link.trim()).filter(link => link !== "");

        // REMOVED PRICE FROM HERE
        const productData = {
            id: editId || 'prod_' + Date.now(),
            name: document.getElementById('p-name').value,
            category: document.getElementById('p-category').value,
            color: document.getElementById('p-color').value,
            images: imageUrls, 
            igLinks: igLinksArray,
            dateAdded: Date.now()
        };

        const fetchMethod = editId ? 'PUT' : 'POST';
        const fetchUrl = editId ? `${API_URL}/${editId}` : API_URL;

        const response = await fetch(fetchUrl, {
            method: fetchMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        if(response.ok) {
            alert(editId ? "Product Updated Successfully!" : "Product Added Successfully!");
            cancelEdit();
            renderAdminTable(); 
        } else {
            alert("Failed to save to database.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Check the console.");
    }

    submitBtn.innerText = "Upload Saree";
    submitBtn.disabled = false;
});

async function renderAdminTable() {
    const tbody = document.getElementById('admin-table-body');
    try {
        const response = await fetch(API_URL);
        allProducts = await response.json(); 
        tbody.innerHTML = '';
        
        allProducts.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 500;">${p.name}</td>
                <td><span style="color:gray; font-size:0.85rem;">${p.category.toUpperCase()}</span><br>${p.color}</td>
                <td class="action-icons">
                    <i class="fas fa-edit icon-edit" onclick="editProduct('${p.id}')" title="Edit"></i>
                    <i class="fas fa-trash icon-delete" onclick="deleteProduct('${p.id}')" title="Delete"></i>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="3" style="color:red;">Error loading data.</td></tr>';
    }
}

window.editProduct = function(id) {
    const product = allProducts.find(p => p.id === id);
    if(!product) return;

    document.getElementById('form-title').innerText = "Modify Material";
    document.getElementById('edit-id').value = product.id;
    document.getElementById('p-category').value = product.category;
    document.getElementById('p-name').value = product.name;
    document.getElementById('p-color').value = product.color;
    
    let igLinks = Array.isArray(product.igLinks) ? product.igLinks : JSON.parse(product.igLinks || "[]");
    document.getElementById('p-ig').value = igLinks.join(', ');
    
    document.getElementById('submit-btn').innerText = "Update Material";
    document.getElementById('cancel-btn').style.display = "inline-block";

    existingImagesOnEdit = Array.isArray(product.images) ? product.images : JSON.parse(product.images || "[]");
    selectedFiles = []; 
    document.getElementById('p-photos').value = ""; 
    
    const previewArea = document.getElementById('image-preview');
    previewArea.innerHTML = '';
    existingImagesOnEdit.forEach(imgSrc => {
        const img = document.createElement('img');
        img.src = imgSrc;
        previewArea.appendChild(img);
    });
}

window.cancelEdit = function() {
    document.getElementById('product-form').reset();
    document.getElementById('form-title').innerText = "Add / Modify items";
    document.getElementById('edit-id').value = "";
    document.getElementById('submit-btn').innerText = "Upload Saree";
    document.getElementById('cancel-btn').style.display = "none";
    document.getElementById('image-preview').innerHTML = '';
    selectedFiles = [];
    existingImagesOnEdit = [];
}

window.deleteProduct = async function(id) {
    if(confirm("Are you sure you want to permanently delete this material?")) {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            renderAdminTable();
        } catch(error) {
            alert("Failed to delete.");
        }
    }
}