import mongoose from 'mongoose'

export const connectDB = async (uri: string) => {
  try {
    await mongoose.connect(uri)
  } catch (err) {
    console.log(`Database connection failed!`)
  }
}
