const DashboardStats = require("../models/dashboardStats");


// SAVE DASHBOARD DATA
const saveDashboardStats = async (req, res) => {
    try {
        const { items, severity, score } = req.body;

        const stats = await DashboardStats.create({
            items,
            severity,
            score,
        });

        res.status(201).json(stats);

    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
};


// GET DASHBOARD DATA
const getDashboardStats = async (req, res) => {
    try {

        const totalChecks = await DashboardStats.countDocuments();

        const highRiskAlerts =
            await DashboardStats.countDocuments({
                severity: "High",
            });

        const lowCount =
            await DashboardStats.countDocuments({
                severity: "Low",
            });

        const mediumCount =
            await DashboardStats.countDocuments({
                severity: "Medium",
            });

        const highCount =
            await DashboardStats.countDocuments({
                severity: "High",
            });

        const recentActivity =
            await DashboardStats.find()
                .sort({ createdAt: -1 })
                .limit(5);

        res.json({
            totalChecks,

            highRiskAlerts,

            pieData: [
                {
                    name: "Low",
                    value: lowCount,
                    color: "hsl(150,50%,45%)",
                },
                {
                    name: "Medium",
                    value: mediumCount,
                    color: "hsl(40,85%,55%)",
                },
                {
                    name: "High",
                    value: highCount,
                    color: "hsl(0,72%,55%)",
                },
            ],

            recentActivity,
        });

    } catch (err) {
        res.status(500).json({
            error: err.message,
        });
    }
};

module.exports = {
    saveDashboardStats,
    getDashboardStats,
};