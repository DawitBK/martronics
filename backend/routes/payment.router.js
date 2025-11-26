import { Router } from "express";
import {
  listPayments,
  createPayment,
} from "../controllers/payment.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment processing
 */

/**
 * @swagger
 * /payment/create-payment-intent:
 *   post:
 *     summary: Create a Stripe payment intent
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: integer
 *                 description: Amount in cents
 *               currency:
 *                 type: string
 *                 default: usd
 *     responses:
 *       200:
 *         description: Payment intent created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret:
 *                   type: string
 */


router.get("/", listPayments);
router.post("/", createPayment);

export default router;
