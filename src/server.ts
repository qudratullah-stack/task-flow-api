import express from 'express'
import { DB } from './Config/db'
import dotenv from 'dotenv'
import signupRoute from './Routers/signupRouter'
const app = express()
const port = 8000
dotenv.config()
DB()
app.use(express.json())
app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use('/authRegistration',signupRoute)
app.listen(port, () => {
  console.log(`Your TaskFlow-saas api is start on port  ${port}`)
})
