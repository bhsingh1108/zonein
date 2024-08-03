exports.getverification = async(req, res) => {
    const axios = require("axios");
    const PayTabs = require("paytabs_pt2");
    require("dotenv").config();
    var connection = req.app.get('conn');
    const orderid = req.params.order_id;
    const paymentVerificationData = req.body;
    const getPreOrderData=await getOrderData(orderid);
    let profileID = process.env.PROFILE_ID,
        serverKey = process.env.SERVER_KEY,
        region = process.env.REGION;
    PayTabs.setConfig(profileID, serverKey, region);
    if(getPreOrderData.orderid){
        if(paymentVerificationData.respStatus==="A" && getPreOrderData.is_paid==='paid'){
            if(paymentVerificationData.tranRef===getPreOrderData.token){
                let queryRequested = function ($results){
                    if($results["payment_result"]["response_status"]==="A"){
                        let postOrderData = {
                            userid: getPreOrderData.userid,
                            amount: getPreOrderData.amount,
                            ticketid: getPreOrderData.ticketid,
                            eventid: parseInt(getPreOrderData.eventid),
                            orderid: orderid,
                            currency: "AED",
                            is_paid:getPreOrderData.is_paid,
                            transaction_id:paymentVerificationData.tranRef,
                            verification_response:JSON.stringify($results)
                          };
                        const sql = "INSERT INTO post_orders SET ?";
                        connection.query(sql, postOrderData, (err, result) => {
                          if (err) {
                            return res.status(500).send(err);
                          }
                        });
                        console.log('here are results',$results);
                        res.redirect('https://backend.zonein.ae/payment-completed');
                    }
                    
                }
                PayTabs.validatePayment(paymentVerificationData.tranRef, queryRequested);
            }
        }else{
            if(paymentVerificationData.tranRef===getPreOrderData.token){
              if(getPreOrderData.is_paid==='paid'){
                let postOrderData = {
                  userid: getPreOrderData.userid,
                  amount: getPreOrderData.amount,
                  ticketid: getPreOrderData.ticketid,
                  eventid: parseInt(getPreOrderData.eventid),
                  orderid: orderid,
                  currency: "AED",
                  is_paid:getPreOrderData.is_paid,
                  transaction_id:paymentVerificationData.tranRef,
                  verification_response:JSON.stringify(paymentVerificationData)
                };
              const sql = "INSERT INTO post_orders SET ?";
              connection.query(sql, postOrderData, (err, result) => {
                if (err) {
                  return res.status(500).send(err);
                }
              });
              res.redirect('https://backend.zonein.ae/payment-completed');
              }
            }
          //  res.redirect('https://backend.zonein.ae/payment-failed');
        }
    }
    async function getOrderData(orderid) {
        const URL = process.env.BASE_URL + `orders/${orderid}`;
        try {
          const response = await axios.get(URL);
          return response.data.data[0];
        } catch (error) {
          console.error("Error making GET request:", error);
          throw error;
        }
      }

}