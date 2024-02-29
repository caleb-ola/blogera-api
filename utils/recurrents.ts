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

export const extractFileNameFromUrl = (url: string) => {
  // Split the url into an array
  const urlParts = url.split("/");

  // Get the filename from the url
  const fileName = urlParts[urlParts.length - 1];

  // Remove addtional query parameters and suffixes
  const removedFileNameQueries = fileName.split("?")[0];

  // Remove addtional suffixes
  // const removedFileNameSuffixes = fileName.split("-")[0];

  return removedFileNameQueries;
};
