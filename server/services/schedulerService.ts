import schedule from 'node-schedule';
import { db } from '@db';
import { questions, users } from '@db/schema';
import { eq } from 'drizzle-orm';
import { sendSMS, formatQuizMessage } from './smsService';

export function startDailyQuizScheduler() {
  // Schedule job to run every day at 10:00 AM
  schedule.scheduleJob('0 10 * * *', async () => {
    try {
      // Get all users with phone numbers and SMS notifications enabled
      const usersWithPhone = await db
        .select()
        .from(users)
        .where(eq(users.smsNotificationsEnabled, true));

      if (!usersWithPhone.length) {
        console.log('No users subscribed to SMS notifications');
        return;
      }

      // Get a random approved question
      const [randomQuestion] = await db
        .select()
        .from(questions)
        .where(eq(questions.approved, true))
        .orderBy(() => 'RANDOM()')
        .limit(1);

      if (!randomQuestion) {
        console.log('No questions available');
        return;
      }

      // Format the quiz message
      const message = await formatQuizMessage({
        question: randomQuestion.question,
        options: randomQuestion.options as string[],
        type: randomQuestion.type
      });

      // Send SMS to each subscribed user
      const smsPromises = usersWithPhone.map(user => 
        sendSMS(user.phoneNumber!, message)
          .catch(error => {
            console.error(`Failed to send SMS to ${user.phoneNumber}:`, error);
            return null;
          })
      );

      await Promise.all(smsPromises);
      console.log(`Daily quiz sent to ${usersWithPhone.length} users`);

      // Update last notification sent timestamp for users
      await db
        .update(users)
        .set({
          lastNotificationSent: new Date(),
        })
        .where(eq(users.smsNotificationsEnabled, true));

    } catch (error) {
      console.error('Error in daily quiz scheduler:', error);
    }
  });

  console.log('Daily quiz scheduler started');
}