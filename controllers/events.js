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
  const event_data = {
    userid: req.body.userid,
    event_title: req.body.event_title,
    event_desc: req.body.event_desc ? req.body.event_desc : "",
    property_type: req.body.property_type,
    property_images_1: req.body.property_img_1 ? req.body.property_img_1 : "",
    property_images_2: req.body.property_img_2 ? req.body.property_img_2 : "",
    property_images_3: req.body.property_img_3 ? req.body.property_img_3 : "",
    property_images_4: req.body.property_img_4 ? req.body.property_img_4 : "",
    property_images_5: req.body.property_img_5 ? req.body.property_img_5 : "",
    property_images_6: req.body.property_img_6 ? req.body.property_img_6 : "",
    property_images_7: req.body.property_img_7 ? req.body.property_img_7 : "",
    property_images_8: req.body.property_img_8 ? req.body.property_img_8 : "",
    address: req.body.address ? req.body.address : "",
    event_date:`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
    ammenities:req.body.ammenities?req.body.ammenities:'',
    house_rules:req.body.house_rules?req.body.house_rules:'',
    mobile:req.body.mobile,
    pass_enc:req.body.pass_enc?req.body.pass_enc:'',
    min_price:req.body.min_price?req.body.min_price:'150',
    max_price:req.body.max_price?req.body.max_price:'1000'
  };
  console.log(event_data);

    const sql = "INSERT INTO event_details SET ?";
    connection.query(sql, event_data, (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.json({
        'status':200,
        'message':result.insertId
      })
    });
};
exports.getEvent=(req,res)=>{
    var connection = req.app.get("conn");
    const userid=req.body.userid;
    const sql = "select * from event_details where userid='?'";
    connection.query(sql, userid, (err, result) => {
        if (err) {
          return res.status(500).send(err);
        }
        res.json({
          'status':200,
          'message':result
        })
      });
}