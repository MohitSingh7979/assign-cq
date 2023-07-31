const { getUser, saveUser, init: initUser } = require("./utility/user.js");
const { createTask, saveTodoList, getTodoList, init: initTodoList } = require(
  "./utility/todo_list.js",
);
const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

// initalizing files
initUser();
initTodoList();

// middlewares
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

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

// for signin user
// /user/ankush001
app.get("/user", async (req, res) => {
  const {id, password} = req.query;
  const user = await getUser(id); // read from file
  if (!user) {
    res
      .status(404)
      .send("User not found...Please register");
  } else if (user.password !== password) { // verifying password
    res
      .status(406)
      .send("Wrong password...Please check");
  } else {
    req.session.user_id = id;
    res.redirect("/");
  }
});

// for signup user
// /user
app.post("/user", async (req, res) => {
  console.log(req.body);
  const { id, name, password } = req.body;
  console.log(id, name, password);
  const user = await getUser(id); // read from file
  if (user) {
    res
      .status(302)
      .send("User already found...Please login");
  } else {
    await saveUser(id, name, password);
    res.send("User created... Please login");
  }
});

// for ensuring user is logged in 
app.use(async (req, res, next) => {
  const id = req.session.user_id;
  const user = req.session.currentUser = await getUser(id);
  if (!user) {
    res
      .status(404)
      .render("404");
  } else {
    next();
  }
});

// for sign out user
app.delete("/user", async (req, res) => {
  delete req.session.user_id;
  res.send("User signout successfully...");
});

// home page requires user details
app.get("/", async (req, res) => {
  const user = req.session.currentUser;
  const todoList = await getTodoList(user.todolist_id);
  res.render("index", {user, todoList});
});

// get todolist
app.get("/todolist", async (req, res) => {
  const user = req.session.currentUser;
  const todolistData = await getTodoList(user.todolist_id);
  res.send(todolistData);
});

// create new task
app.post("/todolist", async (req, res) => {
  const taskInfo = req.query.task;
  const user = req.session.currentUser;

  const task = createTask(taskInfo);

  const todoList = await getTodoList(user.todolist_id);
  todoList[task.id] = JSON.stringify(task);
  await saveTodoList(user.todolist_id, todoList);

  res.send("new task created successfully");
});

// changing status of task,
app.post("/task/:id", async (req, res) => {
  const taskId = req.params.id;
  const progress = req.query.progress;
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

app.listen(3000, () => {
  console.log("server is running");
});
