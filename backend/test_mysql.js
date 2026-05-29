const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306
    });
    console.log("SUCCESS: Connected to MySQL as root with empty password");
    await connection.end();
  } catch (error) {
    console.log("FAILED empty password:", error.message);
    try {
      const connection2 = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password',
        port: 3306
      });
      console.log("SUCCESS: Connected to MySQL as root with 'password'");
      await connection2.end();
    } catch (error2) {
      console.log("FAILED 'password':", error2.message);
      try {
        const connection3 = await mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: 'root',
          port: 3306
        });
        console.log("SUCCESS: Connected to MySQL as root with 'root'");
        await connection3.end();
      } catch (error3) {
        console.log("FAILED 'root':", error3.message);
        console.log("ALL TESTS FAILED.");
      }
    }
  }
}

testConnection();
