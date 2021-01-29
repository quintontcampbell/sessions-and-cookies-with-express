## Learning Goals

- Assert how cookies bring statefulness to the stateless HTTP protocol
- Set a cookie with expiration
- Store and retrieve data in a session

## Getting Started

```
et get sessions-and-cookies-with-express
cd sessions-and-cookies-with-express
yarn install
yarn run dev
```

## What's a Cookie?

As we know from our work with HTTP so far, HTTP is a _stateless_ protocol! This means that each individual HTTP request sent to our server is considered an entirely individual entity -- the server does not remember anything about our prior requests when we send a new request to it. It simply looks at our request (the host, path, method, etc) and figures out what to send back to us accordingly.

This is great in many ways -- it simplifies the work that our server needs to do, since our server doesn't need to manage any sessions. We can scale our app easily without worrying about any additional or unexpected complexity as a part of each individual request. It makes things very straightforward for our server!

However, there are also obviously some shortcomings to this approach. If we can't track information from one request to the next, our websites aren't able to have any "memory", which can make our user's experience quite frustrating! Without memory, any site that requires us to login would become much more tedious. Imagine if you had to authenticate your account for every single request you made -- or even each individual time you opened the website in a new tab? A need for the ability to keep track of certain user information emerged quite quickly, and we needed a way to keep track of information from one request to the next.

Enter: **cookies**. Cookies make it possible for websites to identify you across multiple requests. A cookie is a small piece of data that is sent to the browser, along with an HTTP response. The browser may then store said cookie, and send it back to the server with subsequent requests. Basically, it's a little "extra" way for a particular browser, and a particular server, to recognize and talk to each other, like passing small notes along with the HTTP requests and responses. Cookies are often used in three main ways: for session management (e.g. keeping a user logged in), personalization (user preferences), and tracking.

## Viewing Cookies on Popular Websites

Have you ever wondered how Amazon knows what products you've looked at in the past? It's using cookies behind the scenes! In fact, there's a pretty cool way to see cookies in action using your Amazon account.

Open a new Incognito tab in Chrome, and navigate to <www.amazon.com>. Note that we're using an Incognito tab so that it does not have any data on your potentially logged-in Amazon account, or anything you've searched before this session! Go ahead and search for an item you're considering buying using the search form at the top of the page. Once you have search results, click on one of the listings and scroll around a bit.

Once you've viewed the item in question, go back to the Amazon homepage by either clicking the logo in the top left corner of the page, or just re-navigating to the page in the same tab. At the time of this writing, it is likely that a section appeared called "Related to Items You've Viewed", wihch you will see if you scroll down the page. Since we're in an Incognito tab and not logged in, Amazon is not storing this information as tied to our account somehow! Instead, it is using cookies to keep track of what we've viewed previously and show us similar information to coerce us into buying things ;).

We can even see these cookies within our Chrome inspector! Open up the inspector and navigate to the Application tab, then look under "Storage">>"Cookies" in the left-hand menu. We'll see a few cookies stored in this Incognito browser for the Amazon site. We can right-click each individual cookie and click "Clear", and if we reload our page again within the same tab, we'll see that our "Related to Items You've Viewed" section disappears. Voila! We've gotten our browser to delete the cookies, and Amazon no longer remembers us!

## Setting a Cookie in Express

Just like Amazon's servers added cookies to our HTTP response (which were then saved in our browser), we can update our Expres routes to send cookies as well!

The first way we can add cookies is simply by adding a `Set-Cookie` header to our HTTP response. With Express responses, we can set headers using the `set()` method on our response.

If we navigate to `src/routes/rootRouter.js`, we'll see that we've set up a few simple routes: `/set-name`, `/get-name`, and `/forget-me`. Our `set-name` route expects a "name" to be sent as a query param. As long as it receives a name, it will send an HTTP response with a `Set-Cookie` header to store the "name" included, and a simple message of "Your name has been saved as a cookie!":

```js
rootRouter.get("/set-name", (req, res) => {
  const name = req.query.name
  res.set('Set-Cookie', `name=${name}`).send("Your name has been saved as a cookie!")
})
```

Let's send an HTTP request to this route by visiting <http://localhost:3000/set-name?name=Joan>. Once you visit that link, you should see our success message in your browser. Even better, you can open up your Chrome inspector again, head to the "Application" tab, and you'll see a cookie stored under "Storage" >> "Cookie" just like we did for Amazon! The cookie has a key-value pair with a key of "name" and a value of "Joan".

Conveniently, Express also gives us a shortcut method to add cookies. Rather than needing to explicitly set the `Set-Cookie` header, we can actually refactor this route to use the `cookie()` Express method:

