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
        document.querySelector('.cards_carrinho').innerHTML = '<h2>Seu carrinho está vazio</h2><p>Você precisa estar logado para ver seu carrinho. <a href="login.html">Faça Login</a></p>';
        document.querySelector('.total').style.display = 'none';
        return;
    }
    
    carregarCarrinho();

    const botaoFinalizar = document.querySelector('.total button');
    if (botaoFinalizar) {
        botaoFinalizar.addEventListener('click', finalizarCompra);
    }
});

async function carregarCarrinho() {
    const containerCards = document.querySelector('.cards_carrinho');
    const containerResumo = document.querySelector('.resumo_jogos');
    const containerValorTotal = document.querySelector('.total .valor p');

    try {
        if (!clerk.session) {
             throw new Error("A sessão do usuário não está ativa. Tente recarregar a página.");
        }
        const token = await clerk.session.getToken();

        const response = await fetch('http://localhost:3000/carrinho', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            if(response.status === 401) throw new Error("Sessão inválida ou expirada. Faça login novamente.");
            throw new Error('Não foi possível carregar os itens do carrinho.');
        }

        const jogos = await response.json();
        
        containerCards.innerHTML = '';
        const resumosAntigos = containerResumo.querySelectorAll('.espaço');
        if(resumosAntigos) resumosAntigos.forEach(el => el.remove());

        if (jogos.length === 0) {
            containerCards.innerHTML = '<p>Seu carrinho está vazio.</p>';
            document.querySelector('.total').style.display = 'none';
            return;
        }

        document.querySelector('.total').style.display = 'block';
        let totalCompra = 0;

        jogos.forEach(jogo => {
            const preco = parseFloat(jogo.Preco_jogo);
            const desconto = parseFloat(jogo.Desconto_jogo);
            const precoFinal = desconto > 0 ? preco * (1 - desconto / 100) : preco;
            totalCompra += precoFinal;

            const cardHTML = `
                <div class="card_carrinho" id="jogo-card-${jogo.ID_jogo}">
                    <div class="capa_card">
                        <img src="${jogo.Capa_jogo}" alt="Capa do jogo ${jogo.Nome_jogo}">
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
                            <button class="botao2 btn-add-desejos" data-jogo-id="${jogo.ID_jogo}">Mover para Desejos</button>
                        </div>
                    </div>
                </div>
            `;
            containerCards.insertAdjacentHTML('beforeend', cardHTML);
            
            const resumoLinhaHTML = `<div class="espaço"><p>${jogo.Nome_jogo}</p><p>R$ ${precoFinal.toFixed(2).replace('.', ',')}</p></div>`;
            containerResumo.insertAdjacentHTML('beforeend', resumoLinhaHTML);
        });

        containerValorTotal.textContent = `R$ ${totalCompra.toFixed(2).replace('.', ',')}`;

        document.querySelectorAll('.btn-remover').forEach(button => button.addEventListener('click', removerDoCarrinho));
        document.querySelectorAll('.btn-add-desejos').forEach(button => button.addEventListener('click', moverParaDesejos));

    } catch (error) {
        console.error("Erro ao carregar Carrinho:", error);
        containerCards.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
}
async function removerDoCarrinho(event) {
    const jogoId = event.target.dataset.jogoId;
    if (!jogoId) return;

    const confirmado = await createConfirmModal('Tem certeza que deseja remover este jogo do carrinho?');
    if (!confirmado) return;

    const token = await clerk.session.getToken();
    try {
        const response = await fetch(`http://localhost:3000/carrinho/remover/${jogoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao remover o item.');
        
        showMessage("Jogo removido do carrinho.", "success");
        carregarCarrinho();
    } catch(error) {
        showMessage(error.message, "error");
    }
}

async function moverParaDesejos(event) {
    const jogoId = event.target.dataset.jogoId;
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Movendo...';

    const token = await clerk.session.getToken();
    try {
        const addResponse = await fetch('http://localhost:3000/desejos/adicionar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ ID_jogo: jogoId })
        });
        if (!addResponse.ok) throw new Error('Falha ao adicionar à lista de desejos.');

        const removeResponse = await fetch(`http://localhost:3000/carrinho/remover/${jogoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!removeResponse.ok) throw new Error('Falha ao remover do carrinho.');

        showMessage("Jogo movido para a Lista de Desejos!", "success");
        carregarCarrinho();
    } catch(error) {
        showMessage(error.message, "error");
        btn.disabled = false;
        btn.textContent = 'Mover para Desejos';
    }
}

async function finalizarCompra() {
    const stripe = Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    
    const botao = document.querySelector('.total button');
    botao.disabled = true;
    botao.textContent = 'Indo para o pagamento...';

    try {
        const token = await clerk.session.getToken();
        
        const response = await fetch('http://localhost:3000/criar-sessao-de-pagamento', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const session = await response.json();
        if (!response.ok) throw new Error(session.error.message);

        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) throw new Error(result.error.message);

    } catch (error) {
        showMessage(`Erro: ${error.message}`, 'error');
        botao.disabled = false;
        botao.textContent = 'Finalizar Compra';
    }
}