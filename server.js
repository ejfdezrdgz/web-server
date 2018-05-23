var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var body_parser = require('body-parser');

var app = express();
var server = app.listen(3000, function () {
  console.log('Servidor web iniciado');
});
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
    console.log('Conexión exitosa');
  }
});

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  readDB(req, res, 0);
});

app.get('/edit/:id?', function (req, res) {
  readDB(req, res, 1);
});

app.post('/', function (req, res) {
  fs.readFile('./www/tareas/index.html', 'utf8', function (err, text) {
    let taskobj = { username: req.body.user, taskname: req.body.task };
    addEntry(taskobj);
    res.redirect("/");
  });
  console.log('Entrada añadida correctamente en base de datos');
});

app.get('/delete/:id?', function (req, res) {
  delEntry(req.query.id);
  res.redirect("/");
  console.log('Entrada eliminada correctamente de la base de datos');
});

app.post('/edit', function (req, res) {
  updateEntry(req.body);
  res.redirect('/');
  console.log('Entrada editada correctamente en base de datos');
});

app.use(express.static('www/tareas'));

function addEntry(data) {
  var query = connection.query('INSERT INTO tasks (username, taskname) VALUES (?, ?)', [data.username, data.taskname], function (error, result) {
    if (error) { throw error; }
  })
};

function delEntry(index) {
  var query = connection.query('UPDATE tasks SET deleted=true WHERE taskid=?', [index], function (error, result) {
    if (error) { throw error; }
  })
};

function updateEntry(data) {
  var query = connection.query('UPDATE tasks SET username=?, taskname=? WHERE taskid=?', [data.user, data.task, data.arrayid], function (error, result) {
    if (error) { throw error; }
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

function readDB(req, res, reqcase) {
  connection.query('SELECT * FROM tasks WHERE deleted=false', function (error, result) {
    if (error) {
      throw error;
    } else {
      fs.readFile("./www/tareas/index.html", "utf8", function (error, text) {
        text = text.replace("[substitute]", loadTasks(result));
        switch (reqcase) {
          case 0:
            break;

          case 1:
            for (let task of result) {
              if (task.taskid == req.query.id) {
                var regEd = task;
              }
            };
            text = text.replace('action="/"', 'action="/edit"');
            text = text.replace('value="[arrayid]"', 'value="' + regEd.taskid + '"');
            text = text.replace('placeholder="Username"', 'value="' + regEd.username + '"');
            text = text.replace('placeholder="Task name"', 'value="' + regEd.taskname + '"');
            break;
        }
        res.send(text);
      })
    }
  })
};