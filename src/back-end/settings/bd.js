const mysql = require('mysql2');


const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "PhantomGames"
})

connection.connect(function (err) {
  console.log("conexão feita")
});

// connection.query("Select Nome from genero", function (err, rows, fields) {
//   if (!err) {
//     console.log("Resultado:", rows);
//   } else {
//     console.log("Erro na consulta de dados");
//   }
// });

// Rota para a página principal (que exibe o formulário)

form.addEventListener( 'submit' , ()=> 
 fetch('/register', {method: "POST", body: JSON.stringify({})}) 
)


// Rota POST para processar o formulário

app.post('/registrar', (req, res) => {

  
  const { Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria } = req.body;
  // Verifica se os campos estão preenchidos
  if (!Nome_jogo || !Descricao_jogo || !Preco_jogo || !Logo_jogo || !Capa_jogo || !Midias_jogo || !Faixa_etaria) {
    return res.status(400).send('Os campos são obrigatórios.')
  }

  // Query SQL para inserir os dados na tabela
  const sql = 'INSERT INTO jogos (Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria ) VALUES (?, ?)';
  const values = [Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria];

  // Executa a query
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('Erro ao inserir dados:', err);
      
      return res.status(500).send('Erro ao registrar os dados.');
  }
    console.log('Dados inseridos com sucesso! ID:',
      result.insertId);
    res.status(200).send('Jogo registrado com sucesso!');
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
