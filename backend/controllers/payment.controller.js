import models from "../models/index.js";
const { Payment, Order, User } = models;

export const createPayment = async (req, res) => {
  const t = await models.sequelize.transaction();
  try {
    const { order_id, user_id, amount, method, status } = req.body;

    const order = await Order.findByPk(order_id, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    if (parseFloat(amount) !== parseFloat(order.total_amount)) {
      await t.rollback();
      return res.status(400).json({ message: "Payment amount mismatch" });
    }

    const payment = await Payment.create(
      { order_id, user_id, amount, method, status },
      { transaction: t }
    );

    if (status === "success") {
      await order.update({ status: "paid" }, { transaction: t });
    } else if (status === "failed") {
      await order.update({ status: "pending" }, { transaction: t });
    }

    await t.commit();

    res.status(201).json({ payment, order });
  } catch (error) {
    await t.rollback();
    res
      .status(400)
      .json({ message: "Failed to create payment", error: error.message });
  }
};

export const listPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        { model: User, as: "user" },
        { model: Order, as: "order" },
      ],
    });
    res.json(payments);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to fetch payments", error: error.message });
  }
};
