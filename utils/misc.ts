import crypto from "crypto";

export function generateRandomPostID(
  start: number = 6,
  middle: number = 12,
  end: number = 6
) {
  const key: number[] = [start, end, middle, end, start];
  const keyGen: string[] = [];

  for (let i = 0; i <= key.length; i++) {
    const randomSuffix = crypto.randomBytes(i).toString("hex");
    keyGen.push(randomSuffix);
  }
  return keyGen.join("-").slice(1);
}
