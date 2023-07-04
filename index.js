require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const validUrl = require('valid-url')
const app = express();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true
})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});
const urls = db.collection('urls')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Model
const UrlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number
})

const Url = mongoose.model('Url', UrlSchema)

// Your first API endpoint
app.get('/api/shorturl', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  const urlCount = await Url.countDocuments()
  console.log(urlCount)
  const url = new Url({
    original_url: req.body.url,
    short_url: urlCount + 1
  })
  
  
  if (validUrl.isWebUri(req.body.url)) {
    try {
      await url.save()
      res.json({
        original_url: req.body.url,
        short_url: urlCount + 1
      })
      console.log(url)
    } catch (error) {
      console.log(error)
    }
  } else {
    res.json({error: 'invalid url'})
  }
})

app.get('/api/shorturl/:number', (req, res) => {
  const originalUrl = Url.findOne({short_url: req.params.number})
    .then((data) => {
      res.redirect(data.original_url)
      console.log(data.original_url)
    } )
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

module.exports = Url;