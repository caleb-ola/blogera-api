import crypto from "crypto";

function generateRandomUsername(baseUsername: string, length: number = 6) {
  const randomSuffix = crypto.randomBytes(length).toString("hex");
  return `${baseUsername}${randomSuffix}`;
}

export default generateRandomUsername;
