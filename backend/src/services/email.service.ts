export class EmailService {
  async sendEnrollmentConfirmation(email: string, courseName: string) {
    console.log(`[EMAIL] Enrollment Confirmation sent to ${email} for ${courseName}`);
    return { success: true };
  }

  async sendCoursePublished(email: string, courseName: string) {
    console.log(`[EMAIL] Course Published notification sent to ${email}`);
    return { success: true };
  }

  async sendWelcome(email: string, name: string) {
    console.log(`[EMAIL] Welcome email sent to ${email}`);
    return { success: true };
  }
}

export const emailService = new EmailService();