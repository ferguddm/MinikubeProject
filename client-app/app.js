"use strict";
const express = require("express");
const amqp = require('amqplib/callback_api');
const app = express();

app.use(express.json()); 


const RABBITMQ_URL = 'amqp://rabbitmq-service:5672';

app.get("/", (req, res) => {
  res.status(200).send('Client is available');
});
  
app.post('/send-message', (req, res) => {
  amqp.connect(RABBITMQ_URL, function(error0, connection) {
      if (error0) {
          res.status(500).json({ error: error0.message });
          return;
      }
      connection.createChannel(function(error1, channel) {
          if (error1) {
              res.status(500).json({ error: error1.message });
              return;
          }

          const queue = 'messageQueue';
          const msg = req.body;

          channel.assertQueue(queue, {
              durable: false
          });
  
          channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));
          res.status(200).send("Mesaj gönderildi.");
      });
  
      setTimeout(function() {
          connection.close();
      }, 500);
  });
}); 

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});



// "use strict";
// const amqp =  require('amqplib');
// const { Pool } = require('pg');

// const rabbitmq_url = 'amqp://guest:guest@rabbitmq:5672';
// const queue = 'messages';

// const pool = new Pool({
//     user: 'postgres_db',
//     host: 'postgres_db',
//     database: 'db',
//     password: '123',
//     port: 5432,
// });


// async function connect_rabbitMQ(){
//     // buraya setTimeout verdim çünkü henüz connection oluşmadan işlem yapmaya çalıştığından hata aldım
//     await new Promise((ok) => setTimeout(ok, 1000*10));
//     const connection = await amqp.connect(rabbitmq_url);
//     const channel = await connection.createChannel();
//     await channel.assertQueue(queue);

//     channel.consume(queue, async message => {
//         const content = message.content;
//         console.log('Alınan mesaj: ', content);
//         try {
//             const queryText = 'INSERT INTO messages(content) VALUES($1) RETURNING *';
//             const res = await pool.query(queryText, [content]);
//             console.log('Mesaj veritabanına kaydedildi:', res.rows[0]);
//             // veritabanında mesajlar tablosu oluşturulmuştu halihazırda
//         } catch (error){
//             console.error('Mesaj veritabanına kaydedilirken hata oluştu:', error);
//         }
//     }, {noAck: true});
// }

// connect_rabbitMQ();  


// const fetch = require('node-fetch');

// const PROVIDER_API = 'http://provider-service:3001/send';

// const message = { text: 'Merhaba, RabbitMQ!' };
// fetch(PROVIDER_API, {
//     method: 'POST',
//     body: JSON.stringify(message),
//     headers: { 'Content-Type': 'application/json' },
// })
// .then(response => response.text())
// .then(text => console.log(text))
// .catch(error => console.error('Hata:', error));
