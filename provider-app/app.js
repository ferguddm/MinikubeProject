const express = require('express');
const amqp = require('amqplib/callback_api');
const mysql = require('mysql');

const app = express();

app.use(express.json());

const db = mysql.createConnection({
  host: 'mysql-service',
  user: 'root',
  password: 'password',
  database: 'devops-akademi'
});

const RABBITMQ_URL = 'amqp://rabbitmq-service:5672';

app.get("/", (req, res) => {
    res.send("Provider is available");
});

function startRabbitMQConsumer() {
    amqp.connect(RABBITMQ_URL, function(error0, connection) {
        if (error0) {
            throw error0;
        }
        connection.createChannel(function(error1, channel) {
            if (error1) {
                throw error1;
            }

            const queue = 'messageQueue';

            channel.assertQueue(queue, {
                durable: false
            });

            channel.consume(queue, function(msg) {
                const messageData = JSON.parse(msg.content);
                const query = 'INSERT INTO messages VALUES ?';

                db.query(query, messageData, (err, result) => {
                    if (err) throw err;
                    console.log(" [x] Message saved to DB", result);
                });
            }, {
                noAck: true
            });
        });
    });
}


app.listen(3001, () => {
    console.log("Server is running on port 3001");
    startRabbitMQConsumer();
});
