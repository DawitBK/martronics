
import models from './backend/models/index.js';
const { User } = models;

async function listUsers() {
    try {
        const users = await User.findAll();
        console.log('Users:', JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error listing users:', error);
    }
}

listUsers();
