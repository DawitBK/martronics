import models, { sequelize } from "./models/index.js";
import axios from "axios";
import fs from "fs";

const { Product, ProductImage } = models;

const checkImages = async () => {
    try {
        console.log("Fetching all products...");
        const products = await Product.findAll({
            include: [{ model: ProductImage, as: "images" }],
        });

        console.log(`Found ${products.length} products. Checking images...`);

        const brokenImages = [];

        for (const product of products) {
            if (product.images && product.images.length > 0) {
                for (const image of product.images) {
                    try {
                        await axios.head(image.url, { timeout: 5000 });
                        // console.log(`[OK] ${product.name}`);
                    } catch (error) {
                        console.error(`[BROKEN] ${product.name} - ${image.url}`);
                        brokenImages.push({
                            id: product.id,
                            name: product.name,
                            url: image.url,
                            imageId: image.id
                        });
                    }
                }
            } else {
                console.warn(`[NO IMAGE] ${product.name}`);
            }
        }

        console.log("\n--- Summary ---");
        console.log(`Found ${brokenImages.length} broken images.`);

        fs.writeFileSync('broken_images.json', JSON.stringify(brokenImages, null, 2));
        console.log("Written to broken_images.json");

    } catch (error) {
        console.error("Script failed:", error);
    } finally {
        await sequelize.close();
    }
};

checkImages();
