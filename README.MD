# ShitBot
A Telegram bot for monitoring recently added pairs on Uniswap using their Subgraph, then sending the pair details and an assessment of the contract/token security to Telegram. Users can also create reminders to check up on a pair in future.

# Requirements
Node.js v16 or higher  
Etherscan API key  
Telegram Bot credentials from Botfather

# Installation
Install node modules
`npm install

Create a file called `reminders.json` in the root directory and add this stub array:
```{
    "reminders": []
}```

# Using ShitBot with PM2
To run the Shitbot app:
`pm2 start app.js --name "shitbot"`

(By default, PM2 will restart your script if it crashes or if the server reboots)

## Starting use the ecosystem script
`pm2 start app-pm2.config.js`

## To see all managed processes
`pm2 list`

## To see the logs
`pm2 logs shitbot`

## To stop the script
`pm2 stop shitbot`

----

# BOTFATHER MENU COMMANDS
Your bot will need the following command to view/delete reminders
`reminders - View and remove reminders`

# IF RUNNING ON A SERVER
To ensure pm2 can access the project's own .env file in production, use this command:
`pm2 start app.js --env=.env`

# REQUIRED ENV VARS
IS_RUNNING_LOCALLY (true/false, setting false enables a wider Uniswap Tiers query)  
TELEGRAM_BOT_TOKEN (For your TG bot, from BotFather)  
TELEGRAM_CHAT_ID (The ID of your main TG group)  
TELEGRAM_POLLING_ON (true)  
TELEGRAM_ACTIVITY_TOPIC (The subtopic used for logging activity messages)  
ETHERSCAN_API_KEY (Register for a free account to get your key)  