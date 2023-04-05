const dotenv = require('dotenv');
dotenv.config();
const IS_RUNNING_LOCALLY = process.env.IS_RUNNING_LOCALLY.toLowerCase() === 'true';

// TEST VALUES FOR MORON GROUP
const TIERS_TEST = [
    {
        name: "Gold",
        emoji: "🥇",
        minLiq: 30000,
        maxLiq: 99999999999999999,
        topicId: "2"
    },
    {
        name: "Silver",
        emoji: "🥈",
        minLiq: 10000,
        maxLiq: 30000,
        topicId: "4"
    },
    {
        name: "Bronze",
        emoji: "🥉",
        minLiq: 2000,
        maxLiq: 10000,
        topicId: "6"
    }
];

// LIVE VALUE FOR HQ GROUP
const TIERS_LIVE = [
    {   
        name: "Gold",
        emoji: "🥇",
        minLiq: 30000,
        maxLiq: 99999999999999999,
        topicId: "308"
    },
    {
        name: "Silver",
        emoji: "🥈",
        minLiq: 10000,
        maxLiq: 30000,
        topicId: "370"
    },
    {
        name: "Bronze",
        emoji: "🥉",
        minLiq: 2000,
        maxLiq: 10000,
        topicId: "372"
    }
];

TIERS = IS_RUNNING_LOCALLY ? TIERS_TEST : TIERS_LIVE

module.exports = { TIERS };
