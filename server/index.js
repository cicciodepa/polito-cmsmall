"use strict";

const userDao = require('./users/dao-users')
const Page = require('./pages/page');
const { savePage, listPages, updatePage, getPage, pageExistsById, deletePage, getRawPage } = require('./pages/dao-pages');
const { saveBlock, updateBlock, deleteBlock } = require('./blocks/dao-blocks');
const ContentBlock = require('./blocks/contentblock');
const { listUsernameAndID } = require('./users/dao-users')
const PORT = 3000;

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dayjs = require('dayjs')

const app = express();
app.use(morgan("combined"));
app.use(express.json());

/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));

/*** Passport ***/

/** Authentication-related imports **/
const passport = require("passport"); // authentication middleware
const LocalStrategy = require("passport-local"); // authentication strategy (username and password)

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUserByCredentials
 **/
passport.use(
  new LocalStrategy(async function verify(username, password, callback) {
    const user = await userDao.getUserFromCredentials(username, password);
    if (!user) return callback(null, false, "Incorrect username or password");

    return callback(null, user); // NOTE: user info in the session 
  })
);

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) {
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) {
  return callback(null, user); // this will be available in req.user
});

/** Creating the session */
const session = require("express-session");
const { setWebsite, getWebsite } = require('./website');

app.use(
  session({
    secret: "shhhhh... it's a secret!",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.authenticate("session"));

/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authorized" });
};

/** Defining authentication ADMIN verification middleware **/
const isAdmin = (req, res, next) => {
  //console.log(req.user)
  if (req.isAuthenticated() && req.user.role === 'ADMIN') {
    return next();
  }
  return res.status(401).json({ error: "Not authorized" });
};

/*** Users APIs ***/

// POST /api/sessions
// This route is used for performing login.
app.post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json({ error: info });
    }
    // success, perform the login and extablish a login session
    req.login(user, (err) => {
      if (err) return next(err);
      // req.user contains the authenticated user, we send all the user info back
      // this is coming from userDao.getUserWithCredential() in LocalStratecy Verify Fn
      return res.json(req.user);
    });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else res.status(401).json({ error: "Not authenticated" });
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

/*** PAGES API ***/
//get pages based on auth: if auth all, else only published
app.get('/api/pages', async (req, res) => {
  try {
    const pages = await listPages();
    if (req.isAuthenticated()) {
      res.json(pages)
    } else {
      const filteredPages = pages.filter(page => dayjs(page.publicationDate).isBefore(dayjs()))
      res.json(filteredPages)
    }

  } catch (error) {
    res.status(500).send(error);
  }
})

//create a new page with its contents
app.post('/api/pages/', isLoggedIn, async (req, res) => {
  try {
    if (Object.keys(req.body).length === 0) {
      res.status(400).send("Empty body")
      return;
    }

    const contentsTypes = req.body.contents.map(el => { return el.type })

    if (!(contentsTypes.includes(1) && (contentsTypes.includes(2) || contentsTypes.includes(3)))) {
      res.status(400).send({error: "Page does not contain at least an header and a text/image"})
      return;
    }
    if (req.body.author === undefined || req.body.author === null || req.body.author === '' || typeof req.body.author !== 'number') {
      res.status(400).send({error: "Missing author."});
      return
    }
    if (req.body.creationDate === undefined || req.body.creationDate === null || req.body.creationDate === '') {
      res.status(400).send({error: "Missing creation date."});
      return
    }
    if (req.body.title === undefined || req.body.title === null || req.body.title === '') {
      res.status(400).send({error: "Missing page title."});
      return
    }

    const page = new Page(
      null,
      req.body.author,
      req.body.title,
      req.body.creationDate,
      req.body.publicationDate)

    page.id = await savePage(page)
    const contentPromises = req.body.contents.map(async (el) => {
      await saveBlock(new ContentBlock(el.id, el.type, el.content, el.position, page.id))
    })

    await Promise.all(contentPromises)
    const savedPage = await getPage(page.id)

    res.status(200).send(savedPage)
  } catch (error) {
    //console.log(error)
    res.status(500).send(error)
  }

});

