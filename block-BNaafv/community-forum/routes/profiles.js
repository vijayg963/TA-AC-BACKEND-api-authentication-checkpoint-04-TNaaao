const express = require('express');
const router = express.Router();
const User = require('../models/users');
const auth = require('../middlewares/auth');
let dataformat = require('../middlewares/formatdata');
let { userJSON, userProfile } = dataformat;

// get user profile data
router.get('/:username', auth.isVerified, async (req, res, next) => {
  try {
    let user = await User.findOne({ username: req.params.username });
    console.log(user, 'profile user');
    res.status(202).json({ profile: userProfile(user) });
  } catch (error) {
    next(error);
  }
});

// blocked user have no access to this routes
router.use(auth.isAuthoriZed);

// update user information only logged in user can update their account only
router.put('/:username', auth.isVerified, async (req, res, next) => {
  try {
    let user = await User.findOne({ username: req.params.username });
    if (user.username === req.user.username) {
      let updatedProfile = await User.findByIdAndUpdate(user._id, req.body, {
        new: true,
      });
      res.status(202).json({ profile: userProfile(updatedProfile) });
    }
    res
      .status(403)
      .json({ error: ' you are not authorized user login with your account' });
  } catch (error) {
    next(error);
  }
});

//follow  the user
router.get('/:username/follow', auth.isVerified, async (req, res, next) => {
  try {
    let username = req.params.username;
    let user = await User.findOne({ username: username });
    //if no targated user is found with this usernmae then show this error
    if (!user) {
      return res
        .status(400)
        .json({ message: 'there is no user with this username' });
    }
    let updateProfile = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { followingList: user._id },
      },
      {
        new: true,
      }
    );

    // now update again if one user has followed then it should be
    //reflected back in other user data so update the second user follower list
    let targetedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: { followersList: updateProfile._id },
      },
      { new: true }
    );

    res.status(202).json({
      user: userProfile(updateProfile),
      targetedUser: userProfile(targetedUser),
    });
  } catch (error) {
    next(error);
  }
});

//unfollow the user
router.delete('/:username/follow', auth.isVerified, async (req, res, next) => {
  try {
    let username = req.params.username;
    let user = await User.findOne({ username: username });
    // Remove from the follower list of the user who is unfollowing
    let updateProfile = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { followingList: user._id },
      },
      {
        new: true,
      }
    );
    // also remove  form the user follower list whose follower is going to lose
    // once a user has unfollowed him it should reflect also in his data
    let targetedUser = await User.findOneAndUpdate(
      { username: username },
      { $pull: { followersList: req.user.id } },
      { new: true }
    );

    res.status(202).json({
      user: userProfile(updateProfile),
      targetedUser: userProfile(targetedUser),
    });
  } catch (error) {
    next(error);
  }
});
module.exports = router;
