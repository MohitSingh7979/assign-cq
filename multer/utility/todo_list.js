const { readFile, stat, writeFile } = require("fs").promises;
const path = require("path");
const { v4: uuid } = require("uuid");
const FILE = path.join(__dirname, "../storage/todo_list.json");
//
// {
//   "todolist_id": "{
//    "task_id": "{task, progress, id}",
//    "task_id_2"....
//   }"
// }

async function init() {
  try {
    await stat(FILE, { encoding: "utf-8" });
  } catch (err) {
    await writeFile(FILE, "{}", { encoding: "utf-8" });
  }
}

async function getTodoList(id) {
  try {
    const data = await readFile(FILE, { encoding: "utf-8" });
    const todoLists = JSON.parse(data || "{}");
    if (!(id in todoLists)) {
      todoLists[id] = '{}';
    } 
    const userTodolist = JSON.parse(todoLists[id]);
    return userTodolist;
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function saveTodoList(id, userTodolist){
  try {
    const data = await readFile(FILE, { encoding: "utf-8" });
    const todoLists = JSON.parse(data || "{}");
    todoLists[id] = JSON.stringify(userTodolist);
    await writeFile(FILE, JSON.stringify(todoLists));
  } catch (err) {
    console.log(err);
    return null;
  }
}

function createTask(taskInfo, imagePath, progress = 0){
  const id = uuid();
  const task = {taskInfo, id, progress, imagePath};
  return task;
}

module.exports = {
  createTask,
  // saveTask,
  // deleteTask,
  getTodoList,
  saveTodoList,
  init
};
