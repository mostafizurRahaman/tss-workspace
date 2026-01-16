import { connectDB } from '@repo/db'
import { Server } from 'http'
import configs from './app/configs'
import app from './app'

let server: Server
//  boostrap function :
const boostrap = async () => {
  try {
    await connectDB(configs.databaseUrl)
    console.log(`✅ Database connected  successfully!`)

    // server listen :
    server = app.listen(configs.port, () => {
      console.log(`🧑‍🚀🚀 Server is running on ${configs.port}`)
    })
  } catch (err) {
    console.log(err)
    console.log(`❌ Database connection failed ❌ `)
  }
}

// bootstrap the project
boostrap()

// handle unhandled rejection
process.on('unhandledRejection', (reason) => {
  console.log(`UNHANDELED REJECTION : REASON ->`, reason)
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }

  process.exit(1)
})

// handled uncaughtException:
process.on('uncaughtException', (error) => {
  console.log('uncaughtException: ERROR', error.message)
  process.exit(1)
})
