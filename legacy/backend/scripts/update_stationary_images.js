import models from "../models/index.js";

const { Product, ProductImage, Category } = models;

const stationaryImages = [
  // Kids
  {
    name: "Crayon Colors Pack",
    image:
      "https://images.unsplash.com/photo-1523473827532-8c1b7d1a5f7f?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Coloring Book",
    image:
      "https://images.unsplash.com/photo-1514788612809-0f6f3b8b0f98?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Washable Marker Set",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Safety Scissors",
    image:
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Glue Stick (3-pack)",
    image:
      "https://images.unsplash.com/photo-1602526439170-8b86c6f9d0f8?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Finger Paint Set",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Sticker Pack",
    image:
      "https://images.unsplash.com/photo-1520975917564-3b6b6c8f4f0b?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Modeling Clay",
    image:
      "https://images.unsplash.com/photo-1582719478250-1d5f9c44d3a6?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Paint Brush Set",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Drawing Pad",
    image:
      "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&q=80&w=800",
  },

  // School
  {
    name: "Whiteboard (Small)",
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Dry Erase Marker Set",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Notebook (100 pages)",
    image:
      "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Pencil Box",
    image:
      "https://images.unsplash.com/photo-1520872020310-3f2f8b1d8b6f?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Set Square & Ruler",
    image:
      "https://images.unsplash.com/photo-1589404050546-3e0b4f0b8a8b?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Glue (Bottle)",
    image:
      "https://images.unsplash.com/photo-1602526439170-8b86c6f9d0f8?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Highlighter Pack",
    image:
      "https://images.unsplash.com/photo-1610484822529-5f7a1f2a9f60?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Clipboard",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Binder (A4)",
    image:
      "https://images.unsplash.com/photo-1553729784-e91953dec042?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Whiteboard Eraser",
    image:
      "https://images.unsplash.com/photo-1553531888-0b6d6d8f6a9c?auto=format&fit=crop&q=80&w=800",
  },

  // Office
  {
    name: "Stapler (Standard)",
    image:
      "https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Staples (Box)",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Hole Punch",
    image:
      "https://images.unsplash.com/photo-1572373976851-13a2b6f59b1c?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Tape Dispenser",
    image:
      "https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Desk Organizer",
    image:
      "https://images.unsplash.com/photo-1544739313-3a3a97d9c21b?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "File Folders (Pack)",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Clipboard with Storage",
    image:
      "https://images.unsplash.com/photo-1544117513-2c16d9b8f7c6?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Label Maker",
    image:
      "https://images.unsplash.com/photo-1581091012184-82d0d3f0f3b9?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Packing Tape",
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Envelope Pack",
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800",
  },
];

const run = async () => {
  try {
    for (const entry of stationaryImages) {
      const product = await Product.findOne({ where: { name: entry.name } });
      if (!product) {
        console.warn(`Product not found: ${entry.name}`);
        continue;
      }

      const existing = await ProductImage.findOne({
        where: { product_id: product.id },
      });
      if (existing) {
        // update only if different
        if (existing.url !== entry.image) {
          existing.url = entry.image;
          await existing.save();
          console.log(`Updated image for ${entry.name}`);
        } else {
          console.log(`Image already correct for ${entry.name}`);
        }
      } else {
        await ProductImage.create({ product_id: product.id, url: entry.image });
        console.log(`Created image for ${entry.name}`);
      }
    }
    console.log("Stationary image update completed.");
  } catch (err) {
    console.error("Failed to update stationary images:", err);
  } finally {
    process.exit(0);
  }
};

run();
