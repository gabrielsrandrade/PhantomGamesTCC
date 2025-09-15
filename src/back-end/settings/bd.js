const express = require("express");
const mysql = require("mysql2/promise"); // Usando a versão de promessas
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurações do seu banco de dados
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "PhantomGames",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Cria um pool de conexões para melhor performance em um servidor
const pool = mysql.createPool(dbConfig);

// Função para verificar a conexão do pool no startup
async function checkDatabaseConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Pool de conexões com o banco de dados criado com sucesso!");
  } catch (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
checkDatabaseConnection();

// Rota POST para adicionar um novo jogo, categorias e gêneros
app.post("/adicionar-jogo", async (req, res) => {
  let connection;
  try {
    // Obter uma conexão do pool
    connection = await pool.getConnection();
    console.log("Conexão obtida do pool.");

    // Inicia uma transação para garantir que todas as operações sejam bem-sucedidas ou nenhuma delas seja
    await connection.beginTransaction();

    // 1. Log dos dados recebidos do frontend para depuração
    console.log("Dados recebidos:", req.body);

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

    let { categorias = [], generos = [] } = req.body;

    // Validar se os dados necessários estão presentes
    if (!Nome_jogo || !Preco_jogo) {
      await connection.rollback();
      return res.status(400).send("Nome do jogo e preço são obrigatórios.");
    }

    // 2. Inserir o novo jogo na tabela 'jogos'
    // Adicionando 'Media_nota' com um valor padrão de 0.00
    const gameSql = `
            INSERT INTO jogos (Nome_jogo, Preco_jogo, Logo_jogo, Descricao_jogo, Capa_jogo, Midias_jogo, Faixa_etaria, Media_nota)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const gameValues = [
      Nome_jogo,
      Preco_jogo,
      Logo_jogo,
      Descricao_jogo,
      Capa_jogo,
      Midias_jogo,
      Faixa_etaria,
      10.0,
    ];
    const [gameResult] = await connection.execute(gameSql, gameValues);
    const jogoId = gameResult.insertId;
    console.log(`Jogo inserido com sucesso! ID do jogo: ${jogoId}`);

    // 3. Inserir e vincular categorias (se existirem)
    if (categorias && Array.isArray(categorias)) {
      for (const nome of categorias) {
        // Busca o ID da categoria pelo nome — assumindo que sempre exista
        const [existingCategory] = await connection.execute(
          "SELECT ID_categoria FROM categoria WHERE Nome = ?",
          [nome]
        );

        if (existingCategory.length === 0) {
          // Se quiser, pode logar ou ignorar essa categoria que não existe
          console.log(
            `Categoria '${nome}' não encontrada no banco. Ignorando.`
          );
          continue; // pula para a próxima categoria
        }

        const categoriaId = existingCategory[0].ID_categoria;

        // Insere na tabela de associação categoria_jogos
        await connection.execute(
          "INSERT INTO categoria_jogos (ID_categoria, ID_jogo) VALUES (?, ?)",
          [categoriaId, jogoId]
        );

        console.log(
          `Vínculo entre jogo ${jogoId} e categoria ${categoriaId} criado.`
        );
      }
    }

    // 4. Inserir e vincular gêneros (se existirem)
    if (generos && Array.isArray(generos)) {
      for (const nome of generos) {
        const [existingGenre] = await connection.execute(
          "SELECT ID_genero FROM genero WHERE Nome = ?",
          [nome]
        );

        if (existingGenre.length === 0) {
          console.log(`Gênero '${nome}' não encontrado no banco. Ignorando.`);
          continue;
        }

        const generoId = existingGenre[0].ID_genero;

        await connection.execute(
          "INSERT INTO genero_jogos (ID_genero, ID_jogo) VALUES (?, ?)",
          [generoId, jogoId]
        );

        console.log(
          `Vínculo entre jogo ${jogoId} e gênero ${generoId} criado.`
        );
      }
    }

    // Se tudo der certo, efetiva a transação
    await connection.commit();

    // A LINHA ABAIXO É A CORREÇÃO! Mude de .alert para .send() ou .json()
    res.status(200).send("Jogo, categorias e gêneros adicionados com sucesso!");
  } catch (err) {
    // Se houver qualquer erro, desfaz a transação para evitar dados parciais
    if (connection) {
      await connection.rollback();
      console.error("Transação desfeita devido a um erro.");
    }
    console.error("Erro na rota /adicionar-jogo:", err.message);
    res.status(500).send("Erro interno do servidor ao adicionar jogo.");
  } finally {
    // Libera a conexão de volta para o pool
    if (connection) {
      connection.release();
      console.log("Conexão liberada.");
    }
  }
});

// ... (Resto do código do bd.js permanece o mesmo) ...

// Rota GET para buscar todos os jogos com suas categorias e gêneros
app.get("/jogos", async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [jogosRows] = await connection.execute("SELECT * FROM jogos");

    const jogosComDetalhes = await Promise.all(
      jogosRows.map(async (jogo) => {
        // Busca categorias do jogo
        const [categoriasRows] = await connection.execute(
          `SELECT c.Nome FROM categoria_jogos AS cj
                 INNER JOIN categoria AS c ON cj.ID_categoria = c.ID_categoria
                 WHERE cj.ID_jogo = ?`,
          [jogo.ID_jogo]
        );
        const categorias = categoriasRows.map((row) => row.Nome);

        // Busca gêneros do jogo
        const [generosRows] = await connection.execute(
          `SELECT g.Nome FROM genero_jogos AS gj
                 INNER JOIN genero AS g ON gj.ID_genero = g.ID_genero
                 WHERE gj.ID_jogo = ?`,
          [jogo.ID_jogo]
        );
        const generos = generosRows.map((row) => row.Nome);

        return {
          ...jogo,
          categorias,
          generos,
        };
      })
    );

    res.status(200).json(jogosComDetalhes);
    console.log("Dados dos jogos enviados com sucesso.");
  } catch (err) {
    console.error("Erro ao buscar jogos:", err.message);
    res.status(500).send("Erro interno do servidor ao buscar os jogos.");
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Rota GET para pesquisar os jogos no banco de dados
app.get("/buscar-jogo", async (req, res) => {
  // Adicione 'async' aqui
  let connection;
  try {
    // Obtenha uma conexão do pool
    connection = await pool.getConnection();

    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ message: 'Parâmetro de busca "query" é obrigatório.' });
    }

    const searchQuery = `%${query}%`;
    const sql = `SELECT * FROM jogos WHERE Nome_jogo LIKE ?`;

    // Use o método .execute() com await, que é a forma correta para mysql2/promise
    const [results] = await connection.execute(sql, [searchQuery]);

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum jogo encontrado com esse nome." });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Erro na rota /buscar-jogo:", err);
    return res
      .status(500)
      .json({ message: "Erro interno do servidor ao buscar jogos." });
  } finally {
    // Sempre libere a conexão de volta ao pool no final
    if (connection) {
      connection.release();
    }
  }
});

// Rota de teste para verificar se o servidor está funcionando
app.get("/", (req, res) => {
  res.status(200).send("Servidor está rodando.");
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
