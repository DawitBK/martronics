import { Router } from "express";



import userRouter from "./user.router.js";
import productRouter from "./product.router.js";
import cartRouter from "./cart.router.js";
import orderRouter from "./order.router.js";
import paymentRouter from "./payment.router.js";
import categoryRouter from "./category.router.js";
import subCategoryRouter from "./subCategory.router.js";
const router = Router();


router.use("/user", userRouter);
router.use("/product", productRouter);
router.use("/cart", cartRouter);
router.use("/order", orderRouter);
router.use("/payment", paymentRouter);
router.use("/category", categoryRouter);
router.use("/subcategory", subCategoryRouter);

export default router;
