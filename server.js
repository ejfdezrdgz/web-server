var fs = require('fs');
var express = require('express');
var body_parser = require('body-parser');

var app = express();
var tasklist = [];

app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  fs.readFile("./www/tareas/index.html", "utf8", function (err, text) {
    text = text.replace("[substitute]", loadTasks(tasklist));
    res.send(text);
  });
  console.log('Petición GET recibida correctamente');
});

app.post('/', function (req, res) {
  fs.readFile('./www/tareas/index.html', 'utf8', function (err, text) {
    tasklist.push({ username: req.body.user, taskname: req.body.task });
    text = text.replace("[substitute]", loadTasks(tasklist));
    console.log(tasklist);
    res.send(text);
  });
  console.log('Petición POST recibida correctamente');
});

app.get('/delete/:id?', function (req, res) {
  tasklist.splice(req.body.taskid, 1);
  fs.readFile('./www/tareas/index.html', 'utf8', function (err, text) {
    text = text.replace("[substitute]", loadTasks(tasklist));
    console.log(tasklist);
    res.send(text);
  });
  console.log('Petición DELETE recibida correctamente');
});

app.use(express.static('www/tareas'));

var server = app.listen(80, function () {
  console.log('Servidor web iniciado');
});

function loadTasks(tasklist) {
  var newTask = "";
  for (var index in tasklist) {
    var newRow = `
    <tr>
      <td>[taskid]</td>
      <td>[username]</td>
      <td>[taskname]</td>
      <td><a href="/delete?id=[taskid]">Delete</a></td>
    </tr>
    `;
    newRow = newRow.split("[taskid]").join(parseInt(index) + 1);
    newRow = newRow.replace("[username]", tasklist[index].username);
    newRow = newRow.replace("[taskname]", tasklist[index].taskname);
    newTask += newRow;
  }
  return newTask;
};