const mysql = require('mysql2');
require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env

const pool = mysql.createPool({
    host: process.env.DB_HOST ,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME , 
    waitForConnections: true , 
    connectionLimit: 10,     
    queueLimit: 0            
});

// Exporte a versão Promise do pool para usar async/await
const promisePool = pool.promise();

// --- Adicione este bloco para testar a conexão ---
async function testDbConnection() {
    try {
        // Tenta obter uma conexão do pool
        const connection = await promisePool.getConnection();
        // Se conseguir, executa uma consulta trivial para verificar a comunicação
        await connection.query('SELECT 1 + 1 AS solution');
        // Libera a conexão de volta para o pool para que possa ser reutilizada
        connection.release();
        console.log('✅ Conexão com o banco de dados MySQL estabelecida com sucesso!');
    } catch (err) {
        console.error('❌ Erro ao conectar ao banco de dados MySQL:', err.message);
        // Opcional: Se a conexão com o DB é crítica, você pode encerrar a aplicação aqui.
        // Isso evita que a aplicação continue rodando sem acesso ao banco de dados.
        // process.exit(1);
    }
}

// Chame a função de teste assim que o módulo for carregado
testDbConnection();
// --- Fim do bloco de teste ---

module.exports = promisePool;