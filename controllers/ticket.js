exports.postticket = (req, res) => {
    var connection = req.app.get('conn');
    var passEncoded = Buffer.from(req.body.pass_enc).toString('base64')
    const ticket = {
        userid: req.body.userid,
        event_id: req.body.event_id,
        ticket_name: req.body.ticket_name,
        pass_enc: passEncoded,
    };

    const insertTicketSql = 'INSERT INTO ticket_details SET ?';
    connection.query(insertTicketSql, ticket, (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.send({
        'status': 200,
        'ticket':result
    });
        // res.status(200).send({ message: `Ticket added with ID: ${result.insertId}` });
    });
}

exports.getticket = (req, res) => {
    var connection = req.app.get('conn');
    const getTicketSql = 'SELECT * FROM ticket_details WHERE userid = ? AND event_id = ?';
    connection.query(getTicketSql, [req.params.user_id, req.params.event_id], (err, results) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length > 0) {
            const ticket = results;
            // console.log(ticket)
            // Decode the pass_enc value
            for (let i = 0; i < ticket.length; i++) {
                ticket[i].pass_enc = Buffer.from(ticket[i].pass_enc, 'base64').toString('ascii');
            }            
            res.send({
                'status': 200,
                'data': ticket
            });
        } else {
            res.send({ 'status': 300,
                'data': 'Ticket not found' });
        }
    });
}


// Route to delete records from tickets table
exports.deleteticket = (req, res) => {
    var connection = req.app.get('conn');
    // const { user_id, event_id, ticket_name } = req.body;

    if (!req.params.user_id || !req.params.event_id || !req.params.ticket_id) {
        return res.status(400).send({ message: 'User ID, Event ID, and Ticket ID are required' });
    }

    const deleteTicketSql = 'DELETE FROM ticket_details WHERE userid = ? AND event_id = ? AND id = ?';
    connection.query(deleteTicketSql, [req.params.user_id, req.params.event_id, req.params.ticket_id], (err, result) => {
        if (err) {
            return res.status(500).send(err);
        }
        if (result.affectedRows > 0) {
            res.status(200).send({ message: 'Ticket deleted successfully' });
        } else {
            res.status(404).send({ message: 'Ticket not found' });
        }
    });
};