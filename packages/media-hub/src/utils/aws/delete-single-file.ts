import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3Client } from '../../configs/aws.config'

export const deleteSingleFileFromS3 = async (key: string) => {
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    })
  )
}
