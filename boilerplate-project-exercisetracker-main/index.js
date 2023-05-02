const express = require('express')
const app = express()
const cors = require('cors') 
require('dotenv').config()
const mongoose = require('mongoose');
const { Schema } = mongoose; //Schema để định nghĩa cấu trúc cho bản ghi

mongoose.connect(process.env.DB_URL)//Kết nối tới database

const UserSchema = new Schema({ //Định nghĩa cấu trúc cho bản ghi
  username: String, //Tên người dùng
});
const User = mongoose.model("User", UserSchema); //Tạo 1 mô hình dữ liệu cho MongoDB

const ExerciseSchema = new Schema({ //Định nghĩa cấu trúc cho bản ghi
  user_id: { type: String, required: true }, //Xác định id của người dùng
  description: String,//Mô tả bài tập
  duration: Number,//Thời gian thực hiện bài tập
  date: Date,//Ngày thực hiện bài tập
});
const Exercise = mongoose.model("Exercise", ExerciseSchema);//Tạo 1 mô hình dữ liệu cho MongoDB

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get("/api/users", async (req, res) => { //Lấy tất cả người dùng
  const users = await User.find({}).select("_id username"); //Lấy người dùng có thông gin gồm id và username
  if (!users) {
    res.send("No users");//Nếu không có người dùng nào thì trả về thông báo
  } else {
    res.json(users);//Nếu có người dùng thì trả về danh sách người dùng
  }
})

app.post("/api/users", async (req, res) => {//Tạo người dùng mới
  console.log(req.body)//In ra thông tin người dùng
  const userObj = new User({//Tạo 1 đối tượng người dùng mới
    username: req.body.username//Lấy username từ thông tin người dùng gửi lên
  })

  try {//Thử lưu đối tượng người dùng mới vào database
    const user = await userObj.save() //Lưu đối tượng người dùng mới vào database
    console.log(user);//In ra thông tin người dùng mới
    res.json(user)//Trả về thông tin người dùng mới
  } catch (err) {//Nếu có lỗi thì in ra lỗi
    console.log(err)//In ra lỗi
  }

})

app.post("/api/users/:_id/exercises", async (req, res) => {//Tạo bài tập mới cho người dùng
  const id = req.params._id;//Lấy id người dùng từ đường dẫn
  const { description, duration, date } = req.body //Lấy thông tin bài tập từ thông tin gửi lên

  try {//Thử tìm người dùng theo id
    const user = await User.findById(id)//Tìm người dùng theo id
    if (!user) {//Nếu không tìm thấy người dùng thì trả về thông báo
      res.send("Could not find user")//Trả về thông báo
    } else { //Nếu tìm thấy người dùng thì tạo bài tập mới
      const exerciseObj = new Exercise({ //Tạo 1 đối tượng bài tập mới
        user_id: user._id, //Lấy id người dùng
        description,//Mô tả bài tập
        duration,//Thời gian thực hiện bài tập
        date: date ? new Date(date) : new Date() //Ngày thực hiện bài tập
      })
      const exercise = await exerciseObj.save()//Lưu đối tượng bài tập mới vào database
      res.json({//Trả về thông tin bài tập mới
        _id: user._id,
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString()//Chuyển đổi ngày thực hiện bài tập sang dạng chuỗi
      })
    }
  } catch (err) {//Nếu có lỗi thì in ra lỗi
    console.log(err);
    res.send("There was an error saving the exercise")
  }
})


app.get("/api/users/:_id/logs", async (req, res) => {//Lấy danh sách bài tập của người dùng
  const { from, to, limit } = req.query;//Lấy thông tin từ query string
  const id = req.params._id;//Lấy id người dùng từ đường dẫn
  const user = await User.findById(id);//Tìm người dùng theo id
  if (!user) {//Nếu không tìm thấy người dùng thì trả về thông báo
    res.send("Could not find user")
    return;
  }
  let dateObj = {}//Tạo 1 đối tượng để lưu trữ ngày tháng
  if (from) {
    dateObj["$gte"] = new Date(from)//Lấy ngày tháng từ query string
  }
  if (to) {
    dateObj["$lte"] = new Date(to)//Lấy ngày tháng từ query string
  }
  let filter = {//Tạo 1 đối tượng để lưu trữ điều kiện tìm kiếm
    user_id: id
  }
  if (from || to) {//Nếu có ngày tháng thì thêm điều kiện tìm kiếm
    filter.date = dateObj;
  }

  const exercises = await Exercise.find(filter).limit(+limit ?? 500)//Tìm kiếm bài tập theo điều kiện tìm kiếm giới hạn mặc định ban đầu nếu không nhập giá trị limit sẽ là 500

  const log = exercises.map(e => ({//thực hiện phép ánh xạ trên mảng exercises với mỗi e thuộc mảng exercises sẽ trả về 1 đối tượng mới
    description: e.description,//Mô tả bài tập
    duration: e.duration,//Thời gian thực hiện bài tập
    date: e.date.toDateString()//Ngày thực hiện bài tập
  }))

  res.json({
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log
  })
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})