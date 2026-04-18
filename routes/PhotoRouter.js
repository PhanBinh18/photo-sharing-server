const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();

router.get("/photosOfUser/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // (Tùy chọn) Kiểm tra xem User này có tồn tại trong hệ thống không
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(400).send("User does not exist");
    }

    // Lấy ảnh của user và tự động "populate" thông tin user vào trong từng comment
    const photos = await Photo.find({ user_id: userId }).populate({
      path: "comments.user_id", // Đường dẫn tới field lưu ID user trong comment
      select: "_id first_name last_name" // Chỉ lấy 3 trường này của User
    });

    // Mongoose populate tự động ánh xạ object vào, nhưng đôi khi Frontend 
    // mong đợi key là 'user' thay vì 'user_id'. Cần transform nhẹ lại dữ liệu:
    const formattedPhotos = photos.map(photo => {
      const photoObj = photo.toObject();
      if (photoObj.comments) {
        photoObj.comments = photoObj.comments.map(comment => {
          return {
            _id: comment._id,
            comment: comment.comment,
            date_time: comment.date_time,
            // Chuyển dữ liệu user đã được populate vào key 'user' cho đúng spec của lab
            user: comment.user_id 
          };
        });
      }
      return photoObj;
    });

    res.status(200).send(formattedPhotos);
  } catch (error) {
    // Catch block sẽ bắt lỗi nếu params.id bị sai format (không phải ObjectId)
    res.status(400).send("Invalid ID or Error retrieving photos");
  }
});

module.exports = router;