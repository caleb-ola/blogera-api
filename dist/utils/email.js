"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const pug_1 = __importDefault(require("pug"));
const html_to_text_1 = require("html-to-text");
class Email {
    constructor(user, url) {
        this.to = user.email;
        this.from = `Blogera <${config_1.default.APP_EMAIL_FROM}>`;
        this.url = url;
        this.firstname = user.name.split(" ")[0];
    }
    newTransport() {
        // if (config.NODE_ENV === "production") {
        return nodemailer_1.default.createTransport({
            host: config_1.default.BREVO_HOST,
            port: config_1.default.BREVO_PORT,
            auth: {
                user: config_1.default.BREVO_USERNAME,
                pass: config_1.default.BREVO_KEY,
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
    send(template, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1.Render HTML based on pug templates
            const html = pug_1.default.renderFile(`${__dirname}/../views/email/${template}.pug`, {
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
                text: (0, html_to_text_1.convert)(html),
            };
            // 3. Create a transport and send email
            yield this.newTransport().sendMail(mailOptions);
        });
    }
    sendEmailVerification() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send("verify", "Confirm Your Blogera Account ");
        });
    }
    sendWelcomeMail() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send("welcome", "🚀 Welcome Aboard: Unleash Your Blogging Brilliance with Blogera!");
        });
    }
    sendForgotPassword() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send("forgotPassword", "🔐 Oops! Can't Remember Your Password? We've Got You Covered!");
        });
    }
    sendResetPasswordSuccess() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send("passwordResetSuccess", "🔑 Your Blogera Account is Secure");
        });
    }
    sendLoginSuccess() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send("login", "🎉 You've Successfully Logged In to Blogera!");
        });
    }
}
exports.default = Email;
