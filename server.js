var express = require('express');
var body_parser = require('body-parser');

var app = express();

app.use(express.static('www'));
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));

// Módulo para peticiones tipo GET

// app.get('/datos', function (req, res) {
//   console.log('Petición recibida correctamente');
//   var req_name = req.query.user || '';
//   var req_task = req.query.task || '';
//   console.log(req_name);
//   console.log(req_task);
//   res.send('Tarea enviada');
// });


// Módulo para peticiones tipo POST

app.post('/datos', function (req, res) {
  console.log('Petición recibida correctamente');
  var req_name = req.body.user || '';
  var req_task = req.body.task || '';
  console.log(req_name);
  console.log(req_task);
  res.send('Tarea enviada');
});

var server = app.listen(80, function () {
  console.log('Servidor web iniciado');
});