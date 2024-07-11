exports.postusers= (req, res) => {
    var connection = req.app.get('conn');
    const user = {
        username: req.body.first_name +' '+ req.body.last_name?req.body.last_name:'',
        mobile: req.body.phone_number,
        email: req.body.email,
        passport_no: req.body.passport_no?req.body.passport_no:''
    };
    
    const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
    connection.query(checkEmailSql, [user.email], (err, results) => {
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

    const getUserSql = 'SELECT id FROM users WHERE email = ? AND passport_no = ?';
    connection.query(getUserSql, [user.email, user.passport_no], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length > 0) {
            const userId = results[0].id;
            // res.status(200).send({ message: `User added with ID: ${userId}` });
            res.send({
                'status': 200,
                'user id': userId
            });
        } else {
            res.status(500).send({ message: 'User added but failed to retrieve ID' });
        }
    });
    });
});
};

// // Function to encrypt the image
// const encryptImage = (buffer) => {
//     const cipher = crypto.createCipher('aes-256-cbc', 'your_encryption_key');
//     let encrypted = cipher.update(buffer);
//     encrypted = Buffer.concat([encrypted, cipher.final()]);
//     return encrypted;
// };