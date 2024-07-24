exports.createEvent = async(req, res) => {
    var connection = req.app.get("conn");
    const axios = require("axios");
  const date = req.body.date;
  const time = JSON.stringify(req.body.time);
  const dateTimeStr = `${date} ${time}`;
  const dateTimeObj = new Date(dateTimeStr);
  const year = dateTimeObj.getFullYear();
  const month = String(dateTimeObj.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(dateTimeObj.getDate()).padStart(2, "0");
  const hours = String(dateTimeObj.getHours()).padStart(2, "0");
  const minutes = String(dateTimeObj.getMinutes()).padStart(2, "0");
  const seconds = String(dateTimeObj.getSeconds()).padStart(2, "0");
 // `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  var passEncoded = req.body.pass_enc?Buffer.from(req.body.pass_enc).toString('base64'):'';
  const profile_pic=await getUserProfilePic(req.body.userid);
  if(profile_pic!=null){
    var profile_pic_encoded=Buffer.from(profile_pic).toString('base64');
  }else{
    var profile_pic_encoded='';
  }
  
  const event_data = {
    userid: req.body.userid,
    event_title: req.body.event_title,
    event_desc: req.body.event_desc ? req.body.event_desc : "",
    property_type: req.body.property_type,
    property_images_1: req.body.property_img_1 ? JSON.stringify(req.body.property_img_1) : "",
    property_images_2: req.body.property_img_2 ? req.body.property_img_2 : "",
    property_images_3: req.body.property_img_3 ? req.body.property_img_3 : "",
    property_images_4: req.body.property_img_4 ? req.body.property_img_4 : "",
    property_images_5: req.body.property_img_5 ? req.body.property_img_5 : "",
    property_images_6: req.body.property_img_6 ? req.body.property_img_6 : "",
    property_images_7: req.body.property_img_7 ? req.body.property_img_7 : "",
    property_images_8: req.body.property_img_8 ? req.body.property_img_8 : "",
    address: req.body.address ? req.body.address : "",
    event_date:req.body.date?req.body.date:'',
    event_time:req.body.time?req.body.time:'',
    host_name:req.body.host_name?req.body.host_name:'',
    nationality:req.body.nationality?req.body.nationality:'',
    ammenities:req.body.ammenities?JSON.stringify(req.body.ammenities):'',
    house_rules:req.body.house_rules?req.body.house_rules:'',
    mobile:req.body.mobile,
    pass_enc:passEncoded,
    min_price:req.body.min_price?req.body.min_price:'150',
    max_price:req.body.max_price?req.body.max_price:'1000',
    user_selfie:profile_pic_encoded?profile_pic_encoded:'',
    event_thumbnail:req.body.event_thumbnail?req.body.event_thumbnail:''
  };
    const sql = "INSERT INTO event_details SET ?";
    connection.query(sql, event_data, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.json({
        'status':200,
        'data':result.insertId
      })
    });
    async function getUserProfilePic(userid){
      const URL = process.env.BASE_URL + `user/${userid}`;
        try {
          const response = await axios.get(URL);
          return response.data.data[0].profile_pic;
        } catch (error) {
          console.error("Error making GET request:", error);
          throw error;
        }
    }
};

exports.getEvent=(req,res)=>{
    var connection = req.app.get("conn");
    const status=req.params.status;
    if(status==="all"){
      var sql = "select * from event_details order by id desc";
    }else{
    var sql = "select * from event_details where event_status=?";
    }
    connection.query(sql, status, (err, result) => {
        if (err) {
          return res.status(500).send(err);
        }
        if (result.length > 0) {
          const data = result;
          
          // Decode the pass_enc value
          for (let i = 0; i < data.length; i++) {
              data[i].pass_enc = Buffer.from(data[i].pass_enc, 'base64').toString('ascii');
              data[i].user_selfie = data[i].user_selfie!=null?Buffer.from(data[i].user_selfie, 'base64').toString('ascii'):'';
              data[i].property_images_1=JSON.parse(data[i].property_images_1);
              data[i].ammenities=JSON.parse(data[i].ammenities);
          }            
          res.send({
              'status': 200,
              'data': data
          });
      } else {
          res.status(404).send({ message: 'no event found' });
      }
      });
}
exports.updateEvent=(req,res)=>{
  var connection=req.app.get("conn");
  const event_id=req.params.event_id;
  const capacity=req.body.capacity?req.body.capacity:'0';
  const ticket_price=req.body.ticket_price?req.body.ticket_price:'0';
  const event_status=req.body.event_status?req.body.event_status:0;
  const checkEventSql = 'SELECT * FROM event_details WHERE id = ?';
  
  connection.query(checkEventSql, event_id, (err, results) => {
    if (err) {
        return res.status(500).send(err);
    }
    if (results.length > 0) {
      const updateEventDetails = 'update event_details set event_status=?,capacity=?,ticket_price=? where id=?';
      connection.query(updateEventDetails, [event_status,capacity,ticket_price,event_id], (err, results) => {
        if (err) {
          return res.status(500).send(err);
        }
        res.json({
          'status':200,
          'data':results
        });
      });
    }
  });


   
}
exports.getEventOnUserEvent=(req,res)=>{
  var connection = req.app.get("conn");
  const eventid=req.params.eventid;
  const sql = "select * from event_details where  id=?";
  connection.query(sql, [eventid], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (result.length > 0) {
        const data = result; 
        for (let i = 0; i < data.length; i++) {
          data[i].pass_enc = Buffer.from(data[i].pass_enc, 'base64').toString('ascii');
              data[i].user_selfie = data[i].user_selfie!=null?Buffer.from(data[i].user_selfie, 'base64').toString('ascii'):'';
              data[i].property_images_1=JSON.parse(data[i].property_images_1);
              data[i].ammenities=JSON.parse(data[i].ammenities);   
      }          
        res.send({
            'status': 200,
            'data': data
        });
    } else {
      res.send({
        'status': 300,
        'data': 'no event for this userid and eventid'
    });
    }
    });
}