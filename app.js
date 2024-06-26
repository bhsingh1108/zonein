const express = require('express');
const session = require("express-session");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('dotenv').config();
const bodyParser = require('body-parser')
const isAuth = require("./middlewares/is-auth");
const UI_ROOT_URI=process.env.UI_ROOT_URI
const port = 3100;
const app = express();
const Home= require('./controllers/home');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(
    cors({
      // Sets Access-Control-Allow-Origin to the UI URI
      origin: UI_ROOT_URI,
      // Sets Access-Control-Allow-Credentials to true
      credentials: true,
    })
  );
  app.use(cookieParser());

  app.use(
    session({
      name:'sheldon',
      secret: "secret",
      resave: false,
      saveUninitialized: false,
     // store: store,
      cookie:{
        maxAge:2592000000,
        httpOnly: false,
        secure: false
    },
    })
  );


  app.get("/",Home.home);


  app.listen(port, () => {
    console.log(`App listening http://localhost:${port}`);
  });
