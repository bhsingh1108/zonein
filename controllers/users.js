exports.postusers= (req, res) => {
    var connection = req.app.get('conn');
    const user = {
        username: req.body.first_name + req.body.last_name,
        mobile: req.body.phone_number,
        email: req.body.email,
        passport_no: req.body.passport_no
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
        res.send(`User added with ID: ${result.insertId}`);
    });
});
};