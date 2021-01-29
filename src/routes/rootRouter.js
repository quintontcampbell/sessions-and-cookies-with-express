import express from "express"

const rootRouter = express.Router()

rootRouter.get("/set-name", (req, res) => {
  const name = req.query.name
  res.set('Set-Cookie', `name=${name}`).send("Your name has been saved as a cookie!")
})

rootRouter.get("/get-name", (req, res) => {
  const cookieName = req.cookies.name
  let greeting
  if(cookieName) {
    greeting = cookieName
  } else {
    greeting = "friend"
  }
  res.render("index", { greeting })
})

rootRouter.get("/forget-me", (req, res) => {
  res.clearCookie("name")
  res.send("Cleared 'name' cookie")
})

export default rootRouter