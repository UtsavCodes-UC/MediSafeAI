const Interaction = require("../models/interactions.js");
const normalize = require("../utils/normalize");
const { ageRisk } = require("../config/ageConfig.js");
const generateAIExplanation = require("../utils/aiService");
const { findBestMatch } = require("../utils/fuzzyMatch");
const DashboardStats = require("../models/dashboardStats");

const checkInteractions = async (req, res) => {
    try {
        const { items, user } = req.body;

        const normalizedItems = items.map(item =>
            findBestMatch(item.toLowerCase().trim())
        );

        let results = [];

        for (let i = 0; i < normalizedItems.length; i++) {
            for (let j = i + 1; j < normalizedItems.length; j++) {

                const item1 = normalizedItems[i];
                const item2 = normalizedItems[j];

                const interaction = await Interaction.findOne({
                    $or: [
                        {
                            $and: [
                                {
                                    $or: [
                                        { itemA: new RegExp(`^${item1}$`, "i") },
                                        { itemA_synonyms: { $in: [item1] } }
                                    ]
                                },
                                {
                                    $or: [
                                        { itemB: new RegExp(`^${item2}$`, "i") },
                                        { itemB_synonyms: { $in: [item2] } }
                                    ]
                                }
                            ]
                        },
                        {
                            $and: [
                                {
                                    $or: [
                                        { itemA: new RegExp(`^${item2}$`, "i") },
                                        { itemA_synonyms: { $in: [item2] } }
                                    ]
                                },
                                {
                                    $or: [
                                        { itemB: new RegExp(`^${item1}$`, "i") },
                                        { itemB_synonyms: { $in: [item1] } }
                                    ]
                                }
                            ]
                        }
                    ]
                });

                if (interaction) {
                    let score = interaction.baseScore;

                    // Personalization
                    ageRisk.forEach(rule => {
                        if (user.age >= rule.min) {
                            score += rule.score;
                        }
                    });

                    if (interaction.riskFactors && user.conditions) {
                        user.conditions.forEach((condition) => {
                            interaction.riskFactors.forEach((risk) => {
                                if (condition.toLowerCase() === risk.condition.toLowerCase()) {
                                    score += risk.extraScore;
                                }
                            });
                        });
                    }

                    const aiExplanation = await generateAIExplanation(interaction, user);

                    results.push({
                        itemA: interaction.itemA,
                        itemB: interaction.itemB,
                        severity: interaction.severity,
                        baseScore: interaction.baseScore,
                        personalizedScore: score,
                        effects: interaction.effects,
                        recommendation: interaction.recommendation,
                        aiExplanation: aiExplanation
                    });

                    await DashboardStats.create({
                        items: [
                            interaction.itemA,
                            interaction.itemB
                        ],

                        severity:
                            score >= 9
                                ? "High"
                                : score >= 5
                                    ? "Medium"
                                    : "Low",

                        score,
                    });
                }
            }
        }

        res.json({ interactions: results });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { checkInteractions };