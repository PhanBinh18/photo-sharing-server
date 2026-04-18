const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();

router.get("/photosOfUser/:id", async (req, res) => {
  try {
    const photos = await Photo.find({ user_id: req.params.id });
    if (!photos || photos.length === 0) {
      return res.status(400).send("No photos found or invalid ID");
    }

    const photosWithComments = await Promise.all(
      photos.map(async (photo) => {
        const photoObj = photo.toObject();
        if (photoObj.comments) {
          photoObj.comments = await Promise.all(
            photoObj.comments.map(async (comment) => {
              const user = await User.findById(comment.user_id, "_id first_name last_name");
              return {
                comment: comment.comment,
                date_time: comment.date_time,
                _id: comment._id,
                user: user
              };
            })
          );
        }
        return photoObj;
      })
    );
    res.status(200).send(photosWithComments);
  } catch (error) {
    res.status(400).send("Error retrieving photos");
  }
});

module.exports = router;