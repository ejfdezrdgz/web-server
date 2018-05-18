var fs = require('fs');
var express = require('express');
var body_parser = require('body-parser');

var app = express();
var tasklist = [];

fs.exists("./list.json", function (excheck) {
  if (excheck == true) {
    var data = fs.readFileSync("./list.json", "UTF8");
    tasklist = JSON.parse(data);
  };
});

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
    var taskobj = { username: req.body.user, taskname: req.body.task };
    tasklist.push(taskobj);
    writeList();
    res.redirect("/");
  });
  console.log('Petición POST recibida correctamente');
});

app.get('/delete/:id?', function (req, res) {
  tasklist.splice(req.query.id - 1, 1);
  writeList();
  res.redirect("/");
  console.log('Petición DELETE recibida correctamente');
});

app.post('/edit', function (req, res) {
  tasklist[parseInt(req.body.arrayid)].username = req.body.user;
  tasklist[parseInt(req.body.arrayid)].taskname = req.body.task;
  writeList();
  res.redirect('/');
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
      <td>
        <div class=optMenu>
          <a href="/edit?id=[taskid]">Edit</a>
          <a href="/delete?id=[taskid]">Delete</a>
        </div>
      </td>
    </tr>
    `;
    newRow = newRow.split("[taskid]").join(parseInt(index) + 1);
    newRow = newRow.replace("[username]", tasklist[index].username);
    newRow = newRow.replace("[taskname]", tasklist[index].taskname);
    newTask += newRow;
  }
  return newTask;
};

function writeList() {
  fs.writeFile("./list.json", JSON.stringify(tasklist), function () {
    console.log("Fichero de datos actualizado");
  });
};