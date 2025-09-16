import { Clerk } from '@clerk/clerk-js';

// Chave pública do Clerk. A variável de ambiente é usada para manter a chave segura.
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerk = new Clerk(clerkPubKey);

// Função para exibir uma mensagem personalizada ao usuário, substituindo 'alert()'.
function showCustomMessage(message) {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'custom-message-modal';
    modalContainer.innerHTML = `
        <div class="modal-content-message">
            <span class="close-message-btn">&times;</span>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(modalContainer);

    const closeBtn = modalContainer.querySelector('.close-message-btn');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });

    // Remove o modal se o usuário clicar fora do conteúdo da mensagem.
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            document.body.removeChild(modalContainer);
        }
    });
}

// Cria e configura o modal para adicionar um novo jogo.
function createAddGameModal() {
    const overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    const modal = document.createElement('div');
    modal.classList.add('add-game-modal');

    const genres = ["Ação", "Aventura", "Casual", "Corrida", "Esportes", "Estratégia", "Indie", "Luta", "Musical", "Narrativo", "Plataforma", "Puzzle", "RPG", "Simulação", "Sobrevivência", "Terror", "Tiro"];
    const categories = ["Singleplayer", "Multiplayer Local", "Multiplayer Online", "Co-op", "PvP", "PvE", "MMO", "Cross-Plataform", "2D", "3D", "2.5D", "Top-Down", "Side-Scrooling", "Isométrico", "Primeira Pessoa", "Terceira Pessoa", "Linear", "Mundo Aberto", "Sandbox", "Campanha", "Missões/Fases", "Permadeath", "Rouguelike"];

    // A estrutura do HTML do modal permanece a mesma
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal-btn">&times;</button>
            <h2>Adicionar Novo Jogo</h2>
            <form id="add-game-form">
                <div class="form-group">
                    <label for="Nome_jogo">Nome do Jogo:</label>
                    <input type="text" id="Nome_jogo" name="Nome_jogo" required>
                </div>
                <div class="form-group">
                    <label for="Descricao_jogo">Descrição:</label>
                    <textarea id="Descricao_jogo" name="Descricao_jogo" required></textarea>
                </div>
                <div class="form-group">
                    <label for="Preco_jogo">Preço (R$):</label>
                    <input type="number" id="Preco_jogo" name="Preco_jogo" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="Logo_jogo">Logo (URL da Imagem):</label>
                    <input type="url" id="Logo_jogo" name="Logo_jogo">
                </div>
                <div class="form-group">
                    <label for="Capa_jogo">Capa (URL da Imagem):</label>
                    <input type="url" id="Capa_jogo" name="Capa_jogo" required>
                </div>
               <div class="form-group">
    <label for="Midias_jogo">Imagens/Vídeos (Cole o "Endereço da Imagem" separado por hífen):</label>
    <textarea id="Midias_jogo" name="Midias_jogo" placeholder="Ex: https://url-da-imagem.com/imagem.jpg - https://url-do-video.com/video.mp4"></textarea>
</div>
                <div class="form-group">
                    <label for="Faixa_etaria">Faixa Etária:</label>
                    <select id="Faixa_etaria" name="Faixa_etaria" required>
                        <option value="L">L - Livre</option>
                        <option value="10">10+</option>
                        <option value="12">12+</option>
                        <option value="14">14+</option>
                        <option value="16">16+</option>
                        <option value="18">18+</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Gêneros:</label>
                    <div class="multiselect-container" id="multiselect-genre">
                        <div class="multiselect-tags" id="genre-tags"></div>
                        <div class="multiselect-dropdown hidden" id="genre-dropdown">
                            ${genres.map(g => `<span class="multiselect-option" data-value="${g}">${g}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label>Categorias:</label>
                    <div class="multiselect-container" id="multiselect-category">
                        <div class="multiselect-tags" id="category-tags"></div>
                        <div class="multiselect-dropdown hidden" id="category-dropdown">
                            ${categories.map(c => `<span class="multiselect-option" data-value="${c}">${c}</span>`).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="form-buttons">
                    <button type="button" class="clear-btn">Limpar</button>
                    <button type="submit" class="submit-btn">Adicionar</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    const closeModalBtn = modal.querySelector('.close-modal-btn');
    closeModalBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        }
    });

    function setupMultiselect(containerId) {
        const container = document.getElementById(containerId);
        const tagsDiv = container.querySelector('.multiselect-tags');
        const dropdown = container.querySelector('.multiselect-dropdown');
        let selectedValues = [];

        const renderTags = () => {
            tagsDiv.innerHTML = '';
            if (selectedValues.length === 0) {
                tagsDiv.textContent = "Clique para adicionar...";
                tagsDiv.classList.add('placeholder');
            } else {
                tagsDiv.classList.remove('placeholder');
                selectedValues.forEach(value => {
                    const tag = document.createElement('span');
                    tag.classList.add('multiselect-tag');
                    tag.textContent = value;
                    const closeBtn = document.createElement('span');
                    closeBtn.classList.add('tag-close');
                    closeBtn.innerHTML = '&times;';
                    closeBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        selectedValues = selectedValues.filter(v => v !== value);
                        renderTags();
                        updateDropdown();
                    });
                    tag.appendChild(closeBtn);
                    tagsDiv.appendChild(tag);
                });
            }
        };

        const updateDropdown = () => {
            const options = dropdown.querySelectorAll('.multiselect-option');
            options.forEach(option => {
                if (selectedValues.includes(option.dataset.value)) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            });
        };

        tagsDiv.addEventListener('click', () => {
            dropdown.classList.toggle('hidden');
        });

        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.multiselect-option');
            if (!option || option.classList.contains('selected')) return;

            const value = option.dataset.value;
            if (!selectedValues.includes(value)) {
                selectedValues.push(value);
                renderTags();
                updateDropdown();
            }
            dropdown.classList.add('hidden');
        });

        const reset = () => {
            selectedValues = [];
            renderTags();
            updateDropdown();
        };

        renderTags();
        updateDropdown();

        return {
            getValues: () => selectedValues,
            reset: reset
        };
    }

    const multiselectGenre = setupMultiselect('multiselect-genre');
    const multiselectCategory = setupMultiselect('multiselect-category');

    const addGameForm = modal.querySelector('#add-game-form');

    addGameForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar campos obrigatórios
        const nomeJogo = addGameForm.Nome_jogo.value.trim();
        const precoJogo = parseFloat(addGameForm.Preco_jogo.value);
        const capaJogo = addGameForm.Capa_jogo.value.trim();

        if (!nomeJogo || isNaN(precoJogo) || !capaJogo) {
            showCustomMessage("Por favor, preencha todos os campos obrigatórios (Nome, Preço e Capa).");
            return;
        }

        const midiasValue = addGameForm.Midias_jogo.value;
        const midiasArray = midiasValue.split('-').map(item => item.trim()).filter(item => item.length > 0);

        const gameData = {
            Nome_jogo: nomeJogo,
            Descricao_jogo: addGameForm.Descricao_jogo.value,
            Preco_jogo: precoJogo,
            Logo_jogo: addGameForm.Logo_jogo.value,
            Capa_jogo: capaJogo,
            Midias_jogo: midiasArray,
            Faixa_etaria: addGameForm.Faixa_etaria.value,
            categorias: multiselectCategory.getValues(),
            generos: multiselectGenre.getValues()
        };

        const submitBtn = addGameForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adicionando...';

        try {
            const response = await fetch('http://localhost:3000/adicionar-jogo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gameData),
            });

            const result = await response.text();

            if (response.ok) {
                showCustomMessage(result);
                addGameForm.reset();
                multiselectGenre.reset();
                multiselectCategory.reset();
                document.body.removeChild(modal);
                document.body.removeChild(overlay);

                document.dispatchEvent(new Event('gameUpdated'));

            } else {
                showCustomMessage('Erro ao adicionar jogo: ' + result);
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            showCustomMessage('Ocorreu um erro ao conectar com o servidor.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Adicionar';
        }
    });

    const clearButton = modal.querySelector('.clear-btn');
    clearButton.addEventListener('click', () => {
        addGameForm.reset();
        multiselectGenre.reset();
        multiselectCategory.reset();
    });
}


