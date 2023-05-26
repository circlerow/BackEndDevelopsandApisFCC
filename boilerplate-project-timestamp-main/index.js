// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));



// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

const isValidDate = (date) => date.toUTCString() === "Invalid Date";
// your first API endpoint... 
app.get("/api/:date", function (req, res) {//Sử dụng phương thức get để lấy dữ liệu từ server
  let date = new Date(req.params.date);//Lấy dữ liệu từ đường dẫn
console.log(date)//In ra màn hình
  if (isValidDate(date)) {//Kiểm tra xem ngày có hợp lệ không
    date = new Date(+req.params.date);//Nếu không thì chuyển sang kiểu số
  }
console.log(date)//In ra màn hình
  if (isValidDate(date)) {//Kiểm tra xem ngày có hợp lệ không
    res.json({ error: "Invalid Date" });//Nếu không thì trả về lỗi
    return;
  }

  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

app.get("/api", function (req, res) {
  res.json({
    unix: new Date().getTime(),
    utc: new Date().toUTCString()
  });
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
