const express = require("express");

const Users = require("./userDb.js");
const Posts = require("../posts/postDb.js");

const router = express.Router();

router.post("/", validateUser, (req, res) => {
  Users.insert(req.body)
    .then(user => {
      res.status(201).json(user);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

router.post("/:id/posts", validateUserId, validatePost, (req, res) => {
  const post = req.body;
  post.user_id = req.params.id;

  Posts.insert(post)
    .then(newPost => {
      res.status(201).json(newPost);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

router.get("/", (req, res) => {
  Users.get()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

router.get("/:id", validateUserId, (req, res) => {
  Users.getById(req.params.id)
    .then(user => {
      res.status(200).json(user);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

router.get("/:id/posts", validateUserId, (req, res) => {
  Users.getUserPosts(req.params.id)
    .then(posts => {
      res.status(200).json(posts);
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

router.delete("/:id", validateUserId, (req, res) => {
  Users.remove(req.params.id)
    .then(response => {
      res
        .status(200)
        .json({ message: `User ${req.params.id} successfully deleted.` });
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

router.put("/:id", validateUserId, (req, res) => {
  Users.update(req.params.id, req.body)
    .then(response => {
      Users.getById(req.params.id)
        .then(editedUser => {
          res.status(200).json(editedUser);
        })
        .catch(err => {
          res.status(500).json(err);
        });
    })
    .catch(err => {
      res.status(500).json(err);
    });
});

//custom middleware

function validateUserId(req, res, next) {
  Users.getById(req.params.id)
    .then(user => {
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(404).json({ error: `ID ${req.params.id} not found.` });
      }
    })
    .catch(err => {
      res.status(500).json(err);
    });
}

function validateUser(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "Request missing user data." });
  } else if (req.body.name === undefined) {
    res.status(400).json({ error: "Request missing required field: name" });
  } else {
    next();
  }
}

function validatePost(req, res, next) {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({ error: "Request missing post data." });
  } else if (req.body.text === undefined) {
    res.status(400).json({ error: "Request missing required field: text" });
  } else {
    next();
  }
}

module.exports = router;
