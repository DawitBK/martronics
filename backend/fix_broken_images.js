import models, { sequelize } from "./models/index.js";

const { Product, ProductImage } = models;

const updates = [
    // Electronics (from seed.js)
    { name: "Xiaomi 14 Pro", image: "https://www.vopmart.com/media/magefan_blog/20231027113942.jpg" },
    { name: 'MacBook Pro 16" M3 Max', image: "https://external-preview.redd.it/apple-macbook-pro-16-2023-m3-max-review-m3-max-challenges-v0-B9io9CbQtnqF17yeX0-PKuhmBuLmod21auH-JqVfvvI.jpg?auto=webp&s=ba18b798b825a0aab1a5642a5221e7d1961975a5" },
    { name: "Belkin 3-in-1 Wireless Charger", image: "https://www.belkin.com/dw/image/v2/BGBH_PRD/on/demandware.static/-/Sites-master-product-catalog-blk/default/dwb3101a8b/images/hi-res/7/135cfdc88f5c66a4_WIZ009-BLK_Hero_WDevice_WEB.jpg?sfrm=png" },
    { name: "Mophie Snap+ Wireless Charger", image: "https://cdn11.bigcommerce.com/s-uv4dd6xvbk/images/stencil/original/products/316/1476/snap-plus_charger_hero__66732.1685991425.jpg?c=1" },

    // Stationary (Replacements for broken Unsplash links)
    { name: "Glue (Bottle)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Elmer%27s_Glue-All.jpg/800px-Elmer%27s_Glue-All.jpg" },
    { name: "Highlighter Pack", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Highlighters.jpg/800px-Highlighters.jpg" },
    { name: "Stapler (Standard)", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Stapler.jpg/800px-Stapler.jpg" },
    { name: "Hole Punch", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Hole_puncher.jpg/800px-Hole_puncher.jpg" },
];

const fixImages = async () => {
    try {
        console.log("Starting image fix...");

        for (const item of updates) {
            const product = await Product.findOne({ where: { name: item.name } });

            if (product) {
                const image = await ProductImage.findOne({ where: { product_id: product.id } });
                if (image) {
                    await image.update({ url: item.image });
                    console.log(`Updated image for: ${item.name}`);
                } else {
                    // If no image exists, create one
                    await ProductImage.create({
                        product_id: product.id,
                        url: item.image
                    });
                    console.log(`Created image for: ${item.name}`);
                }
            } else {
                console.warn(`Product not found: ${item.name}`);
            }
        }

        console.log("Image fix completed successfully!");
    } catch (error) {
        console.error("Fix failed:", error);
    } finally {
        await sequelize.close();
    }
};

fixImages();
