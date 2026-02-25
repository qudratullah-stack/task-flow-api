import express from 'express'
import { DB } from './Config/db'
import dotenv from 'dotenv'
const app = express()
const port = process.env.PORT || 3000
dotenv.config()
DB()
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Your TaskFlow-saas api is start on port  ${port}`)
})
