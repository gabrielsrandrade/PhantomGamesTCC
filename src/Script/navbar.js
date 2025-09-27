import { clerk, initializeAuth } from "./auth.js";
import { setupMultiselect } from "./multiselect.js";

// Variáveis globais para o modal, para manter o estado entre as páginas
let selectedMediaFiles = [];
let gameDataFromFirstPage = {};
let multiselectGenre;
let multiselectCategory;

// Função para exibir modais de mensagem simples
function showCustomMessage(message) {
    const modalContainer = document.createElement("div");
    modalContainer.className = "custom-message-modal";
    modalContainer.innerHTML = `
        <div class="modal-content-message">
            <span class="close-message-btn">&times;</span>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(modalContainer);

    const closeBtn = modalContainer.querySelector(".close-message-btn");
    const close = () => { if (document.body.contains(modalContainer)) document.body.removeChild(modalContainer); };
    closeBtn.addEventListener("click", close);
    modalContainer.addEventListener("click", (e) => { if (e.target === modalContainer) close(); });
}

// Função principal que cria e gerencia o modal de adicionar jogo
async function createAddGameModal() {
    // 1. Buscar dados dinâmicos do backend ANTES de renderizar o modal
    let generos = [];
    let categorias = [];
    try {
        const [generosRes, categoriasRes] = await Promise.all([
            fetch('http://localhost:3000/generos'),
            fetch('http://localhost:3000/categorias')
        ]);
        if (!generosRes.ok || !categoriasRes.ok) throw new Error('Falha ao carregar dados para o formulário.');
        
        generos = await generosRes.json();
        categorias = await categoriasRes.json();
    } catch (error) {
        console.error(error);
        showCustomMessage("Não foi possível carregar o formulário. Verifique a conexão com o servidor.");
        return;
    }

    // Gerar as opções de multiselect dinamicamente
    const generosOptionsHTML = generos.map(g => `<span class="multiselect-option" data-value="${g}">${g}</span>`).join("");
    const categoriasOptionsHTML = categorias.map(c => `<span class="multiselect-option" data-value="${c}">${c}</span>`).join("");

    // 2. Criar a estrutura do Modal
    const overlay = document.createElement("div");
    overlay.classList.add("modal-overlay");

    const modal = document.createElement("div");
    modal.classList.add("add-game-modal");

    // HTML da primeira página do formulário
    const firstPageHTML = `
        <div class="modal-content" id="first-page">
            <button class="close-modal-btn">&times;</button>
            <h2>Adicionar Novo Jogo</h2>
            <form id="add-game-form" novalidate>
                <div class="form-group"><label for="Nome_jogo">Nome do Jogo:</label><input type="text" id="Nome_jogo" required></div>
                <div class="form-group"><label for="Descricao_jogo">Descrição:</label><textarea id="Descricao_jogo" required></textarea></div>
                <div class="form-group"><label for="Preco_jogo">Preço (R$):</label><input type="number" id="Preco_jogo" step="0.01" required min="0"></div>
                <div class="form-group"><label for="Desconto_jogo">Desconto (%):</label><input type="number" id="Desconto_jogo" min="0" max="100"></div>
                <div class="form-group"><label for="Logo_jogo">Logo (URL):</label><input type="url" id="Logo_jogo"></div>
                <div class="form-group"><label for="Capa_jogo">Capa (URL):</label><input type="url" id="Capa_jogo" required></div>
                <div class="form-group">
                    <label for="Faixa_etaria">Faixa Etária:</label>
                    <select id="Faixa_etaria" required>
                        <option value="L">L - Livre</option><option value="10">10+</option><option value="12">12+</option>
                        <option value="14">14+</option><option value="16">16+</option><option value="18">18+</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Gêneros:</label>
                    <div class="multiselect-container" id="multiselect-genre">
                        <div class="multiselect-tags"></div>
                        <div class="multiselect-dropdown hidden">${generosOptionsHTML}</div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Categorias:</label>
                    <div class="multiselect-container" id="multiselect-category">
                        <div class="multiselect-tags"></div>
                        <div class="multiselect-dropdown hidden">${categoriasOptionsHTML}</div>
                    </div>
                </div>
                <div class="form-buttons">
                    <button type="button" class="clear-btn">Limpar</button>
                    <button type="button" class="next-btn">Próximo</button>
                </div>
            </form>
        </div>
    `;

    // HTML da segunda página do formulário
    const secondPageHTML = `
        <div class="modal-content" id="second-page" style="display: none;">
            <button class="close-modal-btn">&times;</button>
            <h2>Adicionar Mídias</h2>
            <div class="form-group"><label for="media-upload">Selecionar Imagens/Vídeos:</label><input type="file" id="media-upload" multiple accept="image/*,video/*"></div>
            <p>Total de mídias: <span id="media-count">0</span></p>
            <div id="media-preview-container" class="media-preview-container"></div>
            <div class="form-buttons">
                <button type="button" class="back-btn">Voltar</button>
                <button type="button" class="submit-btn">Adicionar Jogo</button>
            </div>
        </div>
    `;

    modal.innerHTML = firstPageHTML + secondPageHTML;
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    // 3. Adicionar Lógica e Event Listeners
    const firstPage = modal.querySelector("#first-page");
    const secondPage = modal.querySelector("#second-page");

    multiselectGenre = setupMultiselect("multiselect-genre");
    multiselectCategory = setupMultiselect("multiselect-category");

    const closeModal = () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
        selectedMediaFiles = [];
        gameDataFromFirstPage = {};
    };

    modal.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    
    firstPage.querySelector('.next-btn').addEventListener('click', () => {
        const form = firstPage.querySelector('form');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        gameDataFromFirstPage = {
            Nome_jogo: document.getElementById('Nome_jogo').value,
            Descricao_jogo: document.getElementById('Descricao_jogo').value,
            Preco_jogo: document.getElementById('Preco_jogo').value,
            Desconto_jogo: document.getElementById('Desconto_jogo').value,
            Logo_jogo: document.getElementById('Logo_jogo').value,
            Capa_jogo: document.getElementById('Capa_jogo').value,
            Faixa_etaria: document.getElementById('Faixa_etaria').value,
            generos: multiselectGenre.getValues(),
            categorias: multiselectCategory.getValues(),
        };
        firstPage.style.display = 'none';
        secondPage.style.display = 'block';
    });

    secondPage.querySelector('.back-btn').addEventListener('click', () => {
        secondPage.style.display = 'none';
        firstPage.style.display = 'block';
    });

    const mediaInput = secondPage.querySelector("#media-upload");
    const previewContainer = secondPage.querySelector("#media-preview-container");
    const mediaCountSpan = secondPage.querySelector("#media-count");

    mediaInput.addEventListener("change", (e) => {
        selectedMediaFiles.push(...Array.from(e.target.files));
        mediaInput.value = "";
        renderMediaPreviews();
    });

    function renderMediaPreviews() {
        previewContainer.innerHTML = "";
        mediaCountSpan.textContent = selectedMediaFiles.length;
        selectedMediaFiles.forEach((file, index) => {
            const item = document.createElement("div");
            item.className = "media-preview-item";
            const fileURL = URL.createObjectURL(file);
            item.innerHTML = `
                ${file.type.startsWith("image/") ? `<img src="${fileURL}" alt="${file.name}">` : `<video src="${fileURL}"></video>`}
                <span>${file.name}</span>
                <button class="remove-media-btn" data-index="${index}">Remover</button>
            `;
            previewContainer.appendChild(item);
        });
    }

    previewContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-media-btn')) {
            const indexToRemove = parseInt(e.target.dataset.index, 10);
            selectedMediaFiles = selectedMediaFiles.filter((_, index) => index !== indexToRemove);
            renderMediaPreviews();
        }
    });

    secondPage.querySelector('.submit-btn').addEventListener('click', async (e) => {
        const submitBtn = e.target;
        submitBtn.disabled = true;
        submitBtn.textContent = "Adicionando...";

        const formData = new FormData();
        formData.append("Nome_jogo", gameDataFromFirstPage.Nome_jogo);
        formData.append("Descricao_jogo", gameDataFromFirstPage.Descricao_jogo);
        formData.append("Preco_jogo", gameDataFromFirstPage.Preco_jogo);
        formData.append("Desconto_jogo", parseFloat(gameDataFromFirstPage.Desconto_jogo) || 0);
        formData.append("Logo_jogo", gameDataFromFirstPage.Logo_jogo);
        formData.append("Capa_jogo", gameDataFromFirstPage.Capa_jogo);
        formData.append("Faixa_etaria", gameDataFromFirstPage.Faixa_etaria);
        formData.append("generos", JSON.stringify(gameDataFromFirstPage.generos));
        formData.append("categorias", JSON.stringify(gameDataFromFirstPage.categorias));
        
        selectedMediaFiles.forEach(file => formData.append("Midias_jogo", file));

        try {
            const token = await clerk.session.getToken();
            const response = await fetch("http://localhost:3000/adicionar-jogo-file", {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Erro desconhecido.");

            showCustomMessage("Jogo adicionado com sucesso!");
            document.dispatchEvent(new Event("gameUpdated"));
            closeModal();

        } catch (error) {
            console.error("Erro ao adicionar jogo:", error);
            showCustomMessage(`Erro: ${error.message}`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Adicionar Jogo";
        }
    });
}

// Lógica da Barra de Navegação e da Busca
// ##### INÍCIO DA CORREÇÃO #####
function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById("search-input");
    const query = searchInput.value.trim(); // Usa trim() para ignorar espaços em branco

    if (!query) { // Se a busca for vazia, não faz nada
        return;
    }

    // Verifica se a página atual é a 'navegar.html'
    const isNavegarPage = window.location.pathname.includes("navegar.html");

    if (isNavegarPage) {
        // Se já está na página, apenas dispara um evento para ela mesma lidar com a busca
        const customEvent = new CustomEvent("searchSubmitted", { detail: { query } });
        document.dispatchEvent(customEvent);
    } else {
        // Se está em outra página, redireciona para 'navegar.html' com a query na URL
        window.location.href = `navegar.html?query=${encodeURIComponent(query)}`;
    }
}
// ##### FIM DA CORREÇÃO #####


function renderNavbar({ isSignedIn, isAdmin }) {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    let navbarHTML = "";

    if (isSignedIn) {
        if (isAdmin) { // Admin Logado
            navbarHTML = `
                <div class="logadoA">
                    <ul>
                        <li><a href="homepage.html"><img src="../../assets/imagens/logo-png.png" alt="Logo"></a></li>
                        <li><a href="homepage.html">Descobrir</a></li>
                        <li><a href="navegar.html">Navegar</a></li>
                    </ul>
                    <form class="search-bar" id="search-form"><input type="search" placeholder="Pesquisar..." id="search-input"></form>
                    <button id="add-game-btn">Adicionar Jogo</button>
                    <div id="user-button"></div>
                </div>`;
        } else { // Membro Logado
            navbarHTML = `
                <div class="logadoM">
                    <ul>
                        <li><a href="homepage.html"><img class="logo" src="../../assets/imagens/logo-png.png" alt="Logo"></a></li>
                        <li><a href="homepage.html">Descobrir</a></li>
                        <li><a href="navegar.html">Navegar</a></li>
                        <li><a href="suporte.html">Suporte</a></li>
                        <li><a href="biblioteca.html">Biblioteca</a></li>
                    </ul>
                    <form class="search-bar" id="search-form"><input type="search" placeholder="Pesquisar..." id="search-input"></form>
                    <div class="left">
                        <a href="lista-desejos.html"><img class="carrinho" src="../../assets/imagens/lista-desejos.png" alt="Carrinho"></a>
                        <a href="carrinho.html"><img class="carrinho" src="../../assets/imagens/carrinho.png" alt="Carrinho"></a>
                        <div id="user-button"></div>
                    </div>
                </div>`;
        }
    } else { // Deslogado
        navbarHTML = `
            <div class="deslogado">
                <ul>
                    <li><a href="homepage.html"><img class="logo" src="../../assets/imagens/logo-png.png" alt="Logo"></a></li>
                    <li><a href="homepage.html">Descobrir</a></li>
                    <li><a href="navegar.html">Navegar</a></li>
                    <li><a href="suporte.html">Suporte</a></li>
                </ul>
                <form class="search-bar" id="search-form"><input type="search" placeholder="Pesquisar..." id="search-input"></form>
                <a href="login.html"><button>Entrar</button></a>
            </div>`;
    }

    navbar.innerHTML = navbarHTML;

    // Adiciona event listeners após a renderização
    const searchForm = document.getElementById("search-form");
    if (searchForm) searchForm.addEventListener("submit", handleSearch);
    
    // Adiciona listener para limpar a busca se o campo ficar vazio
    const searchInput = document.getElementById("search-input");
    if (searchInput && window.location.pathname.includes('navegar.html')) {
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() === '') {
                const customEvent = new CustomEvent('searchSubmitted', { detail: { query: '' } });
                document.dispatchEvent(customEvent);
            }
        });
    }


    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query");
    if (searchInput && query) searchInput.value = query;

    if (isSignedIn) {
        const userButtonDiv = document.getElementById("user-button");
        if (userButtonDiv) clerk.mountUserButton(userButtonDiv);

        if (isAdmin) {
            const addButton = document.getElementById("add-game-btn");
            if (addButton) addButton.addEventListener("click", createAddGameModal);
        }
    }
}

// Ponto de entrada principal do script
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const authData = await initializeAuth();
        renderNavbar(authData);
    } catch (error) {
        console.error("Falha na inicialização:", error);
        renderNavbar({ isSignedIn: false, isAdmin: false });
    }
});