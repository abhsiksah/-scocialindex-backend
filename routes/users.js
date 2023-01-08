const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");

//update user
router.put("/updateuser", async (req, res) => {
  if (req.body.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    } catch (err) {
      return res.status(500).json(err);
    }
  }
  try {
    await User.findByIdAndUpdate(req.body.userId, {
      $set: req.body,
    });
    const user = await User.findById(req.body.userId);
    res.status(200).json(user);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Account has been deleted");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only your account!");
  }
});

//get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.followings.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, username, profilePicture } = friend;
      friendList.push({ _id, username, profilePicture });
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.followers.includes(req.body.userId)) {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user

router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

//get all users

//*** imp note plz remove PWD from the response */
router.get("/", async (req, res) => {
  try {
    var users = await User.find({});

    res.json(users);
  } catch (error) {
    console.log(err);
  }
});

//social Index : -
//concept -
//      each user will have a social Index which will be calculates on 4 factors (as of v6) Likes, Posts,followings and followers the points will be given on a sclae of 0-10
//      and for the calaculation, -> the user with max score will be the upper limit and then other user's score will be calculated on that
//      for eg. ScoreOfUsers = [3,4,5] so upper limit is 5 and hence the social index will be 3/5*10 , 4/5*10 and 5/5*10 -  Index = [6,8,10]

router.post("/Indexvalue/stats", async (req, res) => {
  try {
    var currentuserId = req.body._id;
    var indexValue = 0;
    var users = await User.find({});
    var posts = await Post.find({});

    let userScores = users.map((user) => {
      const Posts = posts.filter((e) => e.userId == user._id);
      const noOfLikes = Posts.reduce((sum, post) => {
        return sum + post.likes.length;
      }, 0);
      const noOfFollowings = user.followings.length;
      const noOfFollowers = user.followers.length;
      const noOfPosts = Posts.length;

      indexValue =
        noOfLikes * 3 +
        noOfPosts * 1 +
        noOfFollowings * 0.5 +
        noOfFollowers * 3;

      return { user: user.id, indexValue };
    });

    var maxScore = 0;
    var currentUserScore = 0;

    for (let value of userScores) {
      if (value.indexValue > maxScore) {
        maxScore = value.indexValue;
      }

      if (value.user === currentuserId) {
        currentUserScore = value.indexValue;
      }
    }

    var SocialIndex = (currentUserScore / maxScore) * 10;

    res.send({ SocialIndex });
  } catch (error) {
    console.log(err);
  }
});

module.exports = router;
