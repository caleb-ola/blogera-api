import nodemailer from "nodemailer";
import config from "../config";
import pug from "pug";
import { convert } from "html-to-text";

interface UserType {
  email: string;
  name: string;
  url: string;
}

export default class Email {
  public to: string;
  public from: string;
  public firstname: string;
  public url: string;

  constructor(user: any, url: string) {
    this.to = user.email;
    this.from = `Blogera <${config.APP_EMAIL_FROM}>`;
    this.url = url;
    this.firstname = user.name.split(" ")[0];
  }

  newTransport() {
    // if (config.NODE_ENV === "production") {
    return nodemailer.createTransport({
      host: config.BREVO_HOST,
      port: config.BREVO_PORT,
      auth: {
        user: config.BREVO_USERNAME,
        pass: config.BREVO_KEY,
      },
    });
    // }
    // return nodemailer.createTransport({
    //   host: config.EMAIL_HOST,
    //   port: config.EMAIL_PORT * 1,
    //   auth: {
    //     user: config.EMAIL_USERNAME,
    //     pass: config.EMAIL_PASSWORD,
    //   },
    //   // Activate in gmail "less secure app" option
    // });
  }

  // Send the actual mail
  async send(template: string, subject: string) {
    // 1.Render HTML based on pug templates
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstname: this.firstname,
      url: this.url,
      subject,
    });

    // 2. Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    // 3. Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendEmailVerification() {
    await this.send("verify", "Confirm Your Blogera Account ");
  }

  async sendWelcomeMail() {
    await this.send(
      "welcome",
      "🚀 Welcome Aboard: Unleash Your Blogging Brilliance with Blogera!"
    );
  }

  async sendForgotPassword() {
    await this.send(
      "forgotPassword",
      "🔐 Oops! Can't Remember Your Password? We've Got You Covered!"
    );
  }

  async sendResetPasswordSuccess() {
    await this.send(
      "passwordResetSuccess",
      "🔑 Your Blogera Account is Secure"
    );
  }

  async sendLoginSuccess() {
    await this.send("login", "🎉 You've Successfully Logged In to Blogera!");
  }
}
