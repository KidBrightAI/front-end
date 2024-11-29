
import { insertDataAE, bodyParser } from './db';

export default async function (req, res) {
    if (req.method === 'POST') {
      try {
        
        const bodyPayload = await bodyParser(req);

        const result = await insertDataAE(bodyPayload['ip'], bodyPayload['duration'], bodyPayload['sessionid'],bodyPayload['status'], 
        bodyPayload['objectname'], bodyPayload['objectid'],bodyPayload['scenename'], bodyPayload['sceneid'], 
        bodyPayload['direction'], bodyPayload['location'], bodyPayload['runprogram'], bodyPayload['appid']); // Insert into database

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
