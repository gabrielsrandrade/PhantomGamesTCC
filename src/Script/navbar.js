import { clerk, initializeAuth } from "./auth.js";

// Variáveis globais para o modal de adicionar jogo
let selectedMediaFiles = [];
let gameData = {};
let multiselectGenre;
let multiselectCategory;

// Funções do Modal de Mensagem
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
    closeBtn.addEventListener("click", () => {
        document.body.removeChild(modalContainer);
    });

    modalContainer.addEventListener("click", (e) => {
        if (e.target === modalContainer) {
            document.body.removeChild(modalContainer);
        }
    });
}

// Funções do Modal de Adicionar Jogo
function createAddGameModal() {
    const overlay = document.createElement("div");
    overlay.classList.add("modal-overlay");

    const modal = document.createElement("div");
    modal.classList.add("add-game-modal");

    const firstPageHTML = `
        <div class="modal-content" id="first-page">
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
                            ${["Ação", "Aventura", "Casual", "Corrida", "Esportes", "Estratégia", "Indie", "Luta", "Musical", "Narrativo", "Plataforma", "Puzzle", "RPG", "Simulação", "Sobrevivência", "Terror", "Tiro"].map(g => `<span class="multiselect-option" data-value="${g}">${g}</span>`).join("")}
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Categorias:</label>
                    <div class="multiselect-container" id="multiselect-category">
                        <div class="multiselect-tags" id="category-tags"></div>
                        <div class="multiselect-dropdown hidden" id="category-dropdown">
                            ${["Singleplayer", "Multiplayer Local", "Multiplayer Online", "Co-op", "PvP", "PvE", "MMO", "Cross-Plataform", "2D", "3D", "2.5D", "Top-Down", "Side-Scrooling", "Isométrico", "Primeira Pessoa", "Terceira Pessoa", "Linear", "Mundo Aberto", "Sandbox", "Campanha", "Missões/Fases", "Permadeath", "Rouguelike"].map(c => `<span class="multiselect-option" data-value="${c}">${c}</span>`).join("")}
                        </div>
                    </div>
                </div>
                <div class="form-buttons">
                    <button type="button" class="clear-btn">Limpar</button>
                    <button type="button" class="next-btn">Próximo</button>
                </div>
            </form>
        </div>
    `;

    const secondPageHTML = `
        <div class="modal-content" id="second-page">
            <button class="close-modal-btn">&times;</button>
            <h2>Adicionar Mídias</h2>
            <div class="form-group">
                <label for="media-upload">Selecionar Imagens/Vídeos:</label>
                <input type="file" id="media-upload" name="media-upload" multiple accept="image/*,video/*">
            </div>
            <div id="media-preview-container" class="media-preview-container"></div>
            <div class="form-buttons">
                <button type="button" class="back-btn">Voltar</button>
                <button type="submit" class="submit-btn">Adicionar Jogo</button>
            </div>
        </div>
    `;

    modal.innerHTML = firstPageHTML;
    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    function setupMultiselect(containerId) {
        const container = document.getElementById(containerId);
        const tagsDiv = container.querySelector(".multiselect-tags");
        const dropdown = container.querySelector(".multiselect-dropdown");
        let selectedValues = [];

        const renderTags = () => {
            tagsDiv.innerHTML = "";
            if (selectedValues.length === 0) {
                tagsDiv.textContent = "Clique para adicionar...";
                tagsDiv.classList.add("placeholder");
            } else {
                tagsDiv.classList.remove("placeholder");
                selectedValues.forEach((value) => {
                    const tag = document.createElement("span");
                    tag.classList.add("multiselect-tag");
                    tag.textContent = value;
                    const closeBtn = document.createElement("span");
                    closeBtn.classList.add("tag-close");
                    closeBtn.innerHTML = "&times;";
                    closeBtn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        selectedValues = selectedValues.filter((v) => v !== value);
                        renderTags();
                        updateDropdown();
                    });
                    tag.appendChild(closeBtn);
                    tagsDiv.appendChild(tag);
                });
            }
        };

        const updateDropdown = () => {
            const options = dropdown.querySelectorAll(".multiselect-option");
            options.forEach((option) => {
                if (selectedValues.includes(option.dataset.value)) {
                    option.classList.add("selected");
                } else {
                    option.classList.remove("selected");
                }
            });
        };

        tagsDiv.addEventListener("click", () => {
            dropdown.classList.toggle("hidden");
        });

        dropdown.addEventListener("click", (e) => {
            const option = e.target.closest(".multiselect-option");
            if (!option || option.classList.contains("selected")) return;
            const value = option.dataset.value;
            if (!selectedValues.includes(value)) {
                selectedValues.push(value);
                renderTags();
                updateDropdown();
            }
            dropdown.classList.add("hidden");
        });

        const reset = () => {
            selectedValues = [];
            renderTags();
            updateDropdown();
        };

        const setValues = (values) => {
            selectedValues = [...values];
            renderTags();
            updateDropdown();
        };

        renderTags();
        updateDropdown();

        return {
            getValues: () => selectedValues,
            reset: reset,
            setValues: setValues,
        };
    }

    const firstPage = modal.querySelector('#first-page');
    if (firstPage) {
        multiselectGenre = setupMultiselect("multiselect-genre");
        multiselectCategory = setupMultiselect("multiselect-category");
    }

    function navigateToSecondPage() {
        modal.innerHTML = secondPageHTML;
        setupMediaUpload();
        attachEventListeners();
    }

    function navigateToFirstPage() {
        modal.innerHTML = firstPageHTML;
        modal.querySelector("#Nome_jogo").value = gameData.Nome_jogo || "";
        modal.querySelector("#Descricao_jogo").value = gameData.Descricao_jogo || "";
        modal.querySelector("#Preco_jogo").value = gameData.Preco_jogo || "";
        modal.querySelector("#Logo_jogo").value = gameData.Logo_jogo || "";
        modal.querySelector("#Capa_jogo").value = gameData.Capa_jogo || "";
        modal.querySelector("#Faixa_etaria").value = gameData.Faixa_etaria || "L";

        const newMultiselectGenre = setupMultiselect("multiselect-genre");
        const newMultiselectCategory = setupMultiselect("multiselect-category");
        newMultiselectGenre.setValues(gameData.generos || []);
        newMultiselectCategory.setValues(gameData.categorias || []);

        attachEventListeners();
    }

    function attachEventListeners() {
        const closeModalBtn = modal.querySelector(".close-modal-btn");
        closeModalBtn.addEventListener("click", () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        });

        const form = modal.querySelector("#add-game-form");
        if (form) {
            form.querySelector(".next-btn").addEventListener("click", (e) => {
                e.preventDefault();
                const nomeJogo = form.Nome_jogo.value.trim();
                const precoJogo = parseFloat(form.Preco_jogo.value);
                const capaJogo = form.Capa_jogo.value.trim();

                if (!nomeJogo || isNaN(precoJogo) || !capaJogo) {
                    showCustomMessage("Por favor, preencha os campos obrigatórios.");
                    return;
                }

                gameData = {
                    Nome_jogo: nomeJogo,
                    Descricao_jogo: form.Descricao_jogo.value,
                    Preco_jogo: precoJogo,
                    Logo_jogo: form.Logo_jogo.value,
                    Capa_jogo: capaJogo,
                    Faixa_etaria: form.Faixa_etaria.value,
                    categorias: multiselectCategory.getValues(),
                    generos: multiselectGenre.getValues(),
                };
                navigateToSecondPage();
            });

            form.querySelector(".clear-btn").addEventListener("click", () => {
                form.reset();
                multiselectGenre.reset();
                multiselectCategory.reset();
            });
        }

        const backBtn = modal.querySelector(".back-btn");
        if (backBtn) {
            backBtn.addEventListener("click", navigateToFirstPage);
        }

        const submitBtn = modal.querySelector(".submit-btn");
        if (submitBtn) {
            submitBtn.addEventListener("click", handleFormSubmit);
        }
    }

    function setupMediaUpload() {
        const mediaInput = document.getElementById("media-upload");
        const previewContainer = document.getElementById("media-preview-container");
        const fileCountDisplay = document.createElement("p");
        fileCountDisplay.classList.add("media-count-display");
        previewContainer.parentNode.insertBefore(fileCountDisplay, previewContainer);

        function updateFileCountDisplay() {
            if (selectedMediaFiles.length === 0) {
                fileCountDisplay.textContent = "Nenhuma mídia selecionada.";
            } else {
                fileCountDisplay.textContent = `${selectedMediaFiles.length} arquivo(s) selecionado(s)`;
            }
        }

        mediaInput.addEventListener("change", (e) => {
            const newFiles = Array.from(e.target.files);
            selectedMediaFiles = [...selectedMediaFiles, ...newFiles];
            e.target.value = null;
            renderMediaPreviews();
            updateFileCountDisplay();
        });

        function renderMediaPreviews() {
            previewContainer.innerHTML = "";
            selectedMediaFiles.forEach((file) => {
                const fileContainer = document.createElement("div");
                fileContainer.classList.add("media-preview-item");
                const fileURL = URL.createObjectURL(file);
                if (file.type.startsWith("image/")) {
                    const img = document.createElement("img");
                    img.src = fileURL;
                    img.alt = file.name;
                    fileContainer.appendChild(img);
                } else if (file.type.startsWith("video/")) {
                    const video = document.createElement("video");
                    video.src = fileURL;
                    video.controls = true;
                    fileContainer.appendChild(video);
                }
                const fileName = document.createElement("p");
                fileName.textContent = file.name;
                fileContainer.appendChild(fileName);
                const removeBtn = document.createElement("button");
                removeBtn.classList.add("remove-media-btn");
                removeBtn.textContent = "Remover";
                removeBtn.addEventListener("click", () => {
                    selectedMediaFiles = selectedMediaFiles.filter((f) => f !== file);
                    previewContainer.removeChild(fileContainer);
                    updateFileCountDisplay();
                });
                fileContainer.appendChild(removeBtn);
                previewContainer.appendChild(fileContainer);
            });
        }
        updateFileCountDisplay();
        renderMediaPreviews();
    }

    async function handleFormSubmit() {
        const submitBtn = modal.querySelector(".submit-btn");
        submitBtn.disabled = true;
        submitBtn.textContent = "Adicionando...";
        try {
            const formData = new FormData();
            formData.append("Nome_jogo", gameData.Nome_jogo);
            formData.append("Descricao_jogo", gameData.Descricao_jogo);
            formData.append("Preco_jogo", gameData.Preco_jogo);
            formData.append("Logo_jogo", gameData.Logo_jogo);
            formData.append("Capa_jogo", gameData.Capa_jogo);
            formData.append("Faixa_etaria", gameData.Faixa_etaria);
            formData.append("categorias", JSON.stringify(gameData.categorias));
            formData.append("generos", JSON.stringify(gameData.generos));
            selectedMediaFiles.forEach((file) => {
                formData.append("Midias_jogo", file);
            });
            const response = await fetch("http://localhost:3000/adicionar-jogo-file", {
                method: "POST",
                body: formData,
            });
            const result = await response.text();
            if (response.ok) {
                showCustomMessage(result);
                document.body.removeChild(modal);
                document.body.removeChild(overlay);
                document.dispatchEvent(new Event("gameUpdated"));
                selectedMediaFiles = [];
            } else {
                showCustomMessage("Erro ao adicionar jogo: " + result);
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            showCustomMessage("Ocorreu um erro ao conectar com o servidor.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Adicionar Jogo";
        }
    }

    attachEventListeners();
}

// Lógica da Barra de Navegação e da Busca
function handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById("search-input");
    const query = searchInput.value;

    if (query.trim() === "") {
        if (window.location.pathname.includes("navegar.html")) {
            const customEvent = new CustomEvent("searchSubmitted", { detail: { query: "" } });
            document.dispatchEvent(customEvent);
        } else {
            window.location.href = `navegar.html`;
        }
        return;
    }

    if (window.location.pathname.includes("navegar.html")) {
        const customEvent = new CustomEvent("searchSubmitted", { detail: { query } });
        document.dispatchEvent(customEvent);
    } else {
        window.location.href = `navegar.html?query=${encodeURIComponent(query)}`;
    }
}

