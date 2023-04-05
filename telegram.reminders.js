const formatDistanceToNow = require('date-fns/formatDistanceToNow');
const { addMinutes, addHours, addDays, addWeeks } = require('date-fns');
const { bot } = require('./config-telegram.bot.js');
let db;

// Self-invoking async function to initalise a connection to a LowDB database.
(async () => {
    const { initLowDB } = await import('./config-db.mjs');
    db = await initLowDB();
})();

function addReminder(chatId, remindTime, requestingUser, originalMessageId, tokenSymbol, pairId) {
    if (!db) {
        console.error('LowDB not initialized yet');
        return;
    }
    db.data.reminders.push({
        chatId: chatId,
        remindTime: remindTime,
        requestingUser: requestingUser,
        originalMessageId: originalMessageId,
        tokenSymbol: tokenSymbol,
        pairId: pairId,
    });
    db.write();
}

async function checkReminders() {
    if (!db) {
        console.error('LowDB not initialized yet');
        return;
    }

    const now = Math.floor(Date.now() / 1000);
    const reminders = db.data.reminders;

    for (let index = reminders.length - 1; index >= 0; index--) {
        const reminder = reminders[index];
        if (now >= reminder.remindTime) {
            const message = `@${reminder.requestingUser} Reminder: Check up on ${reminder.tokenSymbol}!\nhttps://dexscreener.com/ethereum/${reminder.pairId}\n`;
            // Send the reminder message
            await bot.sendMessage(reminder.chatId, message, {
                reply_to_message_id: reminder.originalMessageId,
                disable_web_page_preview: true,
            });
            // Remove the reminder
            reminders.splice(index, 1);
            await db.write();
        }
    }
}

// Check for reminders every minute
setInterval(checkReminders, 60 * 1000);

function getRemindTime(time) {
    const now = new Date();
    let remindTime;

    switch (time.slice(-1)) {
        case 'm':
            remindTime = addMinutes(now, parseInt(time.slice(0, -1)));
            break;
        case 'h':
            remindTime = addHours(now, parseInt(time.slice(0, -1)));
            break;
        case 'd':
            remindTime = addDays(now, parseInt(time.slice(0, -1)));
            break;
        case 'w':
            remindTime = addWeeks(now, parseInt(time.slice(0, -1)));
            break;
        default:
            remindTime = addHours(now, 1); // default to 1 hour
            break;
    }

    return Math.round(remindTime.getTime() / 1000);
}

const fs = require('fs');
let reminders = readRemindersFromFile();

// Handler for the "/reminders" command
bot.onText(/\/reminders/, async (msg) => {
    const user = msg.from.username;
    const chatId = msg.chat.id;
    const topicId = msg.message_thread_id;
    const remindersForChat = readRemindersFromFile().filter((reminder) => reminder.requestingUser === user);

    if (remindersForChat.length === 0) {
        bot.sendMessage(chatId, 'You have no reminders set, ' + user, { message_thread_id: topicId });
    } else {
        const options = remindersForChat.map((reminder, index) => ({
            text: `${index + 1}. ${reminder.tokenSymbol} - ${formatDistanceToNow(reminder.remindTime * 1000, { addSuffix: true })}`,
            callback_data: `"cancel${index}"`,
        }));
        const keyboard = {
            inline_keyboard: options.map((option) => [option]), // wrap each option in a separate array
        };

        bot.sendMessage(chatId, '💁‍♀️ Your reminders:\n(Click any reminder to cancel it)\n', { message_thread_id: topicId, reply_markup: JSON.stringify(keyboard) });
    }
});

// Function to read the reminder list from the file
function readRemindersFromFile() {
    const fs = require('fs');
    const reminders = JSON.parse(fs.readFileSync('reminders.json', 'utf8'));
    return reminders.reminders;
}

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const topicId = callbackQuery.message.reply_to_message.message_thread_id;
    const data = callbackQuery.data;
    const username = callbackQuery.from.username;

    if (data.startsWith('"cancel')) {
        const reminderIndex = parseInt(data.substring(7));
        const reminders = readRemindersFromFile();
        const remindersForUser = reminders.filter((reminder) => reminder.requestingUser === username);
        const reminder = remindersForUser[reminderIndex];

        if (!reminder) {
            bot.sendMessage(chatId, 'Invalid reminder. Fook knows pal.', { message_thread_id: topicId });
            return;
        }

        const updatedReminders = reminders.filter((r) => r !== reminder);
        const updatedData = {
            reminders: updatedReminders
        };

        fs.writeFile('reminders.json', JSON.stringify(updatedData), (err) => {
            if (err) {
                console.error(err);
                bot.sendMessage(chatId, 'Failed to delete reminder. Moron.', { message_thread_id: topicId });
                return;
            }
            bot.sendMessage(chatId, `Your ${reminder.tokenSymbol} reminder has been cancelled.`, { message_thread_id: topicId });
        });
    }

});

module.exports = {
    addReminder,
    getRemindTime,
}