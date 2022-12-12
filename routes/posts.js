const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//create a post

router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
//update a post

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("the post has been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete a post

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//like / dislike a post

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//get a post

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts
//important point here we are using .toObject() in line 86 and 111 so that we aviod a
//wierd way the object is created with _doc which is the moongoose format

//look for the nested for loop code on 107 line, .map is not used because .map does not know async
// but for loop waits for the user call to DB

router.get("/timeline/:userId", async (req, res) => {
  try {
    //creating user posts object
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    let profilePicture = currentUser.profilePicture;
    let username = currentUser.username;

    let newUserPosts = [];
    userPosts.map((post) => {
      const newUserPostsObject = {
        ...post.toObject(),
        profilePicture,
        username,
      };
      newUserPosts.push(newUserPostsObject);
    });

    //creating friend posts object
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );

    let newFriendPosts = [];

    for (let friend of friendPosts) {
      for (let post of friend) {
        const { profilePicture, username } = await User.findById(post.userId);
        const newFriendPostsObject = {
          ...post.toObject(),
          profilePicture,
          username,
        };
        newFriendPosts.push(newFriendPostsObject);
      }
    }

    res.status(200).json(newFriendPosts.concat(...newUserPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

//get user's all posts

//above approach for getting the name and DP on post object

router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findById(req.params.username);
    console.log(user);
    const posts = await Post.find({ userId: user._id });
    let profilePicture = user.profilePicture;
    let username = user.username;

    let newUserPosts = [];
    posts.map((post) => {
      const newUserPostsObject = {
        ...post.toObject(),
        profilePicture,
        username,
      };
      newUserPosts.push(newUserPostsObject);
    });

    res.status(200).json(newUserPosts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
