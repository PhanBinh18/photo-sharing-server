const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const users = await User.find({}, "_id first_name last_name");
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "_id first_name last_name location description occupation");
    if (!user) {
      return res.status(400).send("User not found");
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send("Invalid ID");
  }
});

// API: Đăng ký người dùng mới (Register)
router.post("/", async (req, res) => {
  try {
    const { login_name, password, first_name, last_name, location, description, occupation } = req.body;

    // 1. Kiểm tra các trường bắt buộc không được để trống
    if (!login_name || !password || !first_name || !last_name) {
      return res.status(400).send("Vui lòng điền đầy đủ các trường bắt buộc (login_name, password, first_name, last_name).");
    }

    // 2. Kiểm tra xem login_name đã có ai sử dụng chưa
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return res.status(400).send("Tên đăng nhập này đã tồn tại. Vui lòng chọn tên khác!");
    }

    // 3. Tạo user mới
    const newUser = new User({
      login_name,
      password, // Ở Lab này ta lưu text thuần. 
      first_name,
      last_name,
      location: location || "",
      description: description || "",
      occupation: occupation || ""
    });

    // 4. Lưu vào Database
    await newUser.save();

    // 5. Trả về object user vừa tạo (giấu password)
    res.status(200).send({
      _id: newUser._id,
      login_name: newUser.login_name,
      first_name: newUser.first_name,
      last_name: newUser.last_name
    });

  } catch (error) {
    console.error("Lỗi khi đăng ký user:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;