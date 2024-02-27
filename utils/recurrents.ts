import crypto from "crypto";
import slugify from "slugify";

export const slugifyString = (text: string) => {
  const result = slugify(text, { lower: true, trim: true });
  return result;
};

export const createUniqueFileName = (
  name: string,
  ext: string,
  byte: number = 12,
  imgType: string
) => {
  const hash = crypto.randomBytes(byte).toString("hex");

  const avatarName = `img-${imgType}-${hash}-${slugifyString(
    name
  )}-${Date.now()}.${ext}`;
  return avatarName;
};