//update page. if admin, author can be modified
app.put('/api/pages/:id', isLoggedIn, async (req, res) => {
  if (Object.keys(req.body).length === 0) {
    res.status(400).send("Empty body")
    return;
  }
  if (Number(req.params.id) !== req.body.id) {
    res.status(400).send({message: 'You are trying to modify a different page!'})
    return;
  }
  if (!(req.body.author === req.user.id || req.user.role === 'ADMIN')) {
    res.status(403).send({error: 'Unauthorized!'})
    return;
  }
  try {
    const exists = await pageExistsById(Number(req.params.id))
    if (!exists) {
      res.status(400).send({ message: `No page with id ${req.params.id} found.` })
      return;
    }

    const contentsTypes = req.body.contents.map(el => { return el.type })

    if (!(contentsTypes.includes(1) && (contentsTypes.includes(2) || contentsTypes.includes(3)))) {
      res.status(400).send({error: "Page does not contain at least an header and a text/image"})
      return;
    }
    if (req.body.author === undefined || req.body.author === null || req.body.author === '' || typeof req.body.author !== 'number') {
      res.status(400).send({error: "Missing author."});
      return
    }
    if (req.body.creationDate === undefined || req.body.creationDate === null || req.body.creationDate === '') {
      res.status(400).send({error:"Missing creation date."});
      return
    }
    if (req.body.title === undefined || req.body.title === null || req.body.title === '') {
      res.status(400).send({error:"Missing page title."});
      return
    }

    const page = new Page(
      req.body.id,
      req.body.author,
      req.body.title,
      req.body.creationDate,
      req.body.publicationDate)

    const parameters = {}
    if (req.user.role === 'ADMIN') {
      parameters['sql'] = `UPDATE pages SET author= ?, title= ?, publicationDate = ? WHERE id = ?`
      parameters['params'] = [page.author, page.title, page.publicationDate, page.id]
    } else {
      parameters['sql'] = `UPDATE pages SET title= ?, publicationDate = ? WHERE id = ?`
      parameters['params'] = [page.title, page.publicationDate, page.id]
    }

    const oldPage = await getPage(req.params.id)
    const blocksToDelete = oldPage.contents.filter( content => !req.body.contents.some( newContent => content.id === newContent.id )).map(async (el)=> {await deleteBlock(el.id)})
    await updatePage(page, parameters.sql, parameters.params)

    const contentsPromise = req.body.contents.map(async (content) => {
      if (content.id !== null) {
        await updateBlock(new ContentBlock(content.id, content.type, content.content, content.position, page.id))
      } else { await saveBlock(new ContentBlock(null, content.type, content.content, content.position, page.id)) }
    })

    await Promise.all(contentsPromise, blocksToDelete)

    const updatedPage = await getPage(page.id)
    res.status(200).send(updatedPage)
  }
  catch (error) {
    res.status(500).send(error)
  }

})

//to delete a page given its id
app.delete('/api/pages/:id', isLoggedIn, async (req, res) => {
  try {
    const page = await getRawPage(req.params.id)
    if (page.author === req.user.id || req.user.role === 'ADMIN') {
      const result = await deletePage(Number(req.params.id))
      res.status(200).send(result)
    } else {
      res.status(403).send({error: 'Not authorized to do this operation!'})
    }
  } catch (error) {
    res.status(500).send(error)
  }
})

/*** OTHER API ***/
//list username and ids for the admin to change authorship
app.get('/api/users/uids', isAdmin, async (req, res) => {
  try {
    const users = await listUsernameAndID();
    res.json(users)
  } catch (error) {
    res.status(500).send(error)
  }
})

//for the admin to change website name
app.post('/api/site', isAdmin, async (req, res) => {
  try {
    const website = await setWebsite(req.body.website)
    res.json(website)
  } catch (error) {
    res.status(500).send(error)
  }
})

//for the client to check website name
app.get('/api/site', async (req, res) => {
  try {
    const website = await getWebsite()
    res.json(website)
  } catch (error) {
    res.status(500).send(error)
  }
})


app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}/`);
});
