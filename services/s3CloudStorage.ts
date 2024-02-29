import { S3 } from "aws-sdk";
import config from "../config";
import {
  createUniqueFileName,
  extractFileNameFromUrl,
} from "../utils/recurrents";
import AppError from "../utils/appError";

const awsS3 = new S3({
  accessKeyId: config.BUCKET_ACCESS,
  secretAccessKey: config.BUCKET_SECRET,
  region: config.BUCKET_REGION,
});

// Uploading to S3 using the aws-sdk version 2
export const s3UploadV2 = async (
  req: any,
  imgType: string,
  fileName: string
) => {
  // Get extension of file to be uploaded
  const ext = req.file.mimetype.split("/")[1];

  //  Create unique name for file
  const uniqueName = createUniqueFileName(
    req.file.originalname,
    ext,
    12,
    imgType
  );

  // Specify file path
  const pathName = `${imgType}/${uniqueName}`;

  // Extract exisiting name if it exists and specify it's path
  const existingName = fileName && extractFileNameFromUrl(fileName);
  const existingPathName = fileName && `${imgType}/${existingName}`;

  // Setting up params
  const params = {
    Bucket: config.BUCKET_NAME,
    Key: existingPathName || pathName,
    Body: req.file?.buffer,
    contentType: req.file?.mimetype,
  };

  // const result = await s3.send(new PutObjectCommand(params));

  //   Uploading the file
  try {
    const result = await awsS3.upload(params).promise();
    return result;
  } catch (err: any) {
    throw new AppError(err.message, 400);
  }
};

// Deleting from S3 bucket
export const s3DeleteV2 = async (fileName: string) => {
  const params = {
    Bucket: config.BUCKET_NAME,
    Key: fileName,
  };

  try {
    await awsS3.deleteObject(params).promise();
  } catch (err: any) {
    throw new AppError(err.message, 400);
  }
};
