const Book = require("../models/Book");
const Order = require("../models/Order");
const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const seller = await User.findById(req.user._id).select("-password");
    if (!seller) return res.status(404).json({ message: "User not found" });
    res.json(seller);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot fetch profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { fullName, email, phone, address, newPassword } = req.body;

    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    if (newPassword) user.password = newPassword;

    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot update profile" });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const totalBooks = await Book.countDocuments({ userId: sellerId });
    const soldBooks = await Order.countDocuments({ sellerId, status: "success" });
    const pendingOrders = await Order.countDocuments({ sellerId, status: "pending" });

    const revenueResult = await Order.aggregate([
      { $match: { sellerId, status: "success" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueResult.length ? revenueResult[0].total : 0;

    res.json({ totalBooks, soldBooks, pendingOrders, totalRevenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot fetch dashboard stats" });
  }
};

exports.getSalesHistory = async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.user._id })
      .populate("bookId", "title price")
      .sort({ createdAt: -1 });

    const formatted = orders.map(o => ({
      id: o._id,
      bookTitle: o.bookId?.title,
      quantity: o.quantity,
      price: o.bookId?.price,
      date: o.createdAt.toISOString().split("T")[0],
      status: o.status
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cannot fetch sales history" });
  }
};
