const express = require("express");
const router = express.Router();
const User = require("../db/userModel");

// API Đăng nhập: POST /admin/login [cite: 225]
router.post("/login", async (req, res) => {
  const { login_name } = req.body; // Lấy login_name từ body [cite: 226, 228]
  
  try {
    const user = await User.findOne({ login_name }); // Kiểm tra user tồn tại [cite: 229]
    
    if (!user) {
      return res.status(400).send("Login name is not a valid account"); // [cite: 227]
    }

    // Lưu thông tin vào session 
    req.session.user = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name
    };

    // Trả về thông tin user cần thiết cho FE [cite: 231, 232]
    res.status(200).send({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name
    });
  } catch (err) {
    res.status(400).send("Login failed");
  }
});

// API Đăng xuất: POST /admin/logout [cite: 234]
router.post("/logout", (req, res) => {
  if (!req.session.user) {
    return res.status(400).send("User is not currently logged in"); // [cite: 235]
  }
  
  req.session.destroy((err) => { // Xóa session [cite: 234]
    if (err) return res.status(400).send("Logout failed");
    res.status(200).send("Logged out");
  });
});

module.exports = router;