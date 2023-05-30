const { response } = require("express");
const express = require("express");
const mongoose = require("mongoose");
const app = express();


mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/BlogDb");

const {
    blog_obj,author_obj
} = require("./models/model.js");


const session = require("express-session");

app.use(session({
  secret: "my_secret_key", // 设置 session 加密密钥
  resave: false,
  saveUninitialized: true
}));

app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));


app.use((req, res, next) => {
    if (req.path === "/login") {
      // 如果用户请求的是登陆页面，则不需要验证用户是否已登录
      next();
    } else if (req.session && req.session.user) {
      // 如果用户已经登录，则将用户信息存储在 req.locals 中
      res.locals.user = req.session.user;
      next();
    } else {
      // 如果用户还未登录，则跳转到登陆页面
      res.redirect("/login");
    }
});
  
// app.post("/login", async (req, res) => {
//     const { username, password } = req.body;
//     // 在此处写入验证逻辑，检查用户输入的用户名和密码是否正确
//     // 如果验证成功，则将用户信息存储在 session 中，并跳转到主页
//     req.session.user = { username };
//     res.redirect("/");
//   });

app.get("/login", async (req, res) => {
    res.render('login'); 
});

// app.get('/register', (req, res) => {
//     res.render('register'); //渲染注册页面
// });
  
// app.post('/register', (req, res) => {
//     const { username, password, email } = req.body;
//     const newUser = new User({ username, email });
//     User.register(newUser, password, (err, user) => {
//       if (err) {
//         console.log(err);
//         return res.render('register', { error: err.message }); //返回错误信息到注册页面
//       }
//       req.flash('success', '您已成功注册，请登录。'); //添加成功信息
//       res.redirect('/login'); //注册成功后转到登录页面
//     });
// });


app.get("/", async(req,res)=>{
    // const user = req.locals.user;
    const data = await blog_obj.find({});
    for (const blog of data) {
        const author = await author_obj.findOne(blog.author);
        blog.authorName = author.name;
    }
    res.render("index.ejs",{bdata:data})
})

app.get("/addnew",async(req, res) => {
    const data3 = await author_obj.find({});
    res.render("addnew.ejs",{adata:data3});
});

app.get("/authors",async(req, res) => {
    const data2 = await author_obj.find({});
    res.render("authors.ejs",{adata:data2});
});

app.get("/addauthor",(req, res) => {
    res.render("addAuthor.ejs");
});

app.post("/save",(req, res) => {
    const data = new blog_obj(req.body);
    data.save()
    res.redirect('/')

});

app.post("/save2",(req, res) => {
    const data = new author_obj(req.body);
    data.save()
    res.redirect('/authors')

});

//Delete Method
app.get("/deleteblog/:id", async(req,res)=>{
    await blog_obj.findByIdAndDelete(req.params.id);
    res.redirect("/")
})

//Edit Method
app.get("/edit/:id/editForm", async(req,res)=>{
    const data = await blog_obj.findById(req.params.id);
    res.render("editForm",{data})
})

app.get("/back",(req, res) => {
    res.redirect('/')

});

app.get("/backauth",(req, res) => {
    res.redirect('/authors')

});

app.post("/edit/:id", async(req,res)=>{
    await blog_obj.findByIdAndUpdate(req.params.id,req.body)
    res.redirect("/");
});

// app.get("/search", async(req, res) => {
//     const query = req.query.title;
//     const data = await blog_obj.find({ title: { $regex: query, $options: "i" } });
//     // 这里使用正则表达式来进行模糊匹配查询
//     for (const blog of data) {
//       const author = await author_obj.findOne(blog.author);
//       blog.authorName = author.name;
//     }
//     res.render("index.ejs", { bdata: data });
// });

app.get("/search", async(req, res) => {
    const title = req.query.title;
    const category = req.query.category;
    const author = req.query.author;
  
    // 根据标题、类型或作者进行查询
    const blogData = await blog_obj.find({
      $and: [
        title ? { title: { $regex: title, $options: "i" } } : {},
        category ? { blog_cat: { $regex: category, $options: "i" } } : {},
        author ? { author: { $in: await author_obj.find({ name: { $regex: author, $options: "i" } }).distinct("_id") } } : {}
      ]
    });
  
    // 去重
    const blogSet = new Set(blogData.map(blog => blog._id));
    const result = blogData.filter(blog => {
      if (blogSet.has(blog._id)) {
        blogSet.delete(blog._id);
        return true;
      }
      return false;
    });
  
    // 查询作者名字并渲染模板
    for (const blog of result) {
      const author = await author_obj.findOne(blog.author);
      blog.authorName = author.name;
    }
  
    res.render("index.ejs", { bdata: result });
});
  

app.listen(3000,show = ()=>{
    console.log('http://localhost:3000');
});