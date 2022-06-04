const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
require('dotenv').config();

let userSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String },
  avatar: { type: String },
  isadmin: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  followingList: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  followersList: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

// Hashing the password
userSchema.pre('save', async function (req, res, next) {
  try {
    this.password = await bcrypt.hash(this.password, 10);
    // it will change isverified to true only when if user is admin
    if (isadmin(this.email)) {
      this.isadmin = true;
    }
    next();
  } catch (error) {
    res.status(500).json(error);
  }
});

//sign the user web token here to authenticate  the user
userSchema.methods.signToken = function () {
  let payload = {
    id: this.id,
    username: this.username,
    email: this.email,
  };
  try {
    let token = jwt.sign(payload, process.env.SECRET);
    console.log(token);
    return token;
  } catch (e) {
    res
      .status(500)
      .json({ error: ' an error occured while signing the token ' });
  }
};
let User = mongoose.model('User', userSchema);

// function that will verify that user is admin or not
function isadmin(useremail) {
  let adminMails = process.env.ADMINMAILS;
  if (adminMails.includes(useremail)) {
    return true;
  }
  return false;
}

module.exports = User;
