import { connectDB } from '@repo/db'
import { Server } from 'http'
import configs from './app/configs'
import { app } from './app'

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
    console.log(`❌ Database connection failed ❌ `)
  }
}

console.log('a')

boostrap()
