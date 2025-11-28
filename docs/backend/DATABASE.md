# Database Documentation

Martronics uses PostgreSQL as its relational database management system. The database schema is managed using Sequelize ORM.

## Schema Overview

The database consists of the following main tables:

### Users (`Users`)
Stores user account information.
-   `id`: Primary Key (UUID/Integer)
-   `username`: String, Unique
-   `email`: String, Unique
-   `password`: String (Hashed)
-   `role`: Enum ('user', 'admin')

### Products (`Products`)
Stores product information.
-   `id`: Primary Key
-   `name`: String
-   `description`: Text
-   `price`: Decimal
-   `stock`: Integer
-   `categoryId`: Foreign Key -> Categories.id

### Categories (`Categories`)
Stores product categories.
-   `id`: Primary Key
-   `name`: String
-   `description`: String

### SubCategories (`SubCategories`)
Stores subcategories for more granular organization.
-   `id`: Primary Key
-   `name`: String
-   `categoryId`: Foreign Key -> Categories.id

### Orders (`Orders`)
Stores customer orders.
-   `id`: Primary Key
-   `userId`: Foreign Key -> Users.id
-   `totalAmount`: Decimal
-   `status`: Enum ('pending', 'completed', 'cancelled')
-   `createdAt`: Timestamp

### OrderItems (`OrderItems`)
Stores individual items within an order.
-   `id`: Primary Key
-   `orderId`: Foreign Key -> Orders.id
-   `productId`: Foreign Key -> Products.id
-   `quantity`: Integer
-   `price`: Decimal (Snapshot of price at time of order)

### Cart (`Carts`) & CartItems (`CartItems`)
Manages the user's shopping cart.
-   `Cart` is linked to `User`.
-   `CartItems` link `Cart` to `Products` with a quantity.

## Relationships

-   **User** has many **Orders**.
-   **User** has one **Cart**.
-   **Category** has many **Products**.
-   **Category** has many **SubCategories**.
-   **Order** belongs to **User**.
-   **Order** has many **OrderItems**.
-   **Product** belongs to **Category**.
-   **Cart** has many **CartItems**.

## Seeding

The database can be populated with initial data using the seed script.
Run the following command in the `backend/` directory:

```bash
node seed.js
```
This will populate the database with test users, categories, and products.
