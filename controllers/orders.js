exports.getorders = (req, res) => {
  var connection = req.app.get("conn");
  const orderId = req.params.orderid;

  if (!orderId) {
    return res.status(400).send({ data: "order id is required" });
  }
  const getIdSql =
    "SELECT id, userid, eventid, ticketid, orderid, token, amount, currency, is_paid FROM pre_orders WHERE orderid = ?";
  connection.query(getIdSql, [orderId], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length > 0) {
      console.log(results);
      res.send({
        status: 200,
        data: results,
      });
    } else {
      res.send({
        status: 300,
        data: "Order not found",
      });
    }
  });
};
exports.getCompletedOrder = async (req, res) => {
  var connection = req.app.get("conn");
  const axios = require("axios");
  const userid = req.params.userid;
  if (!userid) {
    return res.status(400).send({ data: "order id is required" });
  }
  const getIdSql =
    "SELECT id, userid, eventid, ticketid, orderid, transaction_id, amount, currency, is_paid FROM post_orders WHERE userid = ?";

  connection.query(getIdSql, [userid], async (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }

    const combinedData = [];

    const processData = (data) => {
      return new Promise((resolve, reject) => {
        const getTicketSql = "select * from ticket_details where id in (?)";
        const ticketidUprooted = data.ticketid.replace(/[\[\]]/g, "").split(",").map(Number);

        connection.query(getTicketSql,[ticketidUprooted],async (err, resultsTicket) => {
            if (err) {
              return reject(err);
            }

            if (resultsTicket.length > 0) {
              data.ticket_data = resultsTicket;

              try {
                const userData = await getUser(data.userid);
                data.primary_userDetails = userData;

                const getEventStatus = await getEvent(data.eventid);
                data.event_data = getEventStatus;

                combinedData.push(data);
                resolve();
              } catch (err) {
                reject(err);
              }
            } else {
              resolve();
            }
          }
        );
      });
    };

    try {
      const promises = results.map((data) => processData(data));
      await Promise.all(promises);
      res.send({
        status: 200,
        data: combinedData,
      });
    } catch (err) {
      res.status(500).send(err);
    }
  });

  async function getUser(userid) {
    const URL = process.env.BASE_URL + `user/${userid}`;
    try {
      const response = await axios.get(URL);
      const filteredData = response.data.data.map((item) => {
        return {
          username: item.username,
          email: item.email,
          mobile: item.mobile,
          passport_no: item.passport_no,
          profile_pic: item.profile_pic,
        };
      });
      return filteredData[0];
    } catch (error) {
      console.error("Error making GET request:", error);
      throw error;
    }
  }
  async function getEvent(eventid) {
    const URL = process.env.BASE_URL + `get_event_userid_eventid/${eventid}`;
    try {
      const response = await axios.get(URL);
      if (response.data.status === 300) {
        return false;
      } else {
        return response.data.data[0];
      }
    } catch (error) {
      console.error("Error making GET request:", error);
      throw error;
    }
  }
};


