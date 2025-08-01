const mysql = require('mysql2');


const connection = mysql.createConnection({
  host:"localhost",
  user: "root",
  password: "",
  database: "PhantomGames"
})

connection.connect(function(err){
  console.log("conexão feita")
})