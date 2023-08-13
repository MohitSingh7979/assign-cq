const { getUser, saveUser, init: initUser } = require("./utility/user.js");
const { createTask, saveTodoList, getTodoList, init: initTodoList } = require(
  "./utility/todo_list.js",
);
const express = require("express");
const session = require("express-session");
const path = require("path");

const PORT = 3000;
const STATIC_DIR = path.join(__dirname, "static");
const VIEWS_DIR = path.join(__dirname, "views");

const app = express();

// initalizing files
initUser();
initTodoList();

// middlewares
// for serving static files ie. images, css, javscripts and more
app.use("/static", express.static(STATIC_DIR));

// handles sessions, like user login
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: "this is just me",
  // cookie: { secure: true },
}));

// for parsing json body
app.use(express.json()); // {} => "{}"
// for parsing data from url, ie. name=343&age=34
app.use(express.urlencoded({ extended: true }));

app.set("views", VIEWS_DIR);
app.set("view engine", "ejs");

// for signin user
// /user/ankush001
app.get("/user", async (req, res) => {
  const warnings = [];
  const { id, password } = req.query;

  const user = await getUser(id); // read from file

  if (!user) {
    warnings.push({ msg: "User not found...Please register", color: "red" });
    res
      .status(404);
  } else if (user.password !== password) { // verifying password
    warnings.push({ msg: "Wrong password...Please recheck", color: "red" });
    res
      .status(406);
  } else {
    req.session.user_id = id;
    res.redirect("/");
    return;
  }
  res.render("template", {
    page: "signin",
    title: "Sign in Page",
    warnings,
    data: "",
  });
});

// for signup user
// /user
app.post("/user", async (req, res) => {
  const warnings = [];
  const { id, name, password } = req.body;
  const user = await getUser(id); // read from file

  if (user) {
    warnings.push({ msg: "User already exists", color: "red" });
    res
      .status(302);
  } else {
    await saveUser(id, name, password);
    warnings.push({ msg: "Created successfully", color: "green" });
  }
  res.render("template", {
    page: "signup",
    title: "Signup Page",
    warnings,
    data: "",
  });
});

// just getting user from file using id stored in session
app.use(async (req, res, next) => {
  const id = req.session.user_id;
  req.session.currentUser = await getUser(id);
  next();
});

app.get("/signin", (req, res) => {
  const warnings = [];
  const user = req.session.currentUser;
  if (user) {
    res.redirect("/");
  } else {
    res.render("template", {
      page: "signin",
      title: "Sign in Page",
      data: "",
      warnings,
    });
  }
});

app.get("/signup", (req, res) => {
  const warnings = [];
  const user = req.session.currentUser;
  if (user) {
    res.redirect("/");
  } else {
    res.render("template", {
      page: "signup",
      title: "Sign up Page",
      data: "",
      warnings,
    });
  }
});

// for sign out user
app.delete("/user", async (req, res) => {
  delete req.session.user_id;
  res.end();
});

// for ensuring user is logged in
app.use(async (req, res, next) => {
  const user = req.session.currentUser;
  if (!user) {
    res.redirect("/signin");
  } else {
    next();
  }
});

// home page requires user details
app.get("/", async (req, res) => {
  const user = req.session.currentUser;
  const todoList = await getTodoList(user.todolist_id);
  for(const taskId in todoList){
    todoList[taskId] = JSON.parse(todoList[taskId]);
  }
  console.log(todoList);
  res.render("template", { page: "index", data: {todoList, user} });
});

// get todolist
app.get("/todolist", async (req, res) => {
  const user = req.session.currentUser;
  const todolistData = await getTodoList(user.todolist_id);
  res.send(todolistData);
});

// create new task
app.post("/todolist", async (req, res) => {
  const taskInfo = req.body.task;
  const user = req.session.currentUser;

  const task = createTask(taskInfo);

  const todoList = await getTodoList(user.todolist_id);
  todoList[task.id] = JSON.stringify(task);
  await saveTodoList(user.todolist_id, todoList);

  res.redirect("/");
});

// changing status of task,
app.post("/task/:id", async (req, res) => {
  const taskId = req.params.id;
  const progress = req.body.progress;
  const user = req.session.currentUser;

  const todoList = await getTodoList(user.todolist_id);
  if (!(taskId in todoList)) {
    res
      .status(404)
      .send("task not found!!");
  } else {
    const task = JSON.parse(todoList[taskId]);
    task.progress = progress;

    todoList[taskId] = JSON.stringify(task);
    await saveTodoList(user.todolist_id, todoList);

    res.send(`task progress changed to ${progress}`);
  }
});

// deleting status of task,
app.delete("/task/:id", async (req, res) => {
  const taskId = req.params.id;
  const user = req.session.currentUser;

  const todoList = await getTodoList(user.todolist_id);
  if (!(taskId in todoList)) {
    res
      .status(404)
      .send("task not found!!");
  } else {
    delete todoList[taskId];
    await saveTodoList(user.todolist_id, todoList);

    res.send(`task deleted...`);
  }
});

app.use("*", (req, res)=>{
  res.render("template", {page:"404", title:"page not found"});
});

app.listen(PORT, () => {
  console.log("server is running");
});
