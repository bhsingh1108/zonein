const express = require('express');
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cors = require("cors");
const querystring = require("querystring");
const cookieParser = require("cookie-parser");
const mongoose = require('mongoose')
const Binance = require('node-binance-api');
require('dotenv').config();
const bodyParser = require('body-parser')
const gloginlibs=require('./glogin')
const GLoginDb = require('../models/usersgmail');
const ApiBinanceData = require('../models/apicredbinance');
const BinanceTransactions = require('../models/transactionbinance');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET;
const SERVER_ROOT_URI=process.env.SERVER_ROOT_URI;
const UI_ROOT_URI=process.env.UI_ROOT_URI
const JWT_SECRET=process.env.JWT_SECRET
const COOKIE_NAME=process.env.COOKIE_NAME

exports.loginSuccess=async (req, res) => {
    const code = req.query.code;
    const { id_token, access_token } = await gloginlibs.getTokens({
      code,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      redirectUri: `${SERVER_ROOT_URI}`,
    });
  
   // Fetch the user's profile with the access token and bearer
  
    const googleUser = await axios
      .get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      )
      .then((res) => res.data)
      .catch((error) => 
      {
        console.error(`Failed to fetch user`);
        throw new Error(error.message);
      });
  
    const token = jwt.sign(googleUser, JWT_SECRET);
  
    res.cookie(COOKIE_NAME, token, {maxAge: 900000, httpOnly: true,secure: false,});
    req.session.isAuth = true;
    // req.session.username = user.username;
    res.redirect('/discover')
  // res.redirect(UI_ROOT_URI);
  }