// register the user

const express = require("express");
const router = express.Router();
const {check,validationResult} = require("express-validator");

const auth = require("../middleware/auth");
const postModel = require("../models/posts");
const userModel = require("../models/user");

//@route : /posts
// @method : get
//@access : public
//@description : used for testing purpose. share the deatils of all.
router.get("", (req, res) => {
  res.json({ msg: "hello from posts" });
});
module.exports = router;
