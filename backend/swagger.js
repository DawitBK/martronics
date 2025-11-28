import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Martronics API',
            version: '1.0.0',
            description: 'API documentation for Martronics E-commerce application',
            contact: {
                name: 'Developer',
            },
        },
        servers: [
            {
                url: 'https://web-production-cfbdd.up.railway.app/api',
                description: 'Production server',
            },
            {
                url: 'http://localhost:3000/api',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    required: ['firstName', 'lastName', 'email', 'password'],
                    properties: {
                        id: { type: 'integer' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', format: 'password' },

                        // ✅ FIXED ROLE ENUM + DEFAULT
                        role: {
                            type: 'string',
                            enum: ['customer', 'admin', 'manager'],
                            default: 'customer'
                        },

                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },

                Category: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },

                SubCategory: {
                    type: 'object',
                    required: ['name', 'category_id'],
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        category_id: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },

                Product: {
                    type: 'object',
                    required: ['name', 'price', 'stock', 'category_id', 'sub_category_id'],
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        description: { type: 'string' },
                        price: { type: 'number' },
                        stock: { type: 'integer' },
                        category_id: { type: 'integer' },
                        sub_category_id: { type: 'integer' },
                        user_id: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },

                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        user_id: { type: 'integer' },
                        status: { type: 'string', enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
                        total: { type: 'number' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },

                Cart: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        user_id: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },

                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);
export default specs;
