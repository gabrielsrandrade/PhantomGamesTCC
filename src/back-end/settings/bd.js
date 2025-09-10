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


// const express = require('express');
// const mysql = require('mysql2');
// const bodyParser = require('body-parser'); // Usado para analisar o corpo da requisição POST
// const cors = require('cors');

// const app = express();
// const port = 3000;

// app.use(cors());

// // Configura o body-parser para entender dados JSON e de formulários
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Cria a conexão com o banco de dados
// const connection = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     database: "PhantomGames"
// });

// // Conecta ao banco de dados
// connection.connect(function (err) {
//     if (err) {
//         console.error("Erro ao conectar ao banco de dados:", err);
//         return;
//     }
//     console.log("Conexão com o banco de dados feita!");
// });

// // Rota POST para processar o formulário
// // Use um nome de rota claro, como '/adicionar-jogo'
// app.post('/adicionar-jogo', (req, res) => {
//   // 1. Log os dados recebidos do frontend
//   console.log('Dados recebidos:', req.body);

//   const { Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria} = req.body;

//   // 2. Crie sua query SQL
//   const sql = `INSERT INTO jogos (Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria) VALUES (?, ?, ?, ?, ?, ?, ?)`;

//   // 3. Verifique a ordem dos valores
//   const values = [Nome_jogo, Descricao_jogo, Preco_jogo, Logo_jogo, Capa_jogo, Midias_jogo, Faixa_etaria];
  
//   // 4. Log a query e os valores para verificar
//   console.log('Query SQL:', sql);
//   console.log('Valores:', values);

//   connection.query(sql, values, (err, result) => {
//       // 5. O Erro 500 acontece aqui!
//       if (err) {
//           console.error('Erro na query SQL:', err);
//           return res.status(500).send("Erro interno do servidor ao adicionar jogo.");
//       }
      
//       console.log('Jogo adicionado com sucesso:', result);
//       res.status(200).send("Jogo adicionado com sucesso!");
//   });
// });

// // Inicia o servidor
// app.listen(port, () => {
//     console.log(`Servidor rodando em http://localhost:${port}`);
// });


const express = require('express');
const mysql = require('mysql2/promise'); // Usando a versão de promessas
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurações do seu banco de dados
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'PhantomGames',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Cria um pool de conexões para melhor performance em um servidor
const pool = mysql.createPool(dbConfig);

// Função para verificar a conexão do pool no startup
async function checkDatabaseConnection() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Pool de conexões com o banco de dados criado com sucesso!');
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } finally {
        if (connection) {
            connection.release();
        }
    }
}
checkDatabaseConnection();

