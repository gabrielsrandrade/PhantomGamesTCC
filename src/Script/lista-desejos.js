import { clerk, initializeAuth } from "./auth.js";

//FUNÇÕES DE UTILIDADE (MODAIS)
function showMessage(message, type = "success") {
    const modal = document.createElement("div");
    modal.className = `custom-message-modal ${type}`;
    modal.innerHTML = `<div class="modal-content-message"><p>${message}</p><span class="close-message-btn">&times;</span></div>`;
    document.body.appendChild(modal);
    const close = () => { if (document.body.contains(modal)) document.body.removeChild(modal); };
    modal.querySelector('.close-message-btn').addEventListener('click', close);
    setTimeout(close, 1000);
}

function createConfirmModal(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
            <div class="confirm-modal" style="background-color: var(--navbar-color); padding: 2rem; border-radius: 10px; color: white; text-align: center;">
                <p>${message}</p>
                <div class="confirm-buttons" style="display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: center;">
                    <button id="confirm-yes" style="padding: 0.5rem 2rem; background-color: var(--button-color); color: white; border-radius: 6px; font-weight: 600; cursor: pointer;">Sim</button>
                    <button id="confirm-no" style="padding: 0.5rem 2rem; background-color: transparent; color: var(--non-selected-color); border-radius: 6px; font-weight: 600; border: 1px solid var(--non-selected-color); cursor: pointer;">Não</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        const close = (value) => { document.body.removeChild(overlay); resolve(value); };
        overlay.querySelector("#confirm-yes").onclick = () => close(true);
        overlay.querySelector("#confirm-no").onclick = () => close(false);
    });
}


document.addEventListener("DOMContentLoaded", async () => {
    const authData = await initializeAuth(); 

    if (!authData.isSignedIn) {
        document.querySelector('.cards_carrinho').innerHTML = '<h2>Sua lista está vazia</h2><p>Você precisa estar logado para ver sua lista de desejos. <a href="login.html">Faça Login</a></p>';
        return;
    }
    carregarListaDeDesejos();
});

async function carregarListaDeDesejos() {
    const container = document.querySelector('.cards_carrinho');
    
    try {
        if (!clerk.session) {
             throw new Error("A sessão do usuário não está ativa. Tente recarregar a página.");
        }
        const token = await clerk.session.getToken();

        const response = await fetch('http://localhost:3000/desejos', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            if(response.status === 401) throw new Error("Sessão inválida ou expirada. Faça login novamente.");
            throw new Error('Não foi possível carregar a lista de desejos.');
        }

        const jogos = await response.json();
        container.innerHTML = '';

        if (jogos.length === 0) {
            container.innerHTML = '<p>Sua lista de desejos está vazia.</p>';
            return;
        }

        jogos.forEach(jogo => {
            const preco = parseFloat(jogo.Preco_jogo);
            const desconto = parseFloat(jogo.Desconto_jogo);
            const precoFinal = desconto > 0 ? preco * (1 - desconto / 100) : preco;

            const cardHTML = `
                <div class="card_carrinho" id="jogo-card-${jogo.ID_jogo}">
                    <div class="capa_card">
                        <img src="${jogo.Capa_jogo}" alt="Capa de ${jogo.Nome_jogo}">
                    </div>
                    <div class="dados_jogos">
                        <div>
                            <div class="espaço">
                                <h2>${jogo.Nome_jogo}</h2>
                                <h2>R$ ${precoFinal.toFixed(2).replace('.', ',')}</h2>
                            </div>
                            <img src="../../assets/imagens/${(jogo.Faixa_etaria || 'l').toLowerCase()}.png" alt="Faixa etária" />
                        </div>
                        <div class="botoes_card">
                            <button class="botao1 btn-remover" data-jogo-id="${jogo.ID_jogo}">Remover</button>
                            <button class="botao2 btn-add-carrinho" data-jogo-id="${jogo.ID_jogo}">Adicionar ao Carrinho</button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

        document.querySelectorAll('.btn-remover').forEach(btn => btn.addEventListener('click', removerDaLista));
        document.querySelectorAll('.btn-add-carrinho').forEach(btn => btn.addEventListener('click', adicionarAoCarrinho));

    } catch (error) {
        console.error("Erro ao carregar Lista de Desejos:", error);
        container.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}

async function removerDaLista(event) {
    const jogoId = event.target.dataset.jogoId;
    
    const confirmado = await createConfirmModal('Remover este jogo da sua lista de desejos?');
    if (!confirmado) return;

    const token = await clerk.session.getToken();
    try {
        const response = await fetch(`http://localhost:3000/desejos/remover/${jogoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao remover.');
        
        showMessage("Jogo removido da lista de desejos.", "success");
        carregarListaDeDesejos();
    } catch (error) {
        showMessage(error.message, "error");
    }
}

async function adicionarAoCarrinho(event) {
    const jogoId = event.target.dataset.jogoId;
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Movendo...';

    const token = await clerk.session.getToken();
    try {
        const addResponse = await fetch('http://localhost:3000/carrinho/adicionar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ID_jogo: jogoId })
        });
        if (!addResponse.ok) throw new Error('Falha ao adicionar ao carrinho.');
        
        const removeResponse = await fetch(`http://localhost:3000/desejos/remover/${jogoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!removeResponse.ok) throw new Error('Falha ao remover da lista de desejos.');

        showMessage("Jogo movido para o carrinho!", "success");

        setTimeout(() => {
            window.location.href = 'carrinho.html';
        }, 1500);

    } catch (error) {
        showMessage(error.message, "error");
        btn.disabled = false;
        btn.textContent = 'Adicionar ao Carrinho';
    }
}