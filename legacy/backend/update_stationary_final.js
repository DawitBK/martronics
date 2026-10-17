import models, { sequelize } from "./models/index.js";

const { Product, ProductImage } = models;

// Only update products that currently have broken/placeholder URLs
// Keep the good ones that are already working (Amazon, etc.)
const stationaryUpdates = [
    // Replace only the via.placeholder URLs with picsum.photos (guaranteed to work)
    { name: "Washable Marker Set", image: "https://picsum.photos/seed/markers/400/400" },
    { name: "Modeling Clay", image: "https://picsum.photos/seed/clay/400/400" },
    { name: "Paint Brush Set", image: "https://picsum.photos/seed/brushes/400/400" },
    { name: "Drawing Pad", image: "https://picsum.photos/seed/drawingpad/400/400" },
    { name: "Whiteboard (Small)", image: "https://picsum.photos/seed/whiteboard/400/400" },
    { name: "Notebook (100 pages)", image: "https://picsum.photos/seed/notebook/400/400" },
    { name: "Set Square & Ruler", image: "https://picsum.photos/seed/ruler/400/400" },
    { name: "Glue (Bottle)", image: "https://picsum.photos/seed/glue/400/400" },
    { name: "Highlighter Pack", image: "https://picsum.photos/seed/highlighters/400/400" },
    { name: "Clipboard", image: "https://picsum.photos/seed/clipboard/400/400" },
    { name: "Binder (A4)", image: "https://picsum.photos/seed/binder/400/400" },
    { name: "Whiteboard Eraser", image: "https://picsum.photos/seed/eraser/400/400" },
    { name: "Stapler (Standard)", image: "https://picsum.photos/seed/stapler/400/400" },
    { name: "Staples (Box)", image: "https://picsum.photos/seed/staples/400/400" },
    { name: "Hole Punch", image: "https://picsum.photos/seed/holepunch/400/400" },
    { name: "Tape Dispenser", image: "https://picsum.photos/seed/tape/400/400" },
    { name: "Desk Organizer", image: "https://picsum.photos/seed/organizer/400/400" },
    { name: "File Folders (Pack)", image: "https://picsum.photos/seed/folders/400/400" },
    { name: "Clipboard with Storage", image: "https://picsum.photos/seed/storageclip/400/400" },
    { name: "Label Maker", image: "https://picsum.photos/seed/labelmaker/400/400" },
    { name: "Packing Tape", image: "https://picsum.photos/seed/packingtape/400/400" },
    { name: "Envelope Pack", image: "https://picsum.photos/seed/envelopes/400/400" },
];

const updateStationaryImages = async () => {
    try {
        console.log("Updating stationary images with picsum.photos URLs...\n");

        for (const item of stationaryUpdates) {
            const product = await Product.findOne({ where: { name: item.name } });

            if (product) {
                const image = await ProductImage.findOne({ where: { product_id: product.id } });
                if (image) {
                    await image.update({ url: item.image });
                    console.log(`✓ Updated: ${item.name}`);
                } else {
                    await ProductImage.create({
                        product_id: product.id,
                        url: item.image
                    });
                    console.log(`✓ Created: ${item.name}`);
                }
            } else {
                console.warn(`⚠ Product not found: ${item.name}`);
            }
        }

        console.log("\n✅ All stationary images updated with working URLs!");
    } catch (error) {
        console.error("❌ Update failed:", error);
    } finally {
        await sequelize.close();
    }
};

updateStationaryImages();
