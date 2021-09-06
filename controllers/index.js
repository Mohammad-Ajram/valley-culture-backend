const Product = require("../models/product");
const Admin = require("../models/admin");
const Invoice = require("../models/invoices");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.addProduct = async (req, res) => {
  const { title, price, gst, category } = req.body;

  try {
    const product = new Product({
      title,
      price,
      gst,
      category,
    });
    await product.save();
    res.send({ product, success: true });
  } catch (err) {
    res.status(400).send("Error occured");
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username }).exec();
    if (admin) {
      if (await bcrypt.compare(password, admin.password)) {
        const token = jwt.sign({ _id: admin._id }, process.env.TOKEN_SECRET);
        res.header("auth-token", token).send(token);
      } else res.status(400).send("Incorrect Password");
    } else res.status(400).send("Not Found");
  } catch (err) {
    res.status(400).send("Some error occured.");
  }
};

exports.createInvoice = async (req, res) => {
  const {
    invoiceNo,
    name,
    email,
    contact,
    address,
    products,
    invoiceValue,
    discount,
    payMethod,
    payStatus,
  } = req.body;
  try {
    const invoice = new Invoice({
      invoiceNo,
      name,
      email,
      contact,
      address,
      products,
      invoiceValue,
      discount,
      payMethod,
      payStatus,
    });
    await invoice.save();
    res.send({ invoice, success: true });
  } catch (err) {
    res.status(400).send("Some error occured");
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort([["createdAt", -1]]);
    res.send({ success: true, invoices });
  } catch (err) {
    res.status(400).send("Some error occured");
  }
};

exports.getInvoicesForMonth = async (req, res) => {
  const { month, year } = req.params;
  try {
    const invoices = await Invoice.find({
      createdAt: {
        $gte: new Date(`${year}-${month}-1`),
        $lte: new Date(`${year}-${month}-31`),
      },
    }).exec();
    res.send({ success: true, invoices });
  } catch (err) {
    res.status(400).send("Some error occured");
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort([["createdAt", -1]]);
    res.send({ success: true, products });
  } catch (err) {
    res.status(400).send("Some error occured");
  }
};

exports.getProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ _id: id }).exec();
    if (product) res.send({ success: true, product });
    else res.send({ success: false, message: "Not Found" });
  } catch (err) {
    res.status(400).send("Some error occured");
  }
};

exports.getInvoice = async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await Invoice.findOne({ _id: id }).exec();
    if (invoice) res.send({ success: true, invoice });
    else res.send({ success: false, message: "Not Found" });
  } catch (err) {
    res.status(400).send("Some error occured");
  }
};

exports.updateInvoice = async (req, res) => {
  const {
    id,
    invoiceNo,
    name,
    email,
    contact,
    address,
    products,
    invoiceValue,
    discount,
    payMethod,
    payStatus,
  } = req.body;
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: id },
      {
        invoiceNo,
        name,
        email,
        contact,
        address,
        products,
        invoiceValue,
        discount,
        payMethod,
        payStatus,
      },
      { new: true }
    );
    res.send({ success: true, invoice });
  } catch (err) {
    res.status(400).send("Some error occured");
  }
};

exports.updateProduct = async (req, res) => {
  const { id, title, price, gst, category } = req.body;
  try {
    const product = await Product.findOneAndUpdate(
      { _id: id },
      {
        title,
        price,
        gst,
        category,
      },
      { new: true }
    );
    res.send({ success: true, product });
  } catch (err) {
    res.status(400).send("Some error occured");
  }
};

exports.getInvoiceNo = async (req, res) => {
  try {
    const invoice = await Invoice.find()
      .limit(1)
      .sort({ createdAt: -1 })
      .exec();
    if (invoice.length > 0)
      res.send({ success: true, invoiceNo: invoice[0].invoiceNo });
    else res.send({ success: false, message: "No invoice found" });
  } catch (err) {
    res.status(400).send("Some error occured");
  }
};

exports.sendEmail = async (req, res) => {
  const { senderEmail } = req.params;
  try {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Valley Culture" <valleyculture123@gmail.com>', // sender address
      to: senderEmail, // list of receivers
      subject: "Invoice", // Subject line
      text: "Invoice", // plain text body
      html: "<h1 style='color:white;text-align:center;background-color:black;padding:8px 0px;'><b>Invoice</b></h1>", // html body
      attachments: [
        {
          // utf-8 string as an attachment
          filename: req.files.file.name,
          content: new Buffer.from(
            req.files.file.data,
            req.files.file.encoding
          ),
        },
      ],
    });
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.send({ success: true });
  } catch (err) {
    res.status(400).send("Some error occured");
  }
};
