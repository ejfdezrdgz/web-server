var fs = require('fs');
var express = require('express');
var body_parser = require('body-parser');

var app = express();
var tasklist = [];

app.use(express.static('www/tareas'));
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
  fs.readFile("./www/tareas/index.html", "utf8", function (err, text) {
    text = text.replace("[substitute]", "");
    res.send(text);
  });
  console.log('Petición GET recibida correctamente');
});

app.post('/', function (req, res) {
  fs.readFile('./www/tareas/index.html', 'utf8', function (err, text) {
    tasklist.push({ username: req.body.user, taskname: req.body.task });
    var newTask = loadTasks(tasklist);
    text = text.replace("[substitute]", newTask);
    console.log(tasklist);
    res.send(text);
  });
  console.log('Petición POST recibida correctamente');
});

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
    </tr>
    `;
    newRow = newRow.replace("[taskid]", parseInt(index) + 1);
    newRow = newRow.replace("[username]", tasklist[index].username);
    newRow = newRow.replace("[taskname]", tasklist[index].taskname);
    newTask += newRow;
  }
  return newTask;
};