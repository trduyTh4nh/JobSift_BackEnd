const express = require('express');
const router = express.Router()

const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'JobSift_v1',
    password: '1234',
    port: 5432
})



router.post('/', async (req, res) => {
    try {
        const { email, password, phone, full_name, profile_picture, diamond_count } = req.body;

        // Check if email is provided
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        await pool.query(
            'INSERT INTO "User" (email, password, phone, full_name, profile_picture, diamond_count) VALUES ($1, $2, $3, $4, $5, $6)',
            [email, password, phone, full_name, profile_picture, diamond_count]
        );

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;




