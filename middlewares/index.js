const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");

exports.adminCheck = async (req, res, next) => {
  try {
    const token = req.header("auth-token");
    if (!token) res.status(401).send("Admin access denied");
    else {
      const verified = jwt.verify(token, process.env.TOKEN_SECRET);
      const admin = await Admin.findOne({ _id: verified._id });
      req.admin = admin;
      if (admin) next();
      else res.status(401).send("Admmin access denied");
    }
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};
