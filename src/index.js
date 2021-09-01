const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.findIndex((user) => user.username === username);

  if (user != -1) {
    request.user = user;
    return next();
  }

  return response.status(400).json({
    error: "User not found!",
  });
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const isExistsUser = users.find((user) => user.username === username);

  if (isExistsUser) {
    return response.status(400).json({
      error: "User already exists!",
    });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const indexUser = request.user;

  return response.json(users[indexUser].todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const indexUser = request.user;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const user = users[indexUser];
  const todosUser = user.todos;

  todosUser.push(todo);
  user.todos = todosUser;

  users[indexUser] = user;
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const id = request.params.id;
  const positionUser = request.user;

  const positionTodo = users[positionUser].todos.findIndex(
    (todo) => todo.id === id
  );

  if (positionTodo === -1) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  users[positionUser].todos[positionTodo].title = title;
  users[positionUser].todos[positionTodo].deadline = deadline;

  return response.json(users[positionUser].todos[positionTodo]);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const id = request.params.id;
  const positionUser = request.user;

  const positionTodo = users[positionUser].todos.findIndex(
    (todo) => todo.id === id
  );

  if (positionTodo === -1) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  users[positionUser].todos[positionTodo].done = true;

  return response.json(users[positionUser].todos[positionTodo]);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const id = request.params.id;
  const positionUser = request.user;

  const positionTodo = users[positionUser].todos.findIndex(
    (todo) => todo.id === id
  );

  if (positionTodo === -1) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  users[positionUser].todos.splice(positionTodo, 1);

  return response.status(204).json(users[positionUser].todos);
});

module.exports = app;
