import express from "express"
import path from "path"
import logger from "morgan"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import hbsMiddleware from "express-handlebars"
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
dotenv.config()

import rootRouter from "./routes/rootRouter.js";=

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// view engine setup
app.set("views", path.join(__dirname, "../views"))
app.engine(
  "hbs",
  hbsMiddleware({
    defaultLayout: "default",
    extname: ".hbs"
  })
)
app.set("view engine", "hbs")

app.use(logger("dev"))
app.use(express.json())

app.use(cookieParser())

app.use(express.static(path.join(__dirname, "../public")))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(rootRouter)

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is listening...")
})

export default app
