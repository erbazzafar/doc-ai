const mongoose = require("mongoose");

let connection = {}; // Store connection state

async function dbConnect() {
  if (connection.isConnected) {
    console.log("Already connected to the database");
    return;
  }

  try {
    const db = await mongoose.connect(
      "mongodb+srv://erbazzi:timbuk2U_@docluster.a3ciybs.mongodb.net/"
    );

    connection.isConnected = db.connections[0].readyState;

    console.log("DATABASE CONNECTED SUCCESSFULLY!!");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

module.exports = dbConnect;