// Lida com a submissão do formulário de busca.
function handleSearch(event) {
    event.preventDefault(); // Evita o recarregamento padrão do formulário
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value;

    if (query.trim() === '') {
        // Se a busca estiver vazia, acionamos um evento para limpar os resultados
        if (window.location.pathname.includes('navegar.html')) {
            const customEvent = new CustomEvent('searchSubmitted', { detail: { query: '' } });
            document.dispatchEvent(customEvent);
        } else {
            // Se não estiver em navegar.html, redireciona para lá
            window.location.href = `navegar.html`;
        }
        return;
    }

    if (window.location.pathname.includes('navegar.html')) {
        // Se estiver, dispara um evento personalizado com a query
        const customEvent = new CustomEvent('searchSubmitted', { detail: { query } });
        document.dispatchEvent(customEvent);
    } else {
        // Se não estiver, redireciona para a página de navegação com a query
        window.location.href = `navegar.html?query=${encodeURIComponent(query)}`;
    }
}

// Renderiza a barra de navegação com base no estado de login do usuário.
function renderNavbar(user) {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const isSignedIn = !!user;
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    let navbarHTML = '';

    if (isSignedIn) {
        if (userEmail === "phantomgamestcc@gmail.com") {
            // HTML para o usuário administrador
            navbarHTML = `
                <div class="logadoA">
                    <ul>
                        <li><img src="../../assets/imagens/logo-png.png" alt="Logo"></li>
                        <li><a href="homepage.html">Descobrir</a></li>
                        <li><a href="navegar.html">Navegar</a></li>
                    </ul>
                    <form class="search-bar" id="search-form">
                        <input type="search" placeholder="Pesquisar..." id="search-input">
                    </form>
                    <a><button id="add-game-btn">Adicionar Jogo</button></a>
                    <div id="user-button"></div>
                </div>
            `;
        } else {
            // HTML para um usuário logado comum.
            navbarHTML = `
                <div class="logadoM">
                    <ul>
                        <li><img class="logo" src="../../assets/imagens/logo-png.png" alt="Logo"></li>
                        <li><a href="homepage.html">Descobrir</a></li>
                        <li><a href="navegar.html">Navegar</a></li>
                        <li><a href="suporte.html">Suporte</a></li>
                        <li><a href="biblioteca.html">Biblioteca</a></li>
                    </ul>
                    <form class="search-bar" id="search-form">
                        <input type="search" placeholder="Pesquisar..." id="search-input">
                    </form>
                    <div class="left">
                        <li><img class="carrinho" src="../../assets/imagens/carrinho.png" alt="Logo"></li>
                        <div id="user-button"></div>
                    </div>
                </div>
            `;
        }
    } else {
        // HTML para um usuário deslogado.
        navbarHTML = `
            <div class="deslogado">
                <ul>
                    <li><img class="logo" src="../../assets/imagens/logo-png.png" alt="Logo"></li>
                    <li><a href="homepage.html">Descobrir</a></li>
                    <li><a href="navegar.html">Navegar</a></li>
                    <li><a href="suporte.html">Suporte</a></li>
                </ul>
                <form class="search-bar" id="search-form">
                    <input type="search" placeholder="Pesquisar..." id="search-input">
                </form>
                <a href="login.html"><button>Entrar</button></a>
            </div>
        `;
    }

    navbar.innerHTML = navbarHTML;

    // Adiciona o event listener para o formulário de busca em qualquer estado.
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    // Adiciona um listener para monitorar o input e o evento de "enter"
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // Evento para a tecla 'Enter'
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === 'Enter') {
                handleSearch(event);
            }
        });

        // Evento para monitorar a limpeza do input (seja por digitação ou pelo 'X')
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() === '') {
                // Dispara um evento vazio para limpar a busca
                if (window.location.pathname.includes('navegar.html')) {
                    const customEvent = new CustomEvent('searchSubmitted', { detail: { query: '' } });
                    document.dispatchEvent(customEvent);
                }
            }
        });
    }

    if (isSignedIn) {
        // Renderiza o UserButton se o usuário estiver logado
        const userButtonDiv = document.getElementById('user-button');
        if (userButtonDiv) {
            clerk.mountUserButton(userButtonDiv);
        }

        // Lógica para o botão de adicionar jogo do admin
        if (userEmail === "phantomgamestcc@gmail.com") {
            const addButton = document.getElementById('add-game-btn');
            if (addButton) {
                addButton.addEventListener('click', createAddGameModal);
            }
        }
    }

    // Preenche o input de busca se houver um parâmetro na URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    if (searchInput && query) {
        searchInput.value = query;
    }
}

// Quando o documento estiver completamente carregado, inicializa o Clerk.
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await clerk.load();

        // Adiciona um listener para atualizar a navbar sempre que o estado do usuário mudar.
        clerk.addListener(({ user }) => {
            renderNavbar(user);
        });

        // Renderiza a navbar com o estado inicial do usuário.
        renderNavbar(clerk.user);

    } catch (error) {
        console.error('Erro ao inicializar Clerk:', error);
    }
});