```js
rootRouter.get("/set-name", (req, res) => {
  const name = req.query.name
  res.cookie('name', name).send("Your name has been saved as a cookie!")
})
```

This method expects two arguments: the key and then the value of the cookie we want to send. If we navigate to <http://localhost:3000/set-name?name=Jack> this time, we'll see the cookie that is stored in our browser update to say "Jack" instead!

Now that we've set our cookie and know that it's being stored properly by our browser, let's look at how we can _read_ and use that cookie in our Express routes as well. The ability to read a cookie within our routes is not immediately available as a part of Express, but luckily, Express has a number of different middlewares built out which allow us to access cookies within our Express server. We'll start by using a simple middleware called `cookie-parser`, which works similar to other middlewares we've seen, such as `body-parser`, and gives us quick and easy access to our cookies in our Express routes.

If you look at the `src/app.js` file, you'll see that we're importing `cookieParser` at the top of the file, and applying it to our entire Express app on line 32:

```js
app.use(cookieParser())
```

This is all the setup we need! We can now read our cookies easily within our Express routes.

Now, we can visit our `/get-name` path. From our new knowledge of cookies, we know that the browser has saved the "name" that we sent along, and should send it to the server with our subsequent requests. Thanks to our `cookie-parser` middleware, we can access any cookies sent by our browser by calling `req.cookies`. Let's take a look at our `/get-name` route:

```js
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
```

Here, we capture the "name" from our cookies inside of a variable called `cookieName`, and conditionally determine if we have data from cookies about a specific user, or if we need to default to some standardized greeting. _It is very important to always check for the existence of our desired cookie_, because it's very possible that the user is brand new to our site and that the cookie doesn't exist yet! We then render our "index" Handlebars template and hand it the designated greeting. Visit <http://localhost:3000/get-name> and you should see "Hello, Jack!" on the page.

We know from our work with Amazon that we can clear out these cookies, so go ahead and do that now. Right-click the "http://localhost:3000" cookie in your Chrome inspector and click "clear". Then, revisit <http://localhost:3000/get-name> and you should see our generic "Hello, friend!" message appear. This is because the browser is no longer keeping track of the cookie, so when we re-send our HTTP request, it doesn't send that cookie along. As such, our server doesn't recognize us and greets us generically.

## Deleting and Expiring Cookies

We know that we can manually remove cookies from our browser, but there are a few other ways we can remove cookies from a user's browser. The first is using the `clearCookie()` method. If we take a look at the `/forget-me` route, we'll see this method in action:

```js
rootRouter.get("/forget-me", (req, res) => {
  res.clearCookie("name")
  res.send("Cleared 'name' cookie")
})
```

When a user navigates to the `/forget-me` route, it will automatically forget any name we've set via cookies. Try it yourself by watching the cookies in the Chrome inspector: use the "/set-name" path to set a new name and see it get added to your browser cookies, then visit "/forget-me" and see it disappear!

The other main way we can clear out cookies with our server is by using an _expiration date_ to delete them after a certain amount of time.

If we wanted to set an expiration date, we can add a `maxAge` to our cookie by updating our `/set-name` route to the following:

```js
rootRouter.get("/set-name", (req, res) => {
  const name = req.query.name
  res.cookie('name', name, { maxAge: 30000 }).send("Your name has been saved as a cookie!")
})
```

Here, we've handed in an optional "options" object with a `maxAge` key-value pair. `maxAge` expects to be given a number of milliseconds, so we have told our browser to forget our cookie after 30 seconds.

Try it yourself -- update your `/set-name` route, then visit it and set a name. Visit your `/get-name` route and you should see that name appear -- but wait 30 seconds and revisit that route and you'll see that the name has been cleared from your cookies!

Finally, if we don't manually clear the cookie or set an expiration, then the cookie will usually be cleared when the browser the user is using clears its session. Since this can vary, setting an expiration for our cookies is good practice.

## Unencrypted Cookies Are No Good!

It's worth noting that so far, we've been working with unencrypted cookies. This has been great for our visibility of how cookies work, but it's bad news for the privacy of our users.

First, let's change our `/set-name` route back to not expire our cookie:

```js
rootRouter.get("/set-name", (req, res) => {
  const name = req.query.name
  res.cookie('name', name).send("Your name has been saved as a cookie!")
})
```

Then, go ahead and visit <http://localhost:3000/set-name?name=Jill> to set your "name" cookie to "Jill". Finally, navigate to <http://localhost:3000/get-name> and confirm that "Hello, Jill!" appears on your page.

