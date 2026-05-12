const express = require("express");

const router = express.Router();

const {
    saveDashboardStats,
    getDashboardStats,
} = require("../controllers/dashboardController");


// SAVE
router.post("/save", saveDashboardStats);

// GET
router.get("/", getDashboardStats);

module.exports = router;