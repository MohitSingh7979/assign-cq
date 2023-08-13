const {readFile, stat, writeFile} = require("fs").promises;
const { getTodoList, saveTodoList } = require("./todo_list.js");
const path = require("path");
const { v4: uuid } = require("uuid");

const FILE = path.join(__dirname, "../storage/user.json");
//
// {
//   "a@b.c": "{
//     "name": "as",
//     "id": "a@b.c",
//     "password": "343",
//     "todolist_id": "gsdgfgdfg"
//   }"
// }

async function init(){
  try{
    await stat(FILE, {encoding: "utf-8"});
  }catch(err){
    await writeFile(FILE, "{}", {encoding: "utf-8"});
  }
}

async function getUser(id){
  try{
    const data = await readFile(FILE, {encoding: "utf-8"});
    const users = JSON.parse(data || "{}");
    if(id in users){
      const user = JSON.parse(users[id]);
      return user;
    }else{
      return null;
    }  
  }catch(err){
    console.log(err);
    return null;
  }
}

async function saveUser(id, name, password){
  try{
    const data = await readFile(FILE, {encoding:"utf-8"});
    const users = JSON.parse(data || "{}");

    const user = {id, name, password, todolist_id: uuid()};

    const todoList = await getTodoList(user.todolist_id);
    await saveTodoList(user.todolist_id, todoList);
    
    users[id] = JSON.stringify(user);
    await writeFile(FILE, JSON.stringify(users));
    // "{a: "{name,age,age}", b: "{name, age, age}"}"
    return true;
  }catch(err){
    console.log(err);
    return false;
  }
}

module.exports = {
  init,
  getUser,
  saveUser
};
