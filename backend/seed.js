process.env.OPENSSL_CONF = '';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Interaction = require("./models/interactions.js");
const data = require("./data/interactions.json");

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Interaction.deleteMany();
  await Interaction.insertMany(data);

  console.log("Data Seeded");
  process.exit();
});
