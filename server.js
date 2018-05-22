var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var body_parser = require('body-parser');

var app = express();
var tasklist = [];
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'taskhandler',
  password: 'fwx8w67WB79fc5K2',
  database: 'tasksDB'
});

connection.connect(function (error) {
  if (error) {
    throw error;
  } else {
    console.log('Conexión exitosa')
  }
});

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  fs.readFile("./www/tareas/index.html", "utf8", function (err, text) {
    readDB(response,text,res);
  });
  console.log('Petición GET recibida correctamente');
});

app.post('/', function (req, res) {
  fs.readFile('./www/tareas/index.html', 'utf8', function (err, text) {
    let taskobj = { username: req.body.user, taskname: req.body.task };
    tasklist.push(taskobj);
    addEntry(taskobj);
    res.redirect("/");
  });
  console.log('Petición POST recibida correctamente');
});

app.get('/delete/:id?', function (req, res) {
  tasklist.splice(req.query.id - 1, 1);
  delEntry(req.query.id);
  res.redirect("/");
  console.log('Petición DELETE recibida correctamente');
});

app.post('/edit', function (req, res) {
  // tasklist[parseInt(req.body.arrayid)].username = req.body.user;
  // tasklist[parseInt(req.body.arrayid)].taskname = req.body.task;
  let taskobj = { taskid: req.body.id, username: req.body.user, taskname: req.body.task };
  updateEntry(taskobj);
  res.redirect('/');
  console.log('Petición EDIT recibida correctamente');
});

app.get('/edit/:id?', function (req, res) {
  fs.readFile("./www/tareas/index.html", "utf8", function (err, text) {
    text = text.replace("[substitute]", loadTasks(tasklist));
    text = text.replace('action="/"', 'action="/edit"');
    text = text.replace('value="[arrayid]"', 'value="' + (parseInt(req.query.id) - 1) + '"');
    text = text.replace('placeholder="Username"', 'value="' + tasklist[parseInt(req.query.id) - 1].username + '"');
    text = text.replace('placeholder="Task name"', 'value="' + tasklist[parseInt(req.query.id) - 1].taskname + '"');
    res.send(text);
  });
});

app.use(express.static('www/tareas'));

var server = app.listen(3000, function () {
  console.log('Servidor web iniciado');
});

function addEntry(data) {
  var query = connection.query('INSERT INTO tasks (username, taskname) VALUES (?, ?)', [data.username, data.taskname], function (error, result) {
    if (error) {
      throw error;
    }
  })
};

function delEntry(index) {
  var query = connection.query('DELETE FROM tasks WHERE taskid=?', [index], function (error, result) {
    if (error) {
      throw error;
    }
  })
};

function updateEntry(data) {
  var query = connection.query('UPDATE tasks SET username=?, taskname=? WHERE taskid=?', [data.username, data.taskname, data.taskid], function (error, result) {
    if (error) {
      throw error;
    }
  })
};

function response(text,res){
  text = text.replace("[substitute]", loadTasks(tasklist));
  res.send(text);
};

function readDB(cb,text,res) {
  connection.query('SELECT * FROM tasks', function (error, result) {
    if (error) {
      throw error;
    } else {
      console.log(result);
      cb(text,res);
    }
  })
};

function loadTasks(tasklist) {
  var newTask = "";
  for (var index in tasklist) {
    var newRow = `
    <tr>
      <td>[taskid]</td>
      <td>[username]</td>
      <td>[taskname]</td>
      <td>
        <div class=optMenu>
          <a href="/edit?id=[taskid]">Edit</a>
          <a href="/delete?id=[taskid]">Delete</a>
        </div>
      </td>
    </tr>
    `;
    newRow = newRow.split("[taskid]").join(tasklist[index].taskid);
    newRow = newRow.replace("[username]", tasklist[index].username);
    newRow = newRow.replace("[taskname]", tasklist[index].taskname);
    newTask += newRow;
  }
  return newTask;
};