const express = require('express');
const db = require('../data/database');
const mongodb = require('mongodb');

const ObjectId = mongodb.ObjectId;

const router = express.Router();

router.get('/', (req, res) => {
  res.redirect('/posts');
});

router.get('/posts', async (req, res) => {
  const posts = await db.getDb().collection('posts').find({}, {title: 1, summary: 1, 'author.name': 1}).toArray()
  res.render('posts-list', {posts: posts});
});

router.get('/new-post', async (req, res) => {
  let authors = await db.getDb().collection('authors').find().toArray()
  res.render('create-post', {authors: authors});
});

router.post('/posts', async (req, res) => {
  const authorId = new ObjectId(req.body.author)
  const authorData = await db.getDb().collection('authors').findOne({_id: authorId})

  const post = {
    title: req.body.title,
    summary: req.body.summary,
    body: req.body.content,
    date: new Date(),
    author: {
      id: authorId,
      name: authorData.name,
      email: authorData.email},
  }
  const result = await db.getDb().collection('posts').insertOne(post)
  console.log(result)
  res.redirect('/posts')

});

module.exports = router;