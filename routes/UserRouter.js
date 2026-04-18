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

module.exports = router;