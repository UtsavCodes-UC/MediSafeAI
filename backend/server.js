const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
const buildDrugList = require("./utils/buildDrugList");
const { initializeFuzzy } = require("./utils/fuzzyMatch");
const interactionRoutes = require("./routes/interactionRoutes");

dotenv.config();

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB().then(async () => {
  const drugList = await buildDrugList();
  initializeFuzzy(drugList);

  console.log("Fuzzy search initialized");
  console.log("Drug Map Sample:", Object.entries(drugList).slice(0, 100));
});

app.get("/", (req, res) => {
  res.send("MediSafe AI Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use("/api/interactions", interactionRoutes);