exports.getHostedEventPaidTickets=async(req,res)=>{
  var connection = req.app.get("conn");
  const axios = require("axios");
  const userid = req.params.userid;
  if (!userid) {
    return res.status(400).send({ data: "order id is required" });
  }
  const getIdSql =
    "SELECT  group_concat(id ORDER BY id DESC) as event_id FROM event_details WHERE userid = ?";
  connection.query(getIdSql, [userid], async (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length > 0 && results[0].event_id) {
      const eventIds = results[0].event_id.split(',');
      
      const eventDataPromises = eventIds.map(async (eventId) => {
        try {
          const event = await getEvent(eventId);
          const ticketPo = await new Promise((resolve, reject) => {
            const getTitPoql = "SELECT ticketid FROM post_orders WHERE eventid = ?";
            connection.query(getTitPoql, [eventId], (err, results) => {
              if (err) reject(err);
              else resolve(results);
            });
          });
          if (ticketPo.length > 0 && ticketPo[0].ticketid) {
            const tickets = ticketPo[0].ticketid.replace(/[\[\]]/g, '').split(',').map(Number);
            const ticketData = await new Promise((resolve, reject) => {
              const getTicketDetails = "SELECT * FROM ticket_details WHERE id IN (?)";
              connection.query(getTicketDetails, [tickets], (err, results) => {
                if (err){
                   reject(err);
                  }
                else{ 
                  results.forEach(result => {
                    result.pass_enc = Buffer.from(result.pass_enc, 'base64').toString('ascii');
                  });
                  console.log(results);
                  resolve(results);
                }
              });
            });
            return {
              ...event,
              ticketData: ticketData
            };
          } else {
            return {
              ...event,
              ticketData: [] // Return empty array if no tickets
            };
          }
        } catch (error) {
          console.error(`Error processing eventId ${eventId}:`, error);
          return {
            id: eventId,
            ticketData: [] // Return empty array on error
          };
        }
      });
    
      try {
        const eventData = await Promise.all(eventDataPromises);
        res.send({
          status: 200,
          data: eventData
        });
      } catch (error) {
        res.status(500).send(error);
      }
    } else {
      res.send({
        status: 200,
        data: []
      });
    }

  });
  async function getEvent(eventid) {
    const URL = process.env.BASE_URL + `get_event_userid_eventid/${eventid}`;
    try {
      const response = await axios.get(URL);
      if (response.data.status === 300) {
        return false;
      } else {
        return response.data.data[0];
      }
    } catch (error) {
      console.error("Error making GET request:", error);
      throw error;
    }
  }
}





exports.getPostPayment = async (req, res) => {
  var connection = req.app.get("conn");
  const axios = require("axios");
  const orderId = req.params.orderid;
  if (!orderId) {
    return res.status(400).send({ data: "order id is required" });
  }
  const getIdSql =
    "SELECT id, userid, eventid, ticketid, orderid, transaction_id, amount, currency, is_paid FROM post_orders WHERE orderid = ?";
  connection.query(getIdSql, [orderId], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length > 0) {
      const poData = results[0];
      const getTicketSql =
        "select GROUP_CONCAT(ticket_name) as ticket_names from ticket_details where id in (?)";
      const ticketidUprooted = poData.ticketid
        .replace(/[\[\]]/g, "")
        .split(",")
        .map(Number);
      connection.query(
        getTicketSql,
        [ticketidUprooted],
        async (err, resultsTicket) => {
          if (err) {
            return res.status(500).send(err);
          }
          if (resultsTicket.length > 0) {
            poData.ticket_name = resultsTicket[0].ticket_names;
            const userData = await getUser(poData.userid);
            poData.primary_name = userData.username;
            poData.primary_email = userData.email;
            poData.primary_mobile = userData.mobile;
            const getEventStatus = await getEvent(poData.eventid);
            poData.event_title = getEventStatus.event_title;
            poData.event_thumbnail = getEventStatus.event_thumbnail;
            res.send({
              status: 200,
              data: poData,
            });
          }
        }
      );
    } else {
      res.send({
        status: 300,
        data: "Order not found",
      });
    }
  });
  async function getUser(userid) {
    const URL = process.env.BASE_URL + `user/${userid}`;
    try {
      const response = await axios.get(URL);
      const filteredData = response.data.data.map((item) => {
        return {
          username: item.username,
          email: item.email,
          mobile: item.mobile,
        };
      });
      return filteredData[0];
    } catch (error) {
      console.error("Error making GET request:", error);
      throw error;
    }
  }
  async function getEvent(eventid) {
    const URL = process.env.BASE_URL + `get_event_userid_eventid/${eventid}`;
    try {
      const response = await axios.get(URL);
      if (response.data.status === 300) {
        return false;
      } else {
        return response.data.data[0];
      }
    } catch (error) {
      console.error("Error making GET request:", error);
      throw error;
    }
  }
};
