const mysql = require('mysql2');


const connection = mysql.createConnection({
  host:"localhost",
  user: "root",
  password: "",
  database: "PhantomGames"
})

connection.connect(function(err){
  console.log("conexão feita")
});

connection.query("Select Nome from genero", function (err, rows, fields){
  if (!err){
    console.log("Resultado:", rows);
  }else{
    console.log("Erro na consulta de dados");
  }
});