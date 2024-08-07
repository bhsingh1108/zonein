const express = require('express');
const session = require("express-session");
const multer = require('multer');
const cors = require("cors");
const mysql = require('mysql2');
const cookieParser = require("cookie-parser");
require('dotenv').config();
const bodyParser = require('body-parser');
const isAuth = require("./middlewares/is-auth");
const UI_ROOT_URI=process.env.UI_ROOT_URI;
const port = 3200;
const app = express();
const Home= require('./controllers/home');
const PropType= require('./controllers/prop_types');
const Ammenties= require('./controllers/ammenties');
const Users = require('./controllers/users');
const Events = require('./controllers/events');
const Ticket = require('./controllers/ticket');
const Payment=require('./controllers/payments');
const Callback = require('./controllers/callback');
const Order = require('./controllers/orders');
const PaymentVerification= require('./controllers/paymentverification');

const upload = multer();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
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
  const connection = mysql.createPool({
    connectionLimit: 500,
    host: process.env.DB_HOST, //103.191.208.137
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DBNAME,
  });
  connection.getConnection((err) => {
    if (err) {
      console.error('Error connecting to MySQL database: ' + err.stack);
      return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
  });

  app.set('conn', connection)

  app.get("/",Home.home);
  app.get("/property_types",PropType.getPropertyTypes);
  app.get("/ammenties",Ammenties.getammenities);
  app.post("/user",Users.postusers);
  app.post('/event_post',Events.createEvent);
  app.get('/get_events/:status',Events.getEvent);
  app.get('/get_event_userid_eventid/:eventid',Events.getEventOnUserEvent);
  app.put('/update_event/:event_id',Events.updateEvent);
  app.post("/ticket",Ticket.postticket);  
  app.get("/ticket/:user_id/:event_id",Ticket.getticket); 
  app.get("/user/:user_id",Users.getusers);
  app.get("/events/:user_id",Users.getevents);
  app.post("/payments",Payment.makePayment);
  app.delete('/ticket/:user_id/:ticket_id/:event_id',Ticket.deleteticket);
  app.get("/hosted_events/:user_id", Users.gethostedevents);
  app.put("/update_user/:user_id", Users.updateUser);
  app.post("/callback/order/:order_id",Callback.getcallbacks);
  app.get("/orders/:orderid", Order.getorders);
  app.post("/verify/order/:order_id",upload.none(),PaymentVerification.getverification);
  app.get('/postpayment/:orderid',Order.getPostPayment);
  app.get('/payment-completed',(req, res) => {
   // res.send({status:200,data:"zonein://payment-completed"});
    res.redirect('zonein://payment-completed');
  });
  app.get('/payment-failed',(req, res) => {
     //res.send({status:200,data:"zonein://payment-completed"});
   res.redirect('zonein://payment-failed');
  });
  app.get('/getCompletedOrder/:userid',Order.getCompletedOrder);
  app.get('/hostedEventPaidTickets/:userid',Order.getHostedEventPaidTickets);

  app.listen(port, () => {
    console.log(`App listening http://localhost:${port}`);
  });
