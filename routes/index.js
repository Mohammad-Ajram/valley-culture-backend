const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const Admin = require("../models/admin");

const {
  addProduct,
  loginUser,
  createInvoice,
  getInvoices,
  getInvoice,
  getProducts,
  getProduct,
  updateInvoice,
  updateProduct,
  getInvoiceNo,
  sendEmail,
  getInvoicesForMonth,
} = require("../controllers");

const { adminCheck } = require("../middlewares");

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);
  try {
    const admin = new Admin({
      username,
      password: hashPassword,
    });
    await admin.save();
    res.send(admin);
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/add-product", adminCheck, addProduct);
router.post("/login", loginUser);
router.post("/create-invoice", adminCheck, createInvoice);
router.get("/get-invoices", adminCheck, getInvoices);
router.get("/get-invoice/:id", adminCheck, getInvoice);
router.get("/get-products", adminCheck, getProducts);
router.get("/get-product/:id", adminCheck, getProduct);
router.put("/update-invoice", adminCheck, updateInvoice);
router.put("/update-product", adminCheck, updateProduct);
router.get("/get-invoice-no", adminCheck, getInvoiceNo);
router.post("/send-email/:senderEmail", adminCheck, sendEmail);
router.get("/get-invoices-for-month/:month/:year", getInvoicesForMonth);

module.exports = router;
