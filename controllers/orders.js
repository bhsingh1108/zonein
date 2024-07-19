exports.getorders = (req, res) => {
    var connection = req.app.get('conn');
    const orderId = req.params.orderid
    
    if (!orderId) {
        return res.status(400).send({ data: 'order id is required' });
    }
    const getIdSql = 'SELECT id, userid, eventid, ticketid, orderid, token, amount, currency, is_paid FROM pre_orders WHERE orderid = ?';
    connection.query(getIdSql, [orderId], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length > 0) {
            console.log(results)
            res.send({
                'status': 200,
                'data': results
            });
        } else {
            res.send({
                'status': 300,
                'data': 'Order not found'
            });
        }
    });
};