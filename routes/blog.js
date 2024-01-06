const express = require("express");
const db = require("../data/database");
const mongodb = require("mongodb");

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get("/", (req, res) => {
  res.redirect("/posts");
});

router.get("/posts", async (req, res) => {
  const posts = await db
    .getDb()
    .collection("posts")
    .find({})
    .project({ title: 1, summary: 1, "author.name": 1 })
    .toArray();
  res.render("posts-list", { posts: posts });
});

router.get("/new-post", async (req, res) => {
  let authors = await db.getDb().collection("authors").find().toArray();
  res.render("create-post", { authors: authors });
});

router.get("/posts/:id", async (req, res) => {
  const postId = new ObjectId(req.params.id);
  const post = await db.getDb().collection("posts").findOne({ _id: postId });
  const detailPost = {
    ...post,
    humanReadableDate: post.date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    date: post.date.toISOString(),
  };
  if (!post) {
    return res.status(404).render("404");
  }
  res.render("post-detail", { post: detailPost });
});

router.get("/posts/:id/edit", async (req, res) => {
  const postId = new ObjectId(req.params.id);
  const post = await db.getDb().collection("posts").findOne({ _id: postId });
  if (!post) {
    return res.status(404).render("404");
  }



  res.render("update-post", { post: post });
});

router.post("/posts", async (req, res) => {
  const authorId = new ObjectId(req.body.author);
  const authorData = await db
    .getDb()
    .collection("authors")
    .findOne({ _id: authorId });

  const post = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: authorData.name,
      email: authorData.email,
    },
  };
  const result = await db.getDb().collection("posts").insertOne(post);
  console.log(result);
  res.redirect("/posts");
});

router.post("/posts/:id/edit", async (req, res) => {
  const postId = new ObjectId(req.params.id);
  const result = await db
    .getDb()
    .collection("posts")
    .updateOne(
      { _id: postId },
      {
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          body: req.body.content,
          date: new Date(),
        },
      }
    );
  res.redirect("/posts");
});

router.post("/posts/:id/delete", async (req, res) => {
  const postId = new ObjectId(req.params.id);
  await db.getDb().collection("posts").deleteOne({ _id: postId });
  res.redirect("/posts");
});

module.exports = router;
