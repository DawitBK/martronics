import models, { sequelize } from "./models/index.js";
import argon2 from "argon2";

const { User, Category, SubCategory, Product, ProductImage } = models;

const seed = async () => {
  try {
    await sequelize.sync({ force: true }); // Reset database
    console.log("Database synced!");

    // 1. Create Admin User
    const hashedPassword = await argon2.hash("password123");
    const admin = await User.create({
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log("Admin user created");

    // 2. Create Categories (Stationary, Electronics, Fashion)
    const stationary = await Category.create({ name: "Stationary" });
    const electronics = await Category.create({ name: "Electronics" });
    const fashion = await Category.create({ name: "Fashion" });
    console.log("Categories created");

    // 3. Create SubCategories
    // Electronics: Smartphones, Laptops, Phone Accessories
    const smartphones = await SubCategory.create({
      name: "Smartphones",
      category_id: electronics.id,
    });
    const laptops = await SubCategory.create({
      name: "Laptops",
      category_id: electronics.id,
    });
    const phoneAccessories = await SubCategory.create({
      name: "Phone Accessories",
      category_id: electronics.id,
    });

    // Fashion: Men's, Women's, Kids
    const mensClothing = await SubCategory.create({
      name: "Men's",
      category_id: fashion.id,
    });
    const womensClothing = await SubCategory.create({
      name: "Women's",
      category_id: fashion.id,
    });
    const kidsClothing = await SubCategory.create({
      name: "Kids",
      category_id: fashion.id,
    });
    console.log("SubCategories created");

    // Stationary: kid, school, office
    const stationaryKids = await SubCategory.create({
      name: "Kid",
      category_id: stationary.id,
    });
    const stationarySchool = await SubCategory.create({
      name: "School",
      category_id: stationary.id,
    });
    const stationaryOffice = await SubCategory.create({
      name: "Office",
      category_id: stationary.id,
    });

    // 4. Create Products
    const productsData = [
      // SMARTPHONES (10 products)
      {
        name: "iPhone 15 Pro Max",
        description:
          "The ultimate iPhone with titanium design, A17 Pro chip, and advanced camera system.",
        price: 1199.99,
        stock: 45,
        category_id: electronics.id,
        sub_category_id: smartphones.id,
        image:
          "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "iPhone 14 Pro",
        description:
          "Previous generation flagship with Dynamic Island and powerful performance.",
        price: 999.99,
        stock: 60,
        category_id: electronics.id,
        sub_category_id: smartphones.id,
        image:
          "https://images.unsplash.com/photo-1678652197831-2d180705cd2c?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        description:
          "AI-powered flagship with S Pen, stunning display, and incredible camera.",
        price: 1299.99,
        stock: 40,
        category_id: electronics.id,
        sub_category_id: smartphones.id,
        image:
          "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Samsung Galaxy S23",
        description:
          "Powerful Android flagship with excellent camera and long battery life.",
        price: 899.99,
        stock: 55,
        category_id: electronics.id,
        sub_category_id: smartphones.id,
        image:
          "https://images.unsplash.com/photo-1706716364028-3e4b7a050523?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Google Pixel 8 Pro",
        description:
          "Pure Android experience with incredible AI features and camera.",
        price: 999.99,
        stock: 35,
        category_id: electronics.id,
        sub_category_id: smartphones.id,
        image:
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "OnePlus 12",
        description:
          "Flagship killer with blazing fast performance and stunning display.",
        price: 799.99,
        stock: 50,
        category_id: electronics.id,
        sub_category_id: smartphones.id,
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Xiaomi 14 Pro",
        description:
          "Premium flagship with Leica camera and exceptional value.",
        price: 899.99,
        stock: 40,
        category_id: electronics.id,
        sub_category_id: smartphones.id,
        image:
          "https://images.unsplash.com/photo-1592286927505-b0c2fc1f4f1e?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "iPhone 13",
        description:
          "Reliable iPhone with great performance and dual camera system.",
        price: 699.99,
        stock: 70,
        category_id: electronics.id,
        sub_category_id: smartphones.id,
        image:
          "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Samsung Galaxy A54",
        description:
          "Mid-range champion with premium features at affordable price.",
        price: 449.99,
        stock: 80,
        category_id: electronics.id,
        sub_category_id: smartphones.id,
        image:
          "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Google Pixel 7a",
        description:
          "Best budget phone with flagship camera and clean Android.",
        price: 499.99,
        stock: 65,
        category_id: electronics.id,
        sub_category_id: smartphones.id,
        image:
          "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&q=80&w=800",
      },

      // LAPTOPS (10 products)
      {
        name: 'MacBook Pro 16" M3 Max',
        description:
          "Ultimate creative powerhouse with M3 Max chip and stunning Liquid Retina XDR display.",
        price: 3499.99,
        stock: 25,
        category_id: electronics.id,
        sub_category_id: laptops.id,
        image:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "MacBook Air M3",
        description:
          "Supercharged by M3. Lean. Mean. M3 machine. Perfect for everyday tasks.",
        price: 1299.99,
        stock: 50,
        category_id: electronics.id,
        sub_category_id: laptops.id,
        image:
          "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Dell XPS 15",
        description:
          "Premium Windows laptop with stunning InfinityEdge display and powerful performance.",
        price: 1899.99,
        stock: 35,
        category_id: electronics.id,
        sub_category_id: laptops.id,
        image:
          "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "HP Spectre x360",
        description:
          "Convertible laptop with gem-cut design and versatile 2-in-1 functionality.",
        price: 1599.99,
        stock: 30,
        category_id: electronics.id,
        sub_category_id: laptops.id,
        image:
          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Lenovo ThinkPad X1 Carbon",
        description:
          "Business laptop legend with legendary keyboard and enterprise security.",
        price: 1799.99,
        stock: 40,
        category_id: electronics.id,
        sub_category_id: laptops.id,
        image:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "ASUS ROG Zephyrus G14",
        description:
          "Compact gaming powerhouse with AMD Ryzen and NVIDIA RTX graphics.",
        price: 1699.99,
        stock: 28,
        category_id: electronics.id,
        sub_category_id: laptops.id,
        image:
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Microsoft Surface Laptop 5",
        description:
          "Elegant Windows laptop with premium build and touchscreen display.",
        price: 1299.99,
        stock: 45,
        category_id: electronics.id,
        sub_category_id: laptops.id,
        image:
          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Acer Swift 3",
        description:
          "Budget-friendly ultrabook with solid performance and long battery life.",
        price: 699.99,
        stock: 60,
        category_id: electronics.id,
        sub_category_id: laptops.id,
        image:
          "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Razer Blade 15",
        description:
          "Premium gaming laptop with sleek design and powerful specs.",
        price: 2499.99,
        stock: 20,
        category_id: electronics.id,
        sub_category_id: laptops.id,
        image:
          "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "LG Gram 17",
        description:
          "Ultra-lightweight 17-inch laptop with all-day battery life.",
        price: 1599.99,
        stock: 32,
        category_id: electronics.id,
        sub_category_id: laptops.id,
        image:
          "https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&q=80&w=800",
      },

      // PHONE ACCESSORIES (10 products)
      {
        name: "AirPods Pro (2nd Gen)",
        description:
          "Active noise cancellation, Adaptive Audio, and personalized spatial audio.",
        price: 249.99,
        stock: 100,
        category_id: electronics.id,
        sub_category_id: phoneAccessories.id,
        image:
          "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Sony WH-1000XM5",
        description:
          "Industry-leading noise canceling wireless headphones with exceptional sound.",
        price: 399.99,
        stock: 75,
        category_id: electronics.id,
        sub_category_id: phoneAccessories.id,
        image:
          "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Anker PowerCore 20000mAh",
        description:
          "High-capacity portable charger for multiple device charges on the go.",
        price: 49.99,
        stock: 150,
        category_id: electronics.id,
        sub_category_id: phoneAccessories.id,
        image:
          "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Spigen Ultra Hybrid Case",
        description:
          "Crystal clear protective case with military-grade drop protection.",
        price: 29.99,
        stock: 200,
        category_id: electronics.id,
        sub_category_id: phoneAccessories.id,
        image:
          "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Belkin 3-in-1 Wireless Charger",
        description: "Charge iPhone, Apple Watch, and AirPods simultaneously.",
        price: 149.99,
        stock: 80,
        category_id: electronics.id,
        sub_category_id: phoneAccessories.id,
        image:
          "https://images.unsplash.com/photo-1591290619762-d27b95c5c9c3?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "PopSockets PopGrip",
        description:
          "Expandable phone grip and stand for better handling and viewing.",
        price: 14.99,
        stock: 300,
        category_id: electronics.id,
        sub_category_id: phoneAccessories.id,
        image:
          "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Moment Pro Camera Lens",
        description:
          "Professional-grade smartphone lens for stunning mobile photography.",
        price: 119.99,
        stock: 50,
        category_id: electronics.id,
        sub_category_id: phoneAccessories.id,
        image:
          "https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Otterbox Defender Series",
        description: "Rugged multi-layer protection for extreme durability.",
        price: 59.99,
        stock: 120,
        category_id: electronics.id,
        sub_category_id: phoneAccessories.id,
        image:
          "https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Samsung Galaxy Buds2 Pro",
        description:
          "Premium wireless earbuds with intelligent ANC and 360 audio.",
        price: 229.99,
        stock: 90,
        category_id: electronics.id,
        sub_category_id: phoneAccessories.id,
        image:
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Mophie Snap+ Wireless Charger",
        description:
          "MagSafe-compatible wireless charging pad with fast charging.",
        price: 49.99,
        stock: 110,
        category_id: electronics.id,
        sub_category_id: phoneAccessories.id,
        image:
          "https://images.unsplash.com/photo-1591290619762-d27b95c5c9c3?auto=format&fit=crop&q=80&w=800",
      },

      // MEN'S CLOTHING (10 products)
      {
        name: "Classic Leather Jacket",
        description:
          "Timeless genuine leather jacket with premium craftsmanship.",
        price: 299.99,
        stock: 40,
        category_id: fashion.id,
        sub_category_id: mensClothing.id,
        image:
          "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Slim Fit Dress Shirt",
        description:
          "Professional cotton dress shirt perfect for office or formal events.",
        price: 79.99,
        stock: 100,
        category_id: fashion.id,
        sub_category_id: mensClothing.id,
        image:
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Tailored Wool Suit",
        description:
          "Premium wool suit with modern fit and impeccable tailoring.",
        price: 599.99,
        stock: 25,
        category_id: fashion.id,
        sub_category_id: mensClothing.id,
        image:
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Casual Denim Jeans",
        description: "Comfortable stretch denim with classic fit and style.",
        price: 89.99,
        stock: 120,
        category_id: fashion.id,
        sub_category_id: mensClothing.id,
        image:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Performance Polo Shirt",
        description: "Moisture-wicking polo perfect for golf or casual wear.",
        price: 59.99,
        stock: 90,
        category_id: fashion.id,
        sub_category_id: mensClothing.id,
        image:
          "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Winter Puffer Jacket",
        description: "Warm insulated jacket with water-resistant outer shell.",
        price: 179.99,
        stock: 55,
        category_id: fashion.id,
        sub_category_id: mensClothing.id,
        image:
          "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Athletic Joggers",
        description:
          "Comfortable joggers with tapered fit and zippered pockets.",
        price: 69.99,
        stock: 110,
        category_id: fashion.id,
        sub_category_id: mensClothing.id,
        image:
          "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Oxford Dress Shoes",
        description:
          "Classic leather oxfords with cushioned insole for all-day comfort.",
        price: 149.99,
        stock: 65,
        category_id: fashion.id,
        sub_category_id: mensClothing.id,
        image:
          "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Graphic T-Shirt Pack",
        description:
          "Set of 3 premium cotton tees with modern graphic designs.",
        price: 49.99,
        stock: 150,
        category_id: fashion.id,
        sub_category_id: mensClothing.id,
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Wool Blend Overcoat",
        description:
          "Sophisticated overcoat with timeless design and superior warmth.",
        price: 349.99,
        stock: 30,
        category_id: fashion.id,
        sub_category_id: mensClothing.id,
        image:
          "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=800",
      },

      // WOMEN'S CLOTHING (10 products)
      {
        name: "Elegant Evening Dress",
        description:
          "Stunning floor-length gown perfect for special occasions.",
        price: 249.99,
        stock: 35,
        category_id: fashion.id,
        sub_category_id: womensClothing.id,
        image:
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Floral Summer Dress",
        description: "Light and breezy dress with beautiful floral print.",
        price: 89.99,
        stock: 80,
        category_id: fashion.id,
        sub_category_id: womensClothing.id,
        image:
          "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "High-Waisted Skinny Jeans",
        description: "Flattering high-rise jeans with stretch for comfort.",
        price: 79.99,
        stock: 100,
        category_id: fashion.id,
        sub_category_id: womensClothing.id,
        image:
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Cashmere Sweater",
        description: "Luxuriously soft cashmere sweater in classic design.",
        price: 199.99,
        stock: 45,
        category_id: fashion.id,
        sub_category_id: womensClothing.id,
        image:
          "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Leather Ankle Boots",
        description: "Stylish ankle boots with block heel and side zipper.",
        price: 139.99,
        stock: 70,
        category_id: fashion.id,
        sub_category_id: womensClothing.id,
        image:
          "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Silk Blouse",
        description: "Elegant silk blouse perfect for work or evening wear.",
        price: 119.99,
        stock: 60,
        category_id: fashion.id,
        sub_category_id: womensClothing.id,
        image:
          "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Yoga Leggings Set",
        description:
          "High-performance leggings and sports bra set for workouts.",
        price: 69.99,
        stock: 120,
        category_id: fashion.id,
        sub_category_id: womensClothing.id,
        image:
          "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Trench Coat",
        description:
          "Classic trench coat with belt and water-resistant fabric.",
        price: 229.99,
        stock: 40,
        category_id: fashion.id,
        sub_category_id: womensClothing.id,
        image:
          "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Designer Handbag",
        description:
          "Premium leather handbag with gold hardware and multiple compartments.",
        price: 399.99,
        stock: 25,
        category_id: fashion.id,
        sub_category_id: womensClothing.id,
        image:
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Maxi Skirt",
        description: "Flowing maxi skirt with elastic waist and side pockets.",
        price: 59.99,
        stock: 90,
        category_id: fashion.id,
        sub_category_id: womensClothing.id,
        image:
          "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=800",
      },

      // KIDS CLOTHING (10 products)
      {
        name: "Kids Superhero T-Shirt",
        description: "Fun graphic tee featuring favorite superhero characters.",
        price: 19.99,
        stock: 150,
        category_id: fashion.id,
        sub_category_id: kidsClothing.id,
        image:
          "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Girls Princess Dress",
        description: "Adorable dress with tulle skirt and sparkly details.",
        price: 39.99,
        stock: 80,
        category_id: fashion.id,
        sub_category_id: kidsClothing.id,
        image:
          "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Boys Denim Jacket",
        description: "Classic denim jacket sized perfectly for kids.",
        price: 49.99,
        stock: 70,
        category_id: fashion.id,
        sub_category_id: kidsClothing.id,
        image:
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Kids Sneakers",
        description:
          "Comfortable athletic shoes with velcro straps for easy wear.",
        price: 44.99,
        stock: 100,
        category_id: fashion.id,
        sub_category_id: kidsClothing.id,
        image:
          "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Winter Snow Suit",
        description: "Warm insulated snow suit with waterproof outer layer.",
        price: 89.99,
        stock: 50,
        category_id: fashion.id,
        sub_category_id: kidsClothing.id,
        image:
          "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "School Uniform Set",
        description: "Complete uniform set including shirt, pants, and tie.",
        price: 69.99,
        stock: 90,
        category_id: fashion.id,
        sub_category_id: kidsClothing.id,
        image:
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Girls Leggings Pack",
        description: "Set of 5 colorful leggings in various patterns.",
        price: 34.99,
        stock: 120,
        category_id: fashion.id,
        sub_category_id: kidsClothing.id,
        image:
          "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Boys Cargo Shorts",
        description:
          "Durable cargo shorts with multiple pockets for adventure.",
        price: 29.99,
        stock: 110,
        category_id: fashion.id,
        sub_category_id: kidsClothing.id,
        image:
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Raincoat with Hood",
        description: "Bright waterproof raincoat to keep kids dry and visible.",
        price: 39.99,
        stock: 85,
        category_id: fashion.id,
        sub_category_id: kidsClothing.id,
        image:
          "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Kids Pajama Set",
        description:
          "Soft cotton pajamas with fun prints for comfortable sleep.",
        price: 24.99,
        stock: 140,
        category_id: fashion.id,
        sub_category_id: kidsClothing.id,
        image:
          "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=800",
      },
      // --- STATIONARY PRODUCTS (Kids) ---
      {
        name: "Crayon Colors Pack",
        description: "Box of 24 vibrant crayons for kids",
        price: 4.99,
        stock: 200,
        category_id: stationary.id,
        sub_category_id: stationaryKids.id,
        image:
          "https://images.unsplash.com/photo-1515965885361-f1e0095517ea?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Coloring Book",
        description: "Fun coloring book for toddlers",
        price: 3.5,
        stock: 150,
        category_id: stationary.id,
        sub_category_id: stationaryKids.id,
        image:
          "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Washable Marker Set",
        description: "12 washable markers for easy cleanup",
        price: 5.99,
        stock: 120,
        category_id: stationary.id,
        sub_category_id: stationaryKids.id,
        image:
          "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Safety Scissors",
        description: "Rounded-tip scissors for children",
        price: 2.99,
        stock: 180,
        category_id: stationary.id,
        sub_category_id: stationaryKids.id,
        image:
          "https://images.unsplash.com/photo-1596464716127-f9a829be9374?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Glue Stick (3-pack)",
        description: "Non-toxic glue sticks for crafts",
        price: 2.5,
        stock: 220,
        category_id: stationary.id,
        sub_category_id: stationaryKids.id,
        image:
          "https://images.unsplash.com/photo-1626202378367-27f9270a24a7?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Finger Paint Set",
        description: "Washable finger paints for creative play",
        price: 9.99,
        stock: 80,
        category_id: stationary.id,
        sub_category_id: stationaryKids.id,
        image:
          "https://images.unsplash.com/photo-1502623374737-25f381759020?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Sticker Pack",
        description: "Fun stickers for kids' projects",
        price: 1.99,
        stock: 300,
        category_id: stationary.id,
        sub_category_id: stationaryKids.id,
        image:
          "https://images.unsplash.com/photo-1572375992501-4f0f235addaa?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Modeling Clay",
        description: "Non-toxic modeling clay set",
        price: 6.99,
        stock: 140,
        category_id: stationary.id,
        sub_category_id: stationaryKids.id,
        image:
          "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Paint Brush Set",
        description: "Assorted brushes for painting",
        price: 4.5,
        stock: 130,
        category_id: stationary.id,
        sub_category_id: stationaryKids.id,
        image:
          "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Drawing Pad",
        description: "A4 drawing pad for kids",
        price: 5.99,
        stock: 160,
        category_id: stationary.id,
        sub_category_id: stationaryKids.id,
        image:
          "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800",
      },

      // --- STATIONARY PRODUCTS (School) ---
      {
        name: "Whiteboard (Small)",
        description: "Portable whiteboard for classroom use",
        price: 12.99,
        stock: 80,
        category_id: stationary.id,
        sub_category_id: stationarySchool.id,
        image:
          "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Dry Erase Marker Set",
        description: "Set of 4 dry erase markers",
        price: 3.99,
        stock: 200,
        category_id: stationary.id,
        sub_category_id: stationarySchool.id,
        image:
          "https://images.unsplash.com/photo-1588012896079-c841c305a87f?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Notebook (100 pages)",
        description: "Ruled notebook for school",
        price: 2.99,
        stock: 300,
        category_id: stationary.id,
        sub_category_id: stationarySchool.id,
        image:
          "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Pencil Box",
        description: "Durable pencil box for students",
        price: 6.99,
        stock: 150,
        category_id: stationary.id,
        sub_category_id: stationarySchool.id,
        image:
          "https://images.unsplash.com/photo-1585241645928-1b7319137706?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Set Square & Ruler",
        description: "Geometry set for school work",
        price: 4.5,
        stock: 180,
        category_id: stationary.id,
        sub_category_id: stationarySchool.id,
        image:
          "https://images.unsplash.com/photo-1589254065878-42c9da997008?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Glue (Bottle)",
        description: "Liquid glue for school projects",
        price: 2.5,
        stock: 210,
        category_id: stationary.id,
        sub_category_id: stationarySchool.id,
        image:
          "https://images.unsplash.com/photo-1581093583449-8255a4d12ed0?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Highlighter Pack",
        description: "Assorted highlighters for note taking",
        price: 3.99,
        stock: 240,
        category_id: stationary.id,
        sub_category_id: stationarySchool.id,
        image:
          "https://images.unsplash.com/photo-1595133532871-33758376993c?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Clipboard",
        description: "Standard clipboard for forms",
        price: 5.99,
        stock: 120,
        category_id: stationary.id,
        sub_category_id: stationarySchool.id,
        image:
          "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Binder (A4)",
        description: "Ring binder for organizing papers",
        price: 7.99,
        stock: 140,
        category_id: stationary.id,
        sub_category_id: stationarySchool.id,
        image:
          "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Whiteboard Eraser",
        description: "Eraser for dry erase boards",
        price: 1.99,
        stock: 260,
        category_id: stationary.id,
        sub_category_id: stationarySchool.id,
        image:
          "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800",
      },

      // --- STATIONARY PRODUCTS (Office) ---
      {
        name: "Stapler (Standard)",
        description: "Standard office stapler",
        price: 8.99,
        stock: 120,
        category_id: stationary.id,
        sub_category_id: stationaryOffice.id,
        image:
          "https://images.unsplash.com/photo-1616606009360-15392925232b?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Staples (Box)",
        description: "Box of 1000 staples",
        price: 3.99,
        stock: 400,
        category_id: stationary.id,
        sub_category_id: stationaryOffice.id,
        image:
          "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Hole Punch",
        description: "Two-hole punch for office use",
        price: 9.5,
        stock: 90,
        category_id: stationary.id,
        sub_category_id: stationaryOffice.id,
        image:
          "https://images.unsplash.com/photo-1616606009360-15392925232b?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Tape Dispenser",
        description: "Desktop tape dispenser",
        price: 6.5,
        stock: 160,
        category_id: stationary.id,
        sub_category_id: stationaryOffice.id,
        image:
          "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Desk Organizer",
        description: "Multi-compartment desk organizer",
        price: 14.99,
        stock: 75,
        category_id: stationary.id,
        sub_category_id: stationaryOffice.id,
        image:
          "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "File Folders (Pack)",
        description: "Pack of 25 file folders",
        price: 9.99,
        stock: 180,
        category_id: stationary.id,
        sub_category_id: stationaryOffice.id,
        image:
          "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Clipboard with Storage",
        description: "Clipboard that stores documents",
        price: 11.99,
        stock: 60,
        category_id: stationary.id,
        sub_category_id: stationaryOffice.id,
        image:
          "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Label Maker",
        description: "Handheld label maker for office use",
        price: 29.99,
        stock: 40,
        category_id: stationary.id,
        sub_category_id: stationaryOffice.id,
        image:
          "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Packing Tape",
        description: "Strong packing tape roll",
        price: 4.49,
        stock: 220,
        category_id: stationary.id,
        sub_category_id: stationaryOffice.id,
        image:
          "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Envelope Pack",
        description: "Pack of 50 envelopes",
        price: 6.99,
        stock: 140,
        category_id: stationary.id,
        sub_category_id: stationaryOffice.id,
        image:
          "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800",
      },
    ];

    // Create products and their images
    for (const productData of productsData) {
      const { image, ...productFields } = productData;
      productFields.user_id = admin.id;

      const product = await Product.create(productFields);

      if (image) {
        await ProductImage.create({
          product_id: product.id,
          url: image,
        });
      }
    }
    console.log("Products created");

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await sequelize.close();
  }
};

seed();
