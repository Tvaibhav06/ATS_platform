import prisma from './db';

type NotificationType = 
  | 'APPLICATION_CONFIRMATION'
  | 'SHORTLISTED'
  | 'INTERVIEW_INVITATION'
  | 'ASSESSMENT_LINK'
  | 'OFFER_ISSUED'
  | 'REJECTION'
  | 'JOINING_INSTRUCTIONS'
  | 'PROFILE_COMPLETION'
  | 'APPLICATION_STATUS_CHANGE';

export async function sendNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  sendEmail: boolean = true,
  emailContext?: any
) {
  try {
    // 1. Create In-App Notification Record
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body
      }
    });

    // 2. Mock Email / Calendar Dispatch
    if (sendEmail) {
      console.log(`\n--- [MOCK EMAIL DISPATCH] ---`);
      console.log(`To User ID : ${userId}`);
      console.log(`Type       : ${type}`);
      console.log(`Subject    : ${title}`);
      console.log(`Body       : ${body}`);
      
      if (emailContext?.meetingLink) {
        console.log(`[MOCK CALENDAR INVITE ATTACHED] -> ${emailContext.meetingLink}`);
      }
      if (emailContext?.offerPdf) {
        console.log(`[MOCK PDF ATTACHMENT] -> OfferLetter.pdf`);
      }
      
      console.log(`-----------------------------\n`);
    }

    return notification;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw error;
  }
}
