require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cookieParser = require("cookie-parser");
const User = require("./src/schema/user");
const { auth } = require("./src/middlewares/auth");
const db = require("./src/config").get(process.env.NODE_ENV);
console.log("ENV", process.env.NODE_ENV);
console.log("MA", process.env.MONGODB_URI);

const app = express();
// app use
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cookieParser());

// database connection
mongoose.Promise = global.Promise;
mongoose.connect(db.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// adding new user (sign-up route)
app.post("/api/register", async function (req, res) {
  // taking a user
  try {
    const newuser = new User(req.body);

    if (newuser.password != newuser.password2)
      return res.status(400).json({ message: "password not match" });

    const userExist = await User.findOne({ email: newuser.email });
    if (userExist) {
      return res.status(400).json({ auth: false, message: "email exits" });
    }

    const userData = await newuser.save();
    console.log(userData);
    res.status(200).json({
      succes: true,
      user: userData,
    });
  } catch (err) {
    res.status(400).json({ success: false, err });
  }
});

// login user
app.post("/api/login", async function (req, res) {
  try {
    let token = req.cookies.auth;

    const userFromToken = await User.findByToken(token);
    if (userFromToken) {
      return res.status(200).json({
        message: "You are already logged in",
        isLoggedIn: true,
      });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({
        isAuth: false,
        message: " Auth failed ,email not found",
      });
    }

    const isMatch = await user.comparePassword(req.body.password);

    if (!isMatch) {
      return res.json({
        isAuth: false,
        message: "password doesn't match",
      });
    }

    const currentUser = await user.generateToken();
    return res.cookie("auth", currentUser.token).json({
      isAuth: true,
      firstname: user.firstname,
      lastname: user.lastname,
      id: user._id,
      email: user.email,
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json(err);
  }
});

//get User
app.get("/api/getUser", async function (req, res) {
  let token = req.cookies.auth;
  const [userFromToken] = await User.findByToken(token);

  if (userFromToken) {
    return res.status(200).send({
      _id: userFromToken._id,
      isAuth: true,
      firstname: userFromToken.firstname,
      lastname: userFromToken.lastname,
      email: userFromToken.email,
    });
  }
  return res.status(200).send({ isAuth: false });
});

//logout user
app.get("/api/logout", auth, function (req, res) {
  req.user.deleteToken(req.token, (err, user) => {
    if (err) return res.status(400).send(err);
    res.sendStatus(200);
  });
});

app.get("/api/hi", auth, function (req, res) {
  res.status(200).send("HI");
});

module.exports = app;
