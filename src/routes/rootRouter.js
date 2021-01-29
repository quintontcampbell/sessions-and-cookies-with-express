import express from "express"

const rootRouter = express.Router()

rootRouter.get("/set-name", (req, res) => {
  const name = req.query.name
  req.session.name = name
  res.send("Your name has been saved as a cookie!")
})

rootRouter.get("/get-name", (req, res) => {
  const cookieName = req.session.name
  let greeting
  if(cookieName) {
    greeting = cookieName
  } else {
    greeting = "friend"
  }
  res.render("index", { greeting })
})

rootRouter.get("/forget-me", (req, res) => {
  res.session = null
  res.send("Cleared Cookies")
})
export default rootRouter