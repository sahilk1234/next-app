const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const confiq = require("../config").get(process.env.NODE_ENV);
const salt = 10;

const userSchema = mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    maxlength: 100,
  },
  lastname: {
    type: String,
    required: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  password2: {
    type: String,
    required: true,
    minlength: 8,
  },
  token: {
    type: String,
  },
});
// to signup a user
userSchema.pre("save", function (next) {
  const user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(salt, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        user.password2 = hash;
        next();
      });
    });
  } else {
    next();
  }
});

//to login
userSchema.methods.comparePassword = async function (password) {
  console.log(password, "*", this.password);

  const validPassword = await bcrypt.compare(password, this.password);
  return validPassword;
};

// generate token

userSchema.methods.generateToken = async function () {
  const user = this;
  const token = jwt.sign(user._id.toHexString(), confiq.SECRET);

  user.token = token;
  const newUser = await user.save();
  return newUser;
};

// find by token
userSchema.statics.findByToken = async function (token) {
  const user = this;

  return await jwt.verify(token, confiq.SECRET, async function (err, decode) {
    const userCurrent = await user.find({ _id: decode, token: token });
    if (err) {
      return null;
    }
    return userCurrent;
  });
};

//delete token

userSchema.methods.deleteToken = function (token, cb) {
  const user = this;

  user.update({ $unset: { token: 1 } }, function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

module.exports = mongoose.model("User", userSchema);
