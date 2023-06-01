const mongoose = require("mongoose");

const author_obj = mongoose.model("Author", new mongoose.Schema({
  name: String,
  age: String,
  contact: String
}));

const blog_obj = mongoose.model("Blog",new mongoose.Schema({
    title: String,
    content: String,
    blog_cat: String,
    likes:String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author"
    }
}));

const user_obj = mongoose.model("User", new mongoose.Schema({
  username: String,
  password: {
    type: String,
    select: false //不返回密码字段
  }
}));

module.exports = {
    blog_obj, author_obj, user_obj
}