function renderNavbar(user) {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    const isSignedIn = !!user;
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    const isAdmin = userEmail === "phantomgamestcc@gmail.com";

    let navbarHTML = "";

    if (isSignedIn) {
        if (isAdmin) {
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

    // Adiciona event listeners após a renderização
    const searchForm = document.getElementById("search-form");
    if (searchForm) {
        searchForm.addEventListener("submit", handleSearch);
    }

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("keyup", (event) => {
            if (event.key === "Enter") {
                handleSearch(event);
            }
        });

        searchInput.addEventListener("input", () => {
            if (searchInput.value.trim() === "" && window.location.pathname.includes("navegar.html")) {
                const customEvent = new CustomEvent("searchSubmitted", { detail: { query: "" } });
                document.dispatchEvent(customEvent);
            }
        });
    }

    // Monta o botão do usuário do Clerk, se estiver logado
    if (isSignedIn) {
        const userButtonDiv = document.getElementById("user-button");
        if (userButtonDiv) {
            try {
                clerk.mountUserButton(userButtonDiv);
            } catch (mountError) {
                console.warn('Erro ao montar user button:', mountError);
            }
        }

        // Adiciona o listener para o botão de adicionar jogo (apenas para o admin)
        if (isAdmin) {
            const addButton = document.getElementById("add-game-btn");
            if (addButton) {
                addButton.addEventListener("click", createAddGameModal);
            }
        }
    }

    // Preenche o campo de busca se houver uma query na URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query");
    if (searchInput && query) {
        searchInput.value = query;
    }
}

// Lógica para inicializar a página e gerenciar a sessão do Clerk
document.addEventListener("DOMContentLoaded", async () => {
    // Usando initializeAuth para garantir que o Clerk esteja pronto
    const { user } = await initializeAuth();
    // Renderiza a navbar apenas depois que o estado de autenticação for conhecido
    renderNavbar(user);
});