exports.getcallbacks = (req, res) => {
    var connection = req.app.get('conn');
    const orderId = req.params.order_id
    const callback = req.body;

    if (!callback) {
        return res.status(400).send({ data: 'Callback data is required' });
    }
    const getIdSql = 'SELECT id FROM pre_orders WHERE orderid = ?';
    connection.query(getIdSql, [orderId], (err, results) => {
    if (err) {
        return res.status(500).send(err);
    }
    if (results.length === 0) {
        return res.status(404).send({ data: 'Order not found' });
    }

    const callbackId = results[0].id;
    const responseStatus = callback["payment_result"]["response_status"]
    
    if (responseStatus === 'A') {
        var isPaidStatus = 'paid'
    } else {
        var isPaidStatus = 'failed'
    }

    const updateCallbackSql = 'UPDATE pre_orders SET is_paid = ?, callback_response = ? WHERE id = ?';
    console.log(updateCallbackSql)
    connection.query(updateCallbackSql, [isPaidStatus, JSON.stringify(callback), callbackId], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows > 0) {
            res.status(200).send({ data: 'Callback data updated successfully' });
        } else {
            res.status(404).send({ data: 'Failed to update callback data' });
        }
        });
    });
};