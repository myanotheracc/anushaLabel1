const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); 

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) return console.error('Error connecting to MySQL:', err);
    console.log('Connected successfully to MySQL database!');
});

app.get('/api/products', (req, res) => {
    const sql = "SELECT * FROM products ORDER BY dateAdded DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const formattedResults = results.map(product => ({
            ...product,
            images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
            igLinks: typeof product.igLinks === 'string' ? JSON.parse(product.igLinks) : product.igLinks
        }));
        res.json(formattedResults);
    });
});

app.post('/api/products', (req, res) => {
    const { id, name, category, color, images, igLinks, dateAdded } = req.body;
    // Notice: NO price in this SQL query!
    const sql = "INSERT INTO products (id, name, category, color, images, igLinks, dateAdded) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [id, name, category, color, JSON.stringify(images), JSON.stringify(igLinks), dateAdded];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product added successfully!" });
    });
});

app.put('/api/products/:id', (req, res) => {
    const { name, category, color, images, igLinks } = req.body;
    // Notice: NO price in this SQL query!
    const sql = "UPDATE products SET name=?, category=?, color=?, images=?, igLinks=? WHERE id=?";
    const values = [name, category, color, JSON.stringify(images), JSON.stringify(igLinks), req.params.id];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product updated successfully!" });
    });
});

app.delete('/api/products/:id', (req, res) => {
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Product deleted successfully!" });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));