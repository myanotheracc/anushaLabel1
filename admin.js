// PUT ALL YOUR REAL KEYS HERE
const SUPABASE_URL = window.location.origin + '/supabase-api';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYnJyZWd1YmJzeXFpdW5mYW1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjAyNTMsImV4cCI6MjA4ODAzNjI1M30.KojhdGy_rq2e854j2jBFS67qF0gBdd0rXeQMCLpkpww';
const CLOUD_NAME = 'dfkuht22n'; 
const UPLOAD_PRESET = 'AnushaLabel'; 

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

document.addEventListener('DOMContentLoaded', () => {

    // 1. LOGIN
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault(); 
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const msg = document.getElementById('error-msg');
            
            if (!email || !password) return msg.innerText = "Enter email and password.", msg.style.display = 'block';

            loginBtn.innerText = "Logging in...";
            msg.style.display = 'none';

            try {
                const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) {
                    msg.innerText = "Auth Error: " + error.message;
                    msg.style.display = 'block';
                    loginBtn.innerText = "Login";
                } else if (data.session) {
                    window.location.href = 'admin.html';
                }
            } catch (err) {
                msg.innerText = "Network Error. Check internet or Supabase status.";
                msg.style.display = 'block';
                loginBtn.innerText = "Login";
            }
        });
    }

    // 2. DASHBOARD
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        // Auth Check
        supabaseClient.auth.getSession().then(({ data: { session }, error }) => {
            if (error || !session) window.location.replace('admin-login.html');
        });

        logoutBtn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            window.location.replace('admin-login.html');
        });

        // Tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        const sections = document.querySelectorAll('.admin-section');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => { b.classList.remove('active'); b.style.background = "transparent"; b.style.color = "#4A3023"; });
                sections.forEach(s => s.style.display = 'none');
                btn.classList.add('active');
                btn.style.background = "#4A3023";
                btn.style.color = "#fff";
                
                const targetId = btn.getAttribute('data-target');
                document.getElementById(targetId).style.display = 'block';
                if(targetId === 'modify-product') loadModifyList();
            });
        });

        // Cloudinary Upload
        let uploadedImages = [];
        window.openCloudinaryWidget = function() {
            if(window.cloudinary) {
                cloudinary.createUploadWidget({ cloudName: CLOUD_NAME, uploadPreset: UPLOAD_PRESET, multiple: true }, 
                (error, result) => { 
                    if (!error && result && result.event === "success") { 
                        uploadedImages.push(result.info.secure_url);
                        renderThumbnails();
                    }
                }).open();
            }
        }

        const uploadBtn = document.getElementById('upload-widget-btn');
        if (uploadBtn) uploadBtn.addEventListener('click', openCloudinaryWidget, false);

        window.renderThumbnails = function() {
            const container = document.getElementById('image-preview-container');
            container.innerHTML = `<div id="upload-widget-btn-rebind" style="width: 100px; height: 100px; border: 2px dashed #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #ccc; cursor: pointer;">+</div>`;
            document.getElementById('upload-widget-btn-rebind').addEventListener('click', openCloudinaryWidget, false);
            
            uploadedImages.forEach((url, index) => {
                const div = document.createElement('div');
                div.style.cssText = "width: 100px; height: 100px; border: 1px solid #ddd; border-radius: 8px; position: relative;";
                div.innerHTML = `<img src="${url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                                 <button onclick="removeImg(${index})" style="position: absolute; top: -8px; right: -8px; background: #D81B60; color: white; width: 22px; height: 22px; border-radius: 50%; border: none; cursor:pointer;">-</button>`;
                container.insertBefore(div, container.lastChild);
            });
        }
        window.removeImg = (index) => { uploadedImages.splice(index, 1); renderThumbnails(); }

        // Save Product
        const saveBtn = document.getElementById('save-product-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                const id = document.getElementById('edit-id').value;
                const type = document.getElementById('saree-type').value;
                const status = document.getElementById('saree-status').value;
                const name = document.getElementById('saree-name').value;
                const color = document.getElementById('saree-color').value;
                const desc = document.getElementById('saree-desc').value;

                if(!type || !name) return alert('Type and Name required!');

                saveBtn.innerText = "Saving...";
                const payload = { type, status, name, color, description: desc, images: uploadedImages };
                
                try {
                    let result;
                    if(id) result = await supabaseClient.from('products').update(payload).eq('id', id);
                    else result = await supabaseClient.from('products').insert([payload]);

                    if(result.error) alert("Database Error: " + result.error.message);
                    else { alert('Product saved successfully!'); resetForm(); }
                } catch(e) { alert('Network timeout saving to Supabase.'); }
                saveBtn.innerText = "Save Product";
            });
        }

        function resetForm() {
            document.getElementById('edit-id').value = '';
            document.getElementById('saree-type').value = '';
            document.getElementById('saree-status').value = 'In Stock';
            document.getElementById('saree-name').value = '';
            document.getElementById('saree-color').value = '';
            document.getElementById('saree-desc').value = '';
            uploadedImages = [];
            renderThumbnails();
            document.getElementById('form-title').innerText = "Add New Product";
        }

        // List Products
        window.loadModifyList = async function() {
            const container = document.getElementById('product-list-container');
            container.innerHTML = '<p>Loading products...</p>';
            try {
                const { data, error } = await supabaseClient.from('products').select('*').order('created_at', {ascending: false});
                container.innerHTML = '';
                if(error) return container.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;

                if(data && data.length > 0) {
                    data.forEach(item => {
                        const img = (item.images && item.images.length > 0) ? item.images[0] : 'assets/logo.png';
                        container.innerHTML += `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 15px; border: 1px solid #eee; border-radius: 8px; margin-bottom: 10px;">
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <img src="${img}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"> 
                                    <span style="font-weight: 500;">${item.name} ${item.status === 'Sold Out' ? '(Sold Out)' : ''}</span>
                                </div>
                                <div>
                                    <i class="fas fa-edit" style="color: #3498db; cursor: pointer; margin-right: 15px;" onclick='editProduct(${JSON.stringify(item)})'></i>
                                    <i class="fas fa-trash" style="color: #e74c3c; cursor: pointer;" onclick="deleteProduct('${item.id}')"></i>
                                </div>
                            </div>`;
                    });
                } else container.innerHTML = '<p>No products found.</p>';
            } catch(e) { container.innerHTML = `<p style="color:red">Network Timeout.</p>`; }
        }

        window.editProduct = (item) => {
            document.getElementById('edit-id').value = item.id;
            document.getElementById('saree-type').value = item.type;
            document.getElementById('saree-status').value = item.status || 'In Stock';
            document.getElementById('saree-name').value = item.name;
            document.getElementById('saree-color').value = item.color || '';
            document.getElementById('saree-desc').value = item.description || '';
            uploadedImages = item.images || [];
            renderThumbnails();
            document.getElementById('form-title').innerText = "Update Product";
            tabBtns[0].click(); 
        }

        window.deleteProduct = async (id) => {
            if(confirm('Delete this product?')) {
                await supabaseClient.from('products').delete().eq('id', id);
                loadModifyList();
            }
        }

        // IG Links
        const postIgBtn = document.getElementById('post-ig-btn');
        if(postIgBtn) {
            postIgBtn.addEventListener('click', async () => {
                const desc = document.getElementById('ig-desc').value;
                const url = document.getElementById('ig-link').value;
                if(!url) return alert("Link required");
                
                postIgBtn.innerText = "Posting...";
                const { error } = await supabaseClient.from('instagram_links').insert([{ description: desc, url }]);
                if(error) alert(error.message);
                else { alert('Posted!'); document.getElementById('ig-link').value = ''; loadIGList(); }
                postIgBtn.innerText = "Post";
            });
        }

        const toggleIgListBtn = document.getElementById('toggle-ig-list-btn');
        if(toggleIgListBtn) {
            toggleIgListBtn.addEventListener('click', () => {
                const container = document.getElementById('ig-list-container');
                container.style.display = container.style.display === 'none' ? 'block' : 'none';
                if(container.style.display === 'block') loadIGList();
            });
        }

        async function loadIGList() {
            const { data } = await supabaseClient.from('instagram_links').select('*').order('created_at', {ascending: false});
            const container = document.getElementById('ig-list');
            container.innerHTML = '';
            if(data) data.forEach(item => {
                container.innerHTML += `<div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
                    <span>${item.description || item.url}</span><i class="fas fa-trash" style="color:red; cursor:pointer;" onclick="deleteIG('${item.id}')"></i></div>`;
            });
        }

        window.deleteIG = async (id) => {
            if(confirm('Delete this link?')) {
                await supabaseClient.from('instagram_links').delete().eq('id', id);
                loadIGList();
            }
        }
    }
});