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
      model: User, // Chỉ định rõ cho Mongoose biết phải lấy data từ Model User
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

// API: Thêm bình luận mới vào một bức ảnh
router.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  try {
    const photoId = req.params.photo_id;
    const commentText = req.body.comment; // Lấy nội dung comment từ body
    
    // 1. Kiểm tra xem người dùng có truyền comment lên không, hoặc comment có bị rỗng không
    if (!commentText || commentText.trim().length === 0) {
      return res.status(400).send("Comment text cannot be empty");
    }

    // 2. Lấy ID của người dùng đang đăng nhập từ Session
    // (Middleware ở index.js đã đảm bảo rằng nếu lọt được vào hàm này thì chắc chắn req.session.user tồn tại)
    const userId = req.session.user._id;

    // 3. Tìm bức ảnh trong Database
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(400).send("Photo not found");
    }

    // 4. Tạo đối tượng comment mới
    const newComment = {
      comment: commentText,
      date_time: new Date(), // Lấy thời gian hiện tại của server
      user_id: userId        // Gắn ID của người đang đăng nhập làm tác giả
    };

    // 5. Thêm comment vào mảng comments của bức ảnh và lưu lại
    photo.comments.push(newComment);
    await photo.save(); // Mongoose sẽ tự động cập nhật document này vào Database

    // Trả về thành công
    res.status(200).send({ message: "Comment added successfully" }); // Trả về dạng Object JSON
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(400).send("Error adding comment to database");
  }
});

module.exports = router;