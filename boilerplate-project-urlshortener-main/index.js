require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb'); //module for mongodb
const dns = require('dns'); //module for dns lookup
const urlparser = require('url');  //module for parsing url
const client = new MongoClient(process.env.DB_URL)  //tạo 1 client để connect tới mongodb
const db = client.db('urlshortener') //tạo 1 db tên là urlshortener từ mongodb
const urls = db.collection('urls') //tạo 1 collection tên là urls từ db urlshortener

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded.
//Phân tích cú pháp các yêu cầu với nội dung phân tích cú pháp URL mã hóa và phân tích cú pháp URL không mã hóa.

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function (req, res) {
  console.log(req.body)
  const url = req.body.url;
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, //lấy hostname từ url
    async (err, address) => { //callback function
      if (!address) {
        res.json({ error: 'invalid url' })//nếu không có address thì trả về lỗi
      }
      else {//nếu có address thì kiểm tra xem url đã có trong db chưa

        const urlCount = await urls.countDocuments({}); //đếm số lượng document trong collection urls
        const urlDoc = { //tạo 1 document mới
          url,
          short_url: urlCount
        };
        const result = await urls.insertOne(urlDoc); //thêm document mới vào collection urls
        console.log(result);
        res.json({ original_url: url, short_url: urlCount });//trả về kết quả
      }
    })
});

app.get('/api/shorturl/:short_url', async (req, res) => {//Khi truy cập vào trang có dạng /api/shorturl/:short_url thì trang sẽ chuyển đến url tương ứng
  const shorturl=req.params.short_url;  //lấy short_url từ url
  const urlDoc = await urls.findOne({short_url:+shorturl}); //tìm document có short_url tương ứng
  res.redirect(urlDoc.url); //chuyển đến url tương ứng
});



app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
