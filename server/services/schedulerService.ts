import schedule from 'node-schedule';
import { db } from '@db';
import { questions, users } from '@db/schema';
import { eq } from 'drizzle-orm';
import { sendSMS, formatQuizMessage } from './smsService';

export function startDailyQuizScheduler() {
  // Check every minute for users who should receive quizzes
  schedule.scheduleJob('* * * * *', async () => {
    try {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Get all users with notifications enabled and whose preferred time matches current time
      const usersToNotify = await db
        .select()
        .from(users)
        .where(eq(users.smsNotificationsEnabled, true))
        .where(eq(users.preferredQuizTime, currentTime));

      if (!usersToNotify.length) {
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

      // Send SMS to each user who should receive it now
      const smsPromises = usersToNotify.map(user => 
        sendSMS(user.phoneNumber!, message)
          .catch(error => {
            console.error(`Failed to send SMS to ${user.phoneNumber}:`, error);
            return null;
          })
      );

      await Promise.all(smsPromises);
      console.log(`Daily quiz sent to ${usersToNotify.length} users at ${currentTime}`);

      // Update last notification sent timestamp for notified users
      await db
        .update(users)
        .set({
          lastNotificationSent: now,
        })
        .where(eq(users.id, usersToNotify.map(user => user.id)));

    } catch (error) {
      console.error('Error in daily quiz scheduler:', error);
    }
  });

  console.log('Daily quiz scheduler started with personalized timing');
}