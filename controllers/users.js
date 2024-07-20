exports.postusers = (req, res) => {
    var connection = req.app.get('conn');
    const last_name=req.body.last_name?req.body.last_name:'';
    // var profilePicEncoded = Buffer.from(req.body.profile_pic).toString('base64')
    const user = {
        username: req.body.first_name +' '+ last_name,
        mobile: req.body.phone_number,
       // email: req.body.email?req.body.email:'',
        // passport_no: req.body.passport_no?req.body.passport_no:'null',
        // profile_pic: profilePicEncoded,
    };
    
    const checkEmailSql = 'SELECT * FROM users WHERE mobile = ?';
    connection.query(checkEmailSql, [user.mobile], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length > 0) {
            return res.status(300).send({ message: 'User already exists' });
    }
  

    const sql = 'INSERT INTO users SET ?';
    connection.query(sql, user, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        // res.send({
        //     'status': 200,
        //     'user id': result
        // });

    const getUserSql = 'SELECT id FROM users WHERE mobile = ?';
    connection.query(getUserSql, [user.mobile], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length > 0) {
            const userId = results[0].id;
            // res.status(200).send({ message: `User added with ID: ${userId}` });
            res.send({
                'status': 200,
                'user_id': userId
            });
        } else {
            res.status(500).send({ message: 'User added but failed to retrieve ID' });
        }
    });
    });
});
};


// Route to get user data based on user_id and email
exports.getusers = (req, res) => {
    var connection = req.app.get('conn');
    const getUserSql = 'SELECT * FROM users WHERE id = ?';
    connection.query(getUserSql, [req.params.user_id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length > 0) {
            const user = results;
            for (let i = 0; i < user.length; i++) {
                if (user[i].profile_pic != null) {
                    user[i].profile_pic = Buffer.from(user[i].profile_pic, 'base64').toString('ascii');
                }    
            }
            res.send({
                'status': 200,
                'data': user
            });
        } else {
            res.send({
                'status': 300,
                'data': 'User not found'
            });
        }
    });
};


exports.updateUser = (req, res) => {
    var connection = req.app.get('conn');
    const userId = req.params.user_id;
    const email = req.body.email?req.body.email:'';
    var profile_pic = req.body.profile_pic?req.body.profile_pic:'';
    if (profile_pic.length) {
        const profilePicEncoded = Buffer.from(req.body.profile_pic).toString('base64')
        var profile_pic = profilePicEncoded
    }
    
    if (!email && !profile_pic) {
        res.status(404).send({ status: 404, message: 'Invalid data'})
    }
   

    const updateUserSql = `UPDATE users SET ${email.length?profile_pic.length? 'email = ?, profile_pic = ?':'email = ?':'profile_pic = ?'} WHERE id = ?`;
    const data = 
    email.length && profile_pic.length 
        ? [email, profile_pic, userId] 
        : email.length 
            ? [email, userId] 
            : [profile_pic, userId];
    
    connection.query(updateUserSql, data, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows > 0) {
            res.send({
                'status': 200,
                'data': 'User details updated successfully'
            });
            // res.status(200).send({ message: 'User details updated successfully' });
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    });
};

// Route to get event details based on user_id
exports.getevents = (req, res) => {
    var connection = req.app.get('conn');
    const user_id = req.params.user_id;

    if (!user_id) {
        res.send({
            'status': 400,
            'data': 'User ID is required'
        });
    }

    // Step 1: Get event_id(s) from tickets table
    const getEventIdsSql = 'SELECT event_id FROM ticket_details WHERE userid = ?';
    connection.query(getEventIdsSql, [user_id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }

        if (results.length > 0) {
            const eventIds = results.map(row => row.event_id);
            // Step 2: Get event details from events table based on event_id(s)
            const getEventsSql = 'SELECT * FROM event_details WHERE id IN (?)';
            connection.query(getEventsSql, [eventIds], (err, eventResults) => {
                if (err) {
                    return res.status(500).send(err);
                }
                if (eventResults.length > 0) {
                    const data = eventResults;
          // Decode the pass_enc value
                    for (let i = 0; i < data.length; i++) {
                        data[i].pass_enc = Buffer.from(data[i].pass_enc, 'base64').toString('ascii');
                        data[i].property_images_1=JSON.parse(data[i].property_images_1);
                        data[i].ammenities=JSON.parse(data[i].ammenities);
                    }

                    res.status(200).send({ status: 200, data: data });
                }
                else {
                    res.status(404).send({ status: 404, message: 'No event details found.'});
                }
            });
        } else {
            res.status(404).send({ status: 404, message: 'No events found for this user'});
        }
    });
};



exports.gethostedevents = (req, res) => {
    var connection = req.app.get('conn');
    const user_id = req.params.user_id;

    if (!user_id) {
        res.send({
            'status': 400,
            'data': 'User ID is required'
        });
    }

    const getEventIdsSql = 'SELECT * FROM event_details WHERE userid = ? and event_date > NOW()';
    connection.query(getEventIdsSql, [user_id], (err, hostedResults) => {
        if (err) {
            return res.status(400).send(err);
        }
        if (hostedResults.length > 0) {
            const data = hostedResults;
          // Decode the pass_enc value
            for (let i = 0; i < data.length; i++) {
                data[i].pass_enc = Buffer.from(data[i].pass_enc, 'base64').toString('ascii');
                data[i].property_images_1=JSON.parse(data[i].property_images_1);
                data[i].ammenities=JSON.parse(data[i].ammenities);
            }
            res.status(200).send({ status: 200, data: data });
        }
        else {
            res.status(404).send({ status: 404, message: 'No event details found.'});
        }
    });
};
// // Function to encrypt the image
// const encryptImage = (buffer) => {
//     const cipher = crypto.createCipher('aes-256-cbc', 'your_encryption_key');
//     let encrypted = cipher.update(buffer);
//     encrypted = Buffer.concat([encrypted, cipher.final()]);
//     return encrypted;
// };