import models, { sequelize } from "./models/index.js";
import axios from "axios";

const { Product, ProductImage, Category } = models;

const checkStationaryImages = async () => {
    try {
        console.log("Checking current stationary product images...\n");

        // Find stationary category
        const stationary = await Category.findOne({ where: { name: "Stationary" } });

        if (!stationary) {
            console.log("Stationary category not found!");
            return;
        }

        const products = await Product.findAll({
            where: { category_id: stationary.id },
            include: [{ model: ProductImage, as: "images" }],
            order: [['name', 'ASC']]
        });

        console.log(`Found ${products.length} stationary products:\n`);

        for (const product of products) {
            const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : "NO IMAGE";
            console.log(`${product.name}`);
            console.log(`  Current URL: ${imageUrl}`);

            // Test if URL works
            if (imageUrl !== "NO IMAGE") {
                try {
                    await axios.head(imageUrl, { timeout: 3000 });
                    console.log(`  Status: ✓ WORKING`);
                } catch (error) {
                    console.log(`  Status: ✗ BROKEN`);
                }
            }
            console.log("");
        }

    } catch (error) {
        console.error("Check failed:", error);
    } finally {
        await sequelize.close();
    }
};

checkStationaryImages();
