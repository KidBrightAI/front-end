// // AEdb/users.js
// const express = require('express');
// const router = express.Router();

// router.get('/users', (req, res) => {
//     // Example: Fetch users from a database or some source
//     const users = [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Doe' }];
//     res.json(users); // Send the users as a JSON response
// });

// module.exports = router;

// export default function (req, res) {
//     res.json([{ id: 1, name: "John Doe" }, { id: 2, name: "Jane Doe" }]);
//   }



// export default function (req, res) {
//     const users = [{ id: 1, name: "John Doe" }, { id: 2, name: "Jane Doe" }];
//     res.setHeader('Content-Type', 'application/json');
//     res.end(JSON.stringify(users)); // Send the JSON response
//   }

import { insertDataImpact, bodyParser } from './db';
/*const bodyParser = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';

    // Listen for data chunks
    req.on('data', chunk => {
      body += chunk.toString();
    });

    // Listen for the end of the data
    req.on('end', () => {
      try {
        // Parse body if it's JSON
        const parsedBody = JSON.parse(body);
        resolve(parsedBody);
      } catch (error) {
        // If not JSON, resolve with raw body
        resolve(body);
      }
    });

    // Listen for any errors
    req.on('error', error => {
      reject(error);
    });
  });
};*/
export default async function (req, res) {
    if (req.method === 'POST') {
      try {
        //const val = JSON.parse(req.body);
        //const { ip, duration, sessionid } = await req.json();
        //console.log(".................req..................");
        const bodyPayload = await bodyParser(req);
        //console.log('Body Payload:', bodyPayload);
        //console.log(".................req..................");
        //console.log(typeof(req));
        const result = await insertDataImpact(bodyPayload['ip'], bodyPayload['duration'], bodyPayload['sessionid']); // Insert into database
        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ message: 'User created', id: result.insertId }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        console.log(err);
        return res.end(JSON.stringify({ error: 'Error inserting user into database' }));
      }
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }
  }


// export default function (req, res) {
//     // Check if it's a GET request
//     if (req.method === 'GET') {
//       const users = [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Doe' }];
//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify(users));
//     } else {
//       // If it's not a GET request, respond with a 405 Method Not Allowed
//       res.writeHead(405, { 'Content-Type': 'text/plain' });
//       res.end('Method Not Allowed');
//     }
//   }