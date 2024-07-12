exports.createEvent = (req, res) => {
    var connection = req.app.get("conn");
  const date = req.body.date;
  const time = req.body.time;
  const dateTimeStr = `${date} ${time}`;
  const dateTimeObj = new Date(dateTimeStr);
  const year = dateTimeObj.getFullYear();
  const month = String(dateTimeObj.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(dateTimeObj.getDate()).padStart(2, "0");
  const hours = String(dateTimeObj.getHours()).padStart(2, "0");
  const minutes = String(dateTimeObj.getMinutes()).padStart(2, "0");
  const seconds = String(dateTimeObj.getSeconds()).padStart(2, "0");
  var passEncoded = req.body.pass_enc?Buffer.from(req.body.pass_enc).toString('base64'):'';
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
    event_date:`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
    ammenities:req.body.ammenities?JSON.stringify(req.body.ammenities):'',
    house_rules:req.body.house_rules?req.body.house_rules:'',
    mobile:req.body.mobile,
    pass_enc:passEncoded,
    min_price:req.body.min_price?req.body.min_price:'150',
    max_price:req.body.max_price?req.body.max_price:'1000'
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
};
exports.getEvent=(req,res)=>{
    var connection = req.app.get("conn");
    const status=req.params.status;
    const sql = "select * from event_details where event_status=?";
    connection.query(sql, status, (err, result) => {
        if (err) {
          return res.status(500).send(err);
        }
        if (result.length > 0) {
          const data = result;
          // Decode the pass_enc value
          for (let i = 0; i < data.length; i++) {
              data[i].pass_enc = Buffer.from(data[i].pass_enc, 'base64').toString('ascii');
              data[i].property_images_1=JSON.parse(data[i].property_images_1);
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