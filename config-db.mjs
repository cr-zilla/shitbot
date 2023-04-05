// lowdb-setup.mjs
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function initLowDB() {
  // File path
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const file = join(__dirname, 'reminders.json');

  // Configure lowdb to write to JSONFile
  const adapter = new JSONFile(file);
  const db = new Low(adapter);

  // Read data from JSON file, this will set db.data content
  await db.read();

  // If reminders.json doesn't exist, db.data will be null
  // Use the code below to set default data
  if (!db.data) {
    db.data = { reminders: [] };
    await db.write();
  }

   // Remove old reminders
   db.data.reminders = db.data.reminders.filter((reminder) => {
    const now = Math.round(Date.now() / 1000);
    const isOldReminder = reminder.remindTime <= now;
    if (isOldReminder) {
      console.log(`Removing old reminder: ${JSON.stringify(reminder)}`);
    }
    return !isOldReminder;
  });

  // Save changes to the database
  await db.write();

  return db;
}
