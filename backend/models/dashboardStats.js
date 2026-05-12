const mongoose = require("mongoose");

const dashboardStatsSchema = new mongoose.Schema(
    {
        items: {
            type: [String],
            required: true,
        },

        severity: {
            type: String,
            enum: ["Low", "Medium", "High"],
            required: true,
        },

        score: {
            type: Number,
            required: true,
        },

        interactionCount: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "DashboardStats",
    dashboardStatsSchema
);