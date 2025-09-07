// admin.js

// // Pega o formulário e o botão de submit pelo ID
// const form = document.getElementById('add-game-form');
// const submitButton = document.querySelector('#add-game-form button[type="submit"]');

// // Adiciona um listener para o evento de submit do formulário
// form.addEventListener('submit', async (e) => {
//     e.preventDefault(); // Impede o envio padrão do formulário, que recarregaria a página

//     // Pega os valores dos campos
//     const Nome_jogo = document.querySelector("#Nome_jogo").value;
//     const Preco_jogo = document.querySelector("#Preco_jogo").value;
//     const Logo_jogo = document.querySelector("#Logo_jogo").value;
//     const Descricao_jogo = document.querySelector("#Descricao_jogo").value;
//     const Capa_jogo = document.querySelector("#Capa_jogo").value;
//     const Midias_jogo = document.querySelector("#Midias_jogo").value;
//     const Faixa_etaria = document.querySelector("#Faixa_etaria").value;
//     const ID_categoria = document.querySelector("#ID_categoria").value;
//     const ID_genero = document.querySelector("#ID_genero").value;

//     // Cria um objeto com os dados para enviar ao servidor
//     const gameData = {
//         Nome_jogo: Nome_jogo,
//         Preco_jogo: Preco_jogo,
//         Logo_jogo: Logo_jogo,
//         Descricao_jogo: Descricao_jogo,
//         Capa_jogo: Capa_jogo,
//         Midias_jogo: Midias_jogo,
//         Faixa_etaria: Faixa_etaria,
//         ID_categoria: ID_categoria,
//         ID_genero: ID_genero
//     };

//     try {
//         // Envia os dados para a rota do servidor usando a API Fetch
//         const response = await fetch('http://localhost:3000/adicionar-jogo', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json', // Informa ao servidor que o corpo é JSON
//             },
//             body: JSON.stringify(gameData), // Converte o objeto JavaScript para JSON
//         });

//         const result = await response.text(); // Pega a resposta do servidor

//         if (response.ok) { // Verifica se a requisição foi bem-sucedida (código 200)
//             alert(result); // Exibe a mensagem de sucesso
//             form.reset(); // Limpa o formulário após o sucesso
//         } else {
//             alert('Erro: ' + result); // Exibe a mensagem de erro
//         }
//     } catch (error) {
//         console.error('Erro na requisição:', error);
//         alert('Ocorreu um erro ao conectar com o servidor.');
//     }
// });

// A função que cria o modal e adiciona o formulário à página
function createAddGameModal() {
    // ... seu código para criar o modal (overlay e modal.innerHTML) ...

    // Anexa o modal ao corpo do documento
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // --- A LÓGICA DE EVENTOS É MOVIDA PARA AQUI ---

    // Pega o formulário APÓS ele ter sido adicionado à página
    const form = modal.querySelector('#add-game-form');

    // Agora que o formulário existe, adicionamos o listener de submit
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Pega os valores dos campos
            // Usar 'form.querySelector' é melhor pois limita a busca ao formulário
            const Nome_jogo = form.querySelector("#Nome_jogo").value;
            const Descricao_jogo = form.querySelector("#Descricao_jogo").value;
            const Preco_jogo = form.querySelector("#Preco_jogo").value;
            const Logo_jogo = form.querySelector("#Logo_jogo").value;
            const Capa_jogo = form.querySelector("#Capa_jogo").value;
            const Midias_jogo = form.querySelector("#Midias_jogo").value;
            const Faixa_etaria = form.querySelector("#Faixa_etaria").value;
            
            // Note que ID_categoria e ID_genero não estão no seu formulário HTML.
            // Você precisa adicioná-los no HTML do modal ou removê-los do objeto gameData.
            // const ID_categoria = form.querySelector("#ID_categoria")?.value || null;
            // const ID_genero = form.querySelector("#ID_genero")?.value || null;


            // Cria o objeto com os dados
            const gameData = {
                Nome_jogo: Nome_jogo,
                Descricao_jogo: Descricao_jogo,
                Preco_jogo: Preco_jogo,
                Logo_jogo: Logo_jogo,
                Capa_jogo: Capa_jogo,
                Midias_jogo: Midias_jogo,
                Faixa_etaria: Faixa_etaria,
                // ID_categoria: ID_categoria,
                // ID_genero: ID_genero
            };

            try {
                // Envia os dados para a API
                const response = await fetch('http://localhost:3000/adicionar-jogo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(gameData),
                });

                const result = await response.text();

                if (response.ok) {
                    alert(result);
                    form.reset();
                    // Opcional: Feche o modal após o sucesso
                    document.body.removeChild(modal);
                    document.body.removeChild(overlay);
                } else {
                    alert('Erro: ' + result);
                }
            } catch (error) {
                console.error('Erro na requisição:', error);
                alert('Ocorreu um erro ao conectar com o servidor.');
            }
        });
    } else {
        console.error("Erro: Formulário 'add-game-form' não encontrado no modal.");
    }
    
    // ... o restante da lógica do seu modal (fechar modal, etc.) ...
}