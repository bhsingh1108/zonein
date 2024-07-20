exports.makePayment = async (req, res) => {
  const PayTabs = require("paytabs_pt2");
  const axios = require("axios");
  require("dotenv").config();
  var connection = req.app.get("conn");

  const userid = req.body.userid;
  const eventid = req.body.event_id;
  const tickets = req.body.tickets;
  const amount = req.body.amount;
  const userCheckResponse = await getUser(userid);
  if (userCheckResponse.status === 300) {
    res.json({
      status: 300,
      data: "User dont exist",
    });
    return;
  }
  const ticketCheckResponse = await getTickets(userid, eventid, tickets);
  if (!ticketCheckResponse) {
    res.json({
      status: 300,
      data: "No tickets found for this event either number of tickets arent matching",
    });
    return;
  }
  const getEventStatus = await getEvent(eventid);
  if (!getEventStatus) {
    res.json({
      status: 300,
      data: "Event isnt approved by admin",
    });
    return;
  }
  const preOrderData = preparePreOrderData(
    userid,
    amount,
    tickets,
    eventid,
    userCheckResponse
  );
  const sql = "INSERT INTO pre_orders SET ?";
  connection.query(sql, preOrderData, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
  });
  //save in pre order//create a orderid

  let profileID = process.env.PROFILE_ID,
    serverKey = process.env.SERVER_KEY,
    region = process.env.REGION;
  PayTabs.setConfig(profileID, serverKey, region);
  let paymentMethods = ["all"];
  let transaction = {
    type: "sale",
    class: "ecom",
  };
  let transaction_details = [transaction.type, transaction.class];
  let cart = {
    id: preOrderData.orderid,
    currency: "AED",
    amount: preOrderData.amount,
    description: "House Party Payment",
  };
  let cart_details = [cart.id, cart.currency, cart.amount, cart.description];
  let customer = {
    name: userCheckResponse.data[0].username,
    email: userCheckResponse.data[0].email,
    phone: `+971${userCheckResponse.data[0].mobile}`,
    street1: "Sheikh Mohammed Bin Rashed Blvd",
    city: "Dubai",
    state: "Dubai",
    country: "United Arab Emirates",
    zip: "123234",
    ip: "1.1.1.1",
  };
  let customer_details = [
    customer.name,
    customer.email,
    customer.phone,
    customer.street1,
    customer.city,
    customer.state,
    customer.country,
    customer.zip,
    customer.ip,
  ];

  let shipping_address = customer_details;
  let url = {
    callback: `${process.env.BASE_URL}callback/order/`+cart.id, ///recives all data regarding payment details and irrespective of status
    response: `${process.env.BASE_URL}verify/order/`+ cart.id, //after payment customer is redirected here
  // response: `zonein://payment-completed`
  };
  let response_URLs = [url.callback, url.response];

  let lang = "en";

  paymentPageCreated = function ($results) {
    if($results){
        const token=$results.tran_ref;
        const sql = "select id from pre_orders where orderid=?";
        connection.query(sql, $results.cart_id, (err, result) => {
            if (err) {
            return res.status(400).send(err);
            }
            const sql1="UPDATE  pre_orders SET token=? where id=?"
            connection.query(sql1,[token,result[0].id], (err, insertResult) => {
                if (err) {
                return res.status(400).send(err);
                }
            });
        });
        res.send({
            status:200,
            data:$results.redirect_url
        })
    }
    console.log($results);
  };

  let frameMode = true;

  PayTabs.createPaymentPage(
    paymentMethods,
    transaction_details,
    cart_details,
    customer_details,
    shipping_address,
    response_URLs,
    lang,
    paymentPageCreated,
    frameMode
  );

  async function getUser(userid) {
    const URL = process.env.BASE_URL + `user/${userid}`;
    try {
      const response = await axios.get(URL);
      return response.data;
    } catch (error) {
      console.error("Error making GET request:", error);
      throw error;
    }
  }
  async function getTickets(userid, eventid, tickets) {
    const URL = process.env.BASE_URL + `ticket/${userid}/${eventid}`;
    try {
      const response = await axios.get(URL);
      if (response.data.status === 300) {
        return false;
      } else {
        const allTicketsPresent = checkTickets(tickets, response.data.data);
        if (!allTicketsPresent) {
          return false;
        }
        return true;
      }
    } catch (error) {
      console.error("Error making GET request:", error);
      throw error;
    }
  }
  async function getEvent(eventid) {
    const URL =
      process.env.BASE_URL + `get_event_userid_eventid/${eventid}`;
    try {
      const response = await axios.get(URL);
      if (response.data.status === 300) {
        return false;
      } else {
        if (response.data.data[0]["event_status"] != "1") {
          return false;
        } else {
          return true;
        }
      }
    } catch (error) {
      console.error("Error making GET request:", error);
      throw error;
    }
  }
  function checkTickets(tickets, response) {
    const ticketIds = new Set(tickets);
    return response.every((ticket) => ticketIds.has(ticket.id));
  }
  function preparePreOrderData(
    userid,
    amount,
    tickets,
    eventid,
    userCheckResponse
  ) {
    const username = userCheckResponse.data[0].username.replace(/\s+/g, ""); // Remove spaces from username
    const mobile = userCheckResponse.data[0].mobile.toString();
    const randomString = generateRandomString(
      username.length + mobile.length,
      username,
      mobile
    ); // Generate a random string of length 8
    const orderid = `order_${randomString}`;
    let postOrderData = {
      userid: parseInt(userid),
      amount: amount,
      ticketid: JSON.stringify(tickets),
      eventid: parseInt(eventid),
      orderid: orderid,
      currency: "AED",
    };
    return postOrderData;
  }
  function generateRandomString(length, username, mobile) {
    const characters = `ABCDEFGHIJKLMNOPQRSTUVW${username}XYZabcdefg${mobile}hijklmnopqrstuvwxyz0123456789`;
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  }
};