If you open up your Chrome inspector to view this cookie, you will see the `name: Jill` cookie under "Application". What you may notice if you click around, however, is that we can actually alter this cookie right there in our browser! Click on the name "Jill" in the Chrome inspector, and change it to your own name. If you refresh your page, you should see your name show up on the page instead of Jill's.

This is _bad, bad_ news. This means that as a user of the website, I can alter the information keeping track of my user with clarity and ease. Right now, we're only working with a name, but if these were secure credentials like a unique identifier for a user, we could alter our cookies to enact an impersonation attack!

`cookie-parser` has served us well so far, but now we need to bring in something a little more protective of our data. Thankfully, Express gives us `cookie-session`, a way to encrypt session variables and handle cookies in a more complex way using "sessions".

## `cookie-session`

We can think of `cookie-session` as the older sibling of `cookie-parser`. We apply it as a middleware, just like we did with `cookie-parser`. It's going to require a little more setup, but it's also going to provide us with some more complex functionality in terms of browser "sessions", or the time when a user has a specific browser window open.

We have provided the necessary package for you, so you already have it installed, but you could always add it to a new project with the command `yarn add cookie-session`. Once the package is included, we can use it in our project! Let's update `app.js` to use `cookie-session` instead of `cookie-parser`.

Replace the import of `cookieParser` on line 5 of `src/app.js` with the following:

```js
import cookieSession from "cookie-session"
```

Then, replace the application of `cookieParser` on line 32 with the below:


```js
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET],
  maxAge: 300000
}))
```

We're setting a default `maxAge` of 5 minutes, a name for our session of "session" (the typical name we can use unless we have reason to use otherwise), and an encryption key so that `cookieSession` can encrypt our cookies! The key we need to pass here is `process.env.SESSION_SECRET`, which should look a new to you. 

While we could pass any simple string as our key here instead (such as "test-key"), we should ideally always be using a very secret UUID, or *universally unique identifier*. Because this UUID is used as a passcode of sorts, it should be long, complex and hidden whenever possible. A sample UUID might look like: `"123e4567-e89b-12d3-a456-426614174000"`. We shouldn't add this string directly to our `src/app.js` file however, as that would reveal it! Instead, we use a library called `dotenv` to help store our UUID in an untracked file. In fact, a `.env.example` file is present in your app as an example of this hidden file! This example file isn't being used; it's just there as reference. In order to utilize `dotenv` to help obscure and load our special key, we will need to: 

* create a `.env` file in the root of our app
* Copy the contents of the `.env.example` file over to `.env`. 
* Add a custom UUID value to the `SESSION_SECRET` key in our `.env` file. 
* And activate `dotenv` in our app 

Don't worry about generating a UUID for now (though you could use a UUID generator to help). Instead, go ahead and use `123e4567-e89b-12d3-a456-426614174000` as the value for your session secret for this example application.

In our `src/app.js`, we have already activated `dotenv` for you.

```js
import dotenv from 'dotenv'
dotenv.config()
```

You custom env file should look like:

```
SESSION_SECRET="123e4567-e89b-12d3-a456-426614174000"
```

Now, whenever `process.env.SESSION_SECRET` is called, our UUID will be retrieved and used as our sessions secret key! That's a lot of work, but we will only need to set it up once!

### Final Updates to Our App

Now that we've set our middleware up, we can update our routes to use `req.session` instead of cookies:

```js
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
```

The application of our session is simple enough: in our `/set-name` path, we are setting a key-value pair in the `req.session` object that our middleware automatically provides to us. Then, in our `/get-name` path, we're calling on `req.session.name` to access that name. Finally, in `/forget-me`, we set the `req.session` to null to clear out all cookies. `cookieSession` is handling everything else behind the scenes, so long as we use our `req.session` object properly.

Navigate to <http://localhost:3000/set-name?name=Harris>, and check out the cookies in your Chrome inspector. You should see something very different: your cookies have been encrypted! They are no longer readable to the naked eye, nor can we mess with them by updating them with anything of real import.

## Why This Matters

While there are many strengths to HTTP being a stateless protocol, we need a way to have our browser "remember us", for the purpose of user sessions as well as ad tracking, etc! Cookies and sessions give us a way to set up this "memory" between our server and our browser, as well as to manage, update, and remove that relationship as time goes on.

## In Summary

In this article, we first used the Express `cookies()` method and the `cookie-parser` middleware library to set up cookies in our Express requests and responses, allowing our browser, and therefore our server, to remember and display our name to us. We then updated our app to use the `cookie-session` middleware to allow for encryption and protection of that information. Understanding cookies and sessions is fundamental to adding user authentication into our application, and we got our first peek at those aspects of our HTTP requests/responses here!
