// const mysql = require('mysql2');


// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "PhantomGames"
// })

// connection.connect(function (err) {
//   console.log("conexão feita")
// });

// // connection.query("Select Nome from genero", function (err, rows, fields) {
// //   if (!err) {
// //     console.log("Resultado:", rows);
// //   } else {
// //     console.log("Erro na consulta de dados");
// //   }
// // });

// // Rota para a página principal (que exibe o formulário)

// const Nome_jogo = document.querySelector("#Nome_jogo").value
// const Preco_jogo = document.querySelector("#Nome_jogo").value
// const Logo_jogo = document.querySelector("#Nome_jogo").value
// const Descricao_jogo = document.querySelector("#Nome_jogo").value
// const Capa_jogo = document.querySelector("#Nome_jogo").value
// const Midias_jogo = document.querySelector("#Nome_jogo").value
// const Faixa_etaria = document.querySelector("#Nome_jogo").value

// form.addEventListener( 'submit' , ()=> 
//  fetch('/register', {method: "POST", body: JSON.stringify({})}) 
// )


// // Rota POST para processar o formulário

// app.post('/registrar', (req, res) => {

  
//   const { Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria } = req.body;
//   // Verifica se os campos estão preenchidos
//   if (!Nome_jogo || !Descricao_jogo || !Preco_jogo || !Logo_jogo || !Capa_jogo || !Midias_jogo || !Faixa_etaria) {
//     return res.status(400).send('Os campos são obrigatórios.')
//   }

//   // Query SQL para inserir os dados na tabela
//   const sql = 'INSERT INTO jogos (Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria ) VALUES (?, ?)';
//   const values = [Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria];

//   // Executa a query
//   db.query(sql, values, (err, result) => {
//     if (err) {
//       console.error('Erro ao inserir dados:', err);
      
//       return res.status(500).send('Erro ao registrar os dados.');
//   }
//     console.log('Dados inseridos com sucesso! ID:',
//       result.insertId);
//     res.status(200).send('Jogo registrado com sucesso!');
//   });
// });

// // Inicia o servidor
// app.listen(port, () => {
//   console.log(`Servidor rodando em http://localhost:${port}`);
// });


const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser'); // Usado para analisar o corpo da requisição POST
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

// Configura o body-parser para entender dados JSON e de formulários
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cria a conexão com o banco de dados
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Verdao2007@@",
    database: "PhantomGames"
});

// Conecta ao banco de dados
connection.connect(function (err) {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
        return;
    }
    console.log("Conexão com o banco de dados feita!");
});

// Rota POST para processar o formulário
// Use um nome de rota claro, como '/adicionar-jogo'
app.post('/adicionar-jogo', (req, res) => {
  // 1. Log os dados recebidos do frontend
  console.log('Dados recebidos:', req.body);

  const { Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria} = req.body;

  // 2. Crie sua query SQL
  const sql = `INSERT INTO jogos (Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  // 3. Verifique a ordem dos valores
  const values = [Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria];
  
  // 4. Log a query e os valores para verificar
  console.log('Query SQL:', sql);
  console.log('Valores:', values);

  connection.query(sql, values, (err, result) => {
      // 5. O Erro 500 acontece aqui!
      if (err) {
          console.error('Erro na query SQL:', err);
          return res.status(500).send("Erro interno do servidor ao adicionar jogo.");
      }
      
      console.log('Jogo adicionado com sucesso:', result);
      res.status(200).send("Jogo adicionado com sucesso!");
  });
});

app.get('/jogos', (req, res) => {
    const sql = "SELECT * FROM jogos";
    connection.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Erro ao buscar jogos");
        }
        res.json(results);
    });
});

connection.query('SELECT * FROM jogos', (err, res)=>{
    return console.log(res)
})

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});