
import axios from 'axios';
import models from './models/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const { User, Product } = models;
const API_URL = 'http://localhost:3000/api';

async function verifyOrderCreation() {
    try {
        // 1. Get a user
        const user = await User.findOne();
        if (!user) {
            console.log('No user found to test with.');
            return;
        }
        console.log(`Testing with user: ${user.email}`);

        // 2. Generate a token (simulating login)
        const token = jwt.sign(
            { user_id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret_key', // Fallback if env not loaded correctly in script
            { expiresIn: '1h' }
        );

        // 3. Get a product
        const product = await Product.findOne();
        if (!product) {
            console.log('No product found to test with.');
            return;
        }
        console.log(`Testing with product: ${product.name}`);

        // 4. Create Order
        try {
            const response = await axios.post(
                `${API_URL}/order`,
                {
                    items: [{ product_id: product.id, quantity: 1 }]
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('Order created successfully:', response.data.id);
        } catch (error) {
            console.error('Failed to create order:', error.response ? error.response.data : error.message);
        }

    } catch (error) {
        console.error('Verification script error:', error);
    }
}

verifyOrderCreation();
