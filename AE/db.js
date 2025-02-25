const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host : process.env.MYSQL_HOST || 'localhost',
  port : process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306, 
  user : process.env.MYSQL_USER ||'user',
  password :  process.env.MYSQL_PASSWORD ||'password',
  database : process.env.MYSQL_DATABASE || 'stat'

  

});

async function bodyParser(req) {
  let body = '';

  // Listen for data chunks
  for await (const chunk of req) {
    body += chunk.toString();
  }

  try {
    // Parse body if it's JSON
    return JSON.parse(body);
  } catch (error) {
    // If not JSON, return raw body
    return body;
  }
};
// Function to query the database
async function query(sql, params) {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(sql, params);
    return rows;  // Return query result
  } catch (err) {
    console.log("query error: ",err);
    throw err;  // Throw error if query fails
  } finally {
    if (conn) conn.release();  // Release connection back to the pool
  }
}

// Function to insert data into a table (example for users)
async function insertDataImpact(ip, duration, sessionid) {
  const sql = 'INSERT INTO vk_impact (ip,duration,sessionid) VALUES (?, ?, ?)';
  try {
    const result = await query(sql, [ip, duration, sessionid]);

    //If the result contains a BigInt (e.g., insertId), convert it to a string
    const response = {
      message: 'User created',
      id: result.insertId ? result.insertId.toString() : null  // Convert BigInt to string
    };

    return response;

  } catch (err) {
    console.log("Insert data error: ",err);
    throw err;
  }
}
async function updateDataImpact(ip, duration, sessionid) {
  const sql = 'UPDATE vk_impact SET duration = ? WHERE ip = ? AND sessionid = ?';
  //const sql = 'INSERT INTO vk_impact (ip,duration,sessionid) VALUES (?, ?, ?)';
  try {
    const result = await query(sql, [duration, ip, sessionid]);

    // Check if any rows were affected by the update
    const response = {
      message: result.affectedRows > 0 ? 'User updated' : 'No matching record found',
      rowsAffected: result.affectedRows
    };

    return response;

  } catch (err) {
    console.log("Update data error: ", err);
    throw err;
  }
}
async function insertDataAE(ip, duration, sessionid, status, objectname, objectid, scenename, sceneid, direction, location, runprogram, appid) {
  const sql = 'INSERT INTO ae_vk (ip, duration, sessionid, status, objectname, objectid, scenename, sceneid, direction, location, runprogram, appid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  try {
    const result = await query(sql, [ip, duration, sessionid, status, objectname, objectid, scenename, sceneid, direction, location, runprogram, appid]);

    //If the result contains a BigInt (e.g., insertId), convert it to a string
    const response = {
      message: 'User created',
      id: result.insertId ? result.insertId.toString() : null  // Convert BigInt to string
    };
    console.log("res",result);
    return response;

  } catch (err) {
    console.log("Insert data error: ",err);
    throw err;
  }
}
async function ipImpact(){

  return 'userIP';
}
module.exports = { insertDataImpact, updateDataImpact, insertDataAE, bodyParser, ipImpact };