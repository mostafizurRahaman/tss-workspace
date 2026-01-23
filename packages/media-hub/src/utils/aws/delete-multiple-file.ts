import { DeleteObjectsCommand, waitUntilObjectNotExists } from '@aws-sdk/client-s3'
import { s3Client } from '../../configs/aws.config'

export const deleteMultipleFilesFromS3 = async (keys: string[]) => {
  const { Deleted } = await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME as string,
      Delete: {
        Objects: keys.map((k) => ({ Key: k })),
      },
    })
  )

  for (const key in keys) {
    await waitUntilObjectNotExists(
      { client: s3Client, maxWaitTime: 10 },
      { Bucket: process.env.AWS_S3_BUCKET_NAME as string, Key: key }
    )
  }

  console.log(`Successfully deleted ${Deleted?.length} objects from S3 bucket. Deleted objects:`)
}
