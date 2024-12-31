import twilio from 'twilio';
import type { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMS(
  to: string,
  body: string
): Promise<MessageInstance> {
  try {
    const message = await client.messages.create({
      body,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    
    return message;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

export async function formatQuizMessage(question: {
  text: string;
  options?: string[];
}): Promise<string> {
  let message = `🌊 Daily Water Quiz!\n\n${question.text}`;
  
  if (question.options) {
    message += '\n\nOptions:';
    question.options.forEach((option, index) => {
      message += `\n${String.fromCharCode(65 + index)}) ${option}`;
    });
    message += '\n\nReply with the letter of your answer!';
  }
  
  return message;
}