// Rota POST para adicionar um novo jogo, categorias e gêneros
app.post('/adicionar-jogo', async (req, res) => {
    let connection;
    try {
        // Obter uma conexão do pool
        connection = await pool.getConnection();
        console.log('Conexão obtida do pool.');

        // Inicia uma transação para garantir que todas as operações sejam bem-sucedidas ou nenhuma delas seja
        await connection.beginTransaction();

        // 1. Log dos dados recebidos do frontend para depuração
        console.log('Dados recebidos:', req.body);
        
        // Destruturar os dados do corpo da requisição
        const {
            Nome_jogo,
            Descricao_jogo,
            Preco_jogo,
            Logo_jogo,
            Capa_jogo,
            Midias_jogo,
            Faixa_etaria,
        } = req.body;

        let {
        categorias = [],
        generos = []
        } = req.body;

        // Validar se os dados necessários estão presentes
        if (!Nome_jogo || !Preco_jogo) {
            await connection.rollback();
            return res.status(400).send('Nome do jogo e preço são obrigatórios.');
        }
        
        // 2. Inserir o novo jogo na tabela 'jogos'
        // Adicionando 'Media_nota' com um valor padrão de 0.00
        const gameSql = `
            INSERT INTO jogos (Nome_jogo, Preco_jogo, Logo_jogo, Descricao_jogo, Capa_jogo, Midias_jogo, Faixa_etaria, Media_nota)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const gameValues = [Nome_jogo, Preco_jogo, Logo_jogo, Descricao_jogo, Capa_jogo, Midias_jogo, Faixa_etaria, 10.00];
        const [gameResult] = await connection.execute(gameSql, gameValues);
        const jogoId = gameResult.insertId;
        console.log(`Jogo inserido com sucesso! ID do jogo: ${jogoId}`);

        // 3. Inserir e vincular categorias (se existirem)
        if (categorias && Array.isArray(categorias)) {
            for (const nome of categorias) {
                // Busca o ID da categoria pelo nome — assumindo que sempre exista
                const [existingCategory] = await connection.execute(
                    'SELECT ID_categoria FROM categoria WHERE Nome = ?', [nome]
                );
        
                if (existingCategory.length === 0) {
                    // Se quiser, pode logar ou ignorar essa categoria que não existe
                    console.log(`Categoria '${nome}' não encontrada no banco. Ignorando.`);
                    continue; // pula para a próxima categoria
                }
        
                const categoriaId = existingCategory[0].ID_categoria;
        
                // Insere na tabela de associação categoria_jogos
                await connection.execute(
                    'INSERT INTO categoria_jogos (ID_categoria, ID_jogo) VALUES (?, ?)',
                    [categoriaId, jogoId]
                );
        
                console.log(`Vínculo entre jogo ${jogoId} e categoria ${categoriaId} criado.`);
            }
        }
        
        
        // 4. Inserir e vincular gêneros (se existirem)
        if (generos && Array.isArray(generos)) {
            for (const nome of generos) {
                const [existingGenre] = await connection.execute(
                    'SELECT ID_genero FROM genero WHERE Nome = ?', [nome]
                );
        
                if (existingGenre.length === 0) {
                    console.log(`Gênero '${nome}' não encontrado no banco. Ignorando.`);
                    continue;
                }
        
                const generoId = existingGenre[0].ID_genero;
        
                await connection.execute(
                    'INSERT INTO genero_jogos (ID_genero, ID_jogo) VALUES (?, ?)',
                    [generoId, jogoId]
                );
        
                console.log(`Vínculo entre jogo ${jogoId} e gênero ${generoId} criado.`);
            }
        }

        // Se tudo der certo, efetiva a transação
        await connection.commit();
        res.status(200).send("Jogo, categorias e gêneros adicionados com sucesso!");

    } catch (err) {
        // Se houver qualquer erro, desfaz a transação para evitar dados parciais
        if (connection) {
            await connection.rollback();
            console.error('Transação desfeita devido a um erro.');
        }
        console.error('Erro na rota /adicionar-jogo:', err.message);
        res.status(500).send("Erro interno do servidor ao adicionar jogo.");
    } finally {
        // Libera a conexão de volta para o pool
        if (connection) {
            connection.release();
            console.log('Conexão liberada.');
        }
    }
});

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
    res.status(200).send('Servidor está rodando.');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});


// const mysql = require('mysql2/promise');

// async function testInsertWithChosenCategoriesAndGenres() {
//   const dbConfig = {
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'PhantomGames',
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
//   };

//   const pool = mysql.createPool(dbConfig);
//   let connection;

//   // Categorias e gêneros que você quer associar (exemplo)
//   const categoriasEscolhidas = ['Singleplayer'];
//   const generosEscolhidos = ['Aventura', 'RPG'];

//   try {
//     connection = await pool.getConnection();

//     // Insere o jogo
//     const insertJogoSql = `
//       INSERT INTO jogos
//       (Nome_jogo, Preco_jogo, Logo_jogo, Descricao_jogo, Capa_jogo, Midias_jogo, Faixa_etaria, Media_nota)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const jogoValues = [
//       'Jogo Teste 2',
//       79.90,
//       'logo-teste2.png',
//       'Descrição do jogo teste 2.',
//       'capa-teste2.png',
//       'midia1.png, midia2.png',
//       '16+',
//       0.0
//     ];

//     const [jogoResult] = await connection.execute(insertJogoSql, jogoValues);
//     const jogoId = jogoResult.insertId;
//     console.log(`Jogo inserido com ID: ${jogoId}`);

//     // Para cada categoria escolhida, pega o ID e insere o vínculo
//     for (const nomeCategoria of categoriasEscolhidas) {
//         const [rowsCat] = await connection.execute('SELECT ID_categoria FROM categoria WHERE Nome = ?', [nomeCategoria]);
      
//         if (rowsCat.length === 0) {
//           console.log(`Categoria '${nomeCategoria}' não encontrada. Ignorando.`);
//           continue;
//         }
      
//         const categoriaId = rowsCat[0].ID_categoria;
//         await connection.execute('INSERT INTO categoria_jogos (ID_categoria, ID_jogo) VALUES (?, ?)', [categoriaId, jogoId]);
//         console.log(`Vínculo criado: jogo ${jogoId} -> categoria ${categoriaId}`);
//       }
      

//     // Para cada gênero escolhido, pega o ID e insere o vínculo
//     for (const nomeGenero of generosEscolhidos) {
//       const [rowsGen] = await connection.execute('SELECT ID_genero FROM genero WHERE Nome = ?', [nomeGenero]);

//       if (rowsGen.length === 0) {
//         console.log(`Gênero '${nomeGenero}' não encontrado. Ignorando.`);
//         continue;
//       }

//       const generoId = rowsGen[0].ID_genero;
//       await connection.execute('INSERT INTO genero_jogos (ID_genero, ID_jogo) VALUES (?, ?)', [generoId, jogoId]);
//       console.log(`Vínculo criado: jogo ${jogoId} -> gênero ${generoId}`);
//     }

//     console.log('Teste com categorias e gêneros escolhidos concluído!');
//   } catch (error) {
//     console.error('Erro durante teste:', error);
//   } finally {
//     if (connection) connection.release();
//     pool.end();
//   }
// }

// testInsertWithChosenCategoriesAndGenres();
