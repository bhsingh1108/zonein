require('dotenv').config();
const querystring = require("querystring");
const express = require('express')
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cors = require("cors");
const cookieParser = require("cookie-parser");
//////////////////////creds////////////////////////////////
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET;
const SERVER_ROOT_URI=process.env.SERVER_ROOT_URI;
const UI_ROOT_URI=process.env.UI_ROOT_URI
const JWT_SECRET=process.env.JWT_SECRET
const COOKIE_NAME=process.env.COOKIE_NAME


function getGoogleAuthURL() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: `${SERVER_ROOT_URI}`,
      //redirect_uri:`http://localhost:3100/success`,
      client_id: GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };
  
    return `${rootUrl}?${querystring.stringify(options)}`;
  }

  function getTokens(_a) {
    var code = _a.code, clientId = _a.clientId, clientSecret = _a.clientSecret, redirectUri = _a.redirectUri;
    /*
     * Uses the code to get tokens
     * that can be used to fetch the user's profile
     */
    var url = "https://oauth2.googleapis.com/token";
    var values = {
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    };
  
    return axios
     // .post(`https://oauth2.googleapis.com/token/${values.code}/${values.client_id}/${values.client_secret}/${values.redirect_uri}/${values.grant_type}`,{
         .post(url, querystring.stringify(values), {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
       })
        .then(function (res) {  
           return res.data; 
          //console.log('this ',res.data)
        })
        .catch(function (error) {
        console.error("Failed to fetch auth tokens inside function");
        throw new Error(error.message);
    });
  }

  module.exports= {getGoogleAuthURL,getTokens}