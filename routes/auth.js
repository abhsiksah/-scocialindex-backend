const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const duplicateuser = await User.findOne({ email: req.body.email });
    console.log(duplicateuser);
    duplicateuser && res.status(404).json("user already exists");
    //create new user

    if (!duplicateuser) {
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        profilePicture: req.body.profilePicture,
        coverPicture: req.body.coverPicture,
        isAdmin: req.body.isAdmin,
      });

      //save user and respond
      const user = await newUser.save();
      res.status(200).json(user);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//Google Register
router.post("/glogin", async (req, res) => {
  try {
    //no need to check as it will be taken care by google API

    const duplicateuser = await User.findOne({ email: req.body.email });

    if (duplicateuser) {
      res.status(200).json(duplicateuser);
    } else {
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        profilePicture: req.body.profilePicture,
        coverPicture: req.body.coverPicture,
        isAdmin: req.body.isAdmin,
      });

      //save user and respond
      const user = await newUser.save();
      res.status(200).json(user);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).json("user not found");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).json("wrong password");

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
