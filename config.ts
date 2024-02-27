import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: "./config.env" });

interface ENV {
  DATABASE: string;
  DATABASE_PASSWORD: string;

  PORT: number;
  NODE_ENV: string;

  APP_NAME: string;
  APP_EMAIL_FROM: string;
  APP_URL: string;
  //   APP_SERVER_URL: string;

  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;

  EMAIL_USERNAME: string;
  EMAIL_PASSWORD: string;
  EMAIL_PORT: number;
  EMAIL_HOST: string;

  BREVO_HOST: string;
  BREVO_PORT: number;
  BREVO_USERNAME: string;
  BREVO_PASSWORD: string;
  BREVO_KEY: string;

  BUCKET_NAME: string;
  BUCKET_REGION: string;
  BUCKET_SECRET: string;
  BUCKET_ACCESS: string;
}

const Config = (): ENV => {
  return {
    DATABASE: process.env.DATABASE as string,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD as string,

    PORT: +(process.env.PORT as string),
    NODE_ENV: process.env.NODE_ENV as string,

    APP_NAME: process.env.APP_NAME as string,
    APP_EMAIL_FROM: process.env.APP_EMAIL_FROM as string,
    APP_URL: process.env.APP_URL as string,
    // APP_SERVER_URL: process.env.APP_SERVER_URL,

    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as string,

    EMAIL_USERNAME: process.env.EMAIL_USERNAME as string,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
    EMAIL_PORT: +(process.env.EMAIL_PORT as string),
    EMAIL_HOST: process.env.EMAIL_HOST as string,

    BREVO_HOST: process.env.BREVO_HOST as string,
    BREVO_PORT: +(process.env.BREVO_PORT as string),
    BREVO_USERNAME: process.env.BREVO_USERNAME as string,
    BREVO_PASSWORD: process.env.BREVO_PASSWORD as string,
    BREVO_KEY: process.env.BREVO_KEY as string,

    BUCKET_NAME: process.env.BUCKET_NAME as string,
    BUCKET_REGION: process.env.BUCKET_REGION as string,
    BUCKET_SECRET: process.env.BUCKET_SECRET as string,
    BUCKET_ACCESS: process.env.BUCKET_ACCESS as string,
  };
};

const sanitizeConfig = (config: ENV): ENV => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key} in config.env`);
    }
  }

  return config;
};

const config = sanitizeConfig(Config());

export default config;
