const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose=require('mongoose')
const {Schema}=mongoose


mongoose.connect(process.env.DB_URL)

const userSchema=new Schema({
  username: String
})
const User=mongoose.model('User',userSchema) 

const exerciseSchema=new Schema({
  userId: String,
  description: String,
  duration: Number,
  date: Date
});
const Exercise=mongoose.model('Exercise',exerciseSchema)



app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({extended:true}))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users",async function(req,res){
  console.log(req.body)
  const userObj=new User({username:req.body.username})
  try{
    const user = await userObj.save()
    console.log(user)
    res.json(user)

  }catch(err){
    console.log(err)
  }


})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
