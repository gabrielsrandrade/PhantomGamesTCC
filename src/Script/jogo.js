import { initializeAuth } from "./auth.js";
import { setupMultiselect } from "./multiselect.js";

function showMessage(message, type = "success") {
    const modal = document.createElement("div");
    modal.classList.add("custom-message-modal");
    const content = document.createElement("div");
    content.classList.add("modal-content-message");
    const p = document.createElement("p");
    p.textContent = message;
    const closeBtn = document.createElement("span");
    closeBtn.classList.add("close-message-btn");
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => {
        modal.remove();
    };
    content.appendChild(p);
    content.appendChild(closeBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
}

function createConfirmModal(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.classList.add("modal-overlay");
        const modal = document.createElement("div");
        modal.classList.add("confirm-modal");
        modal.innerHTML = `
            <p>${message}</p>
            <div class="confirm-buttons">
                <button id="confirm-yes">Sim</button>
                <button id="confirm-no">Não</button>
            </div>
        `;
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        modal.querySelector("#confirm-yes").onclick = () => {
            overlay.remove();
            resolve(true);
        };
        modal.querySelector("#confirm-no").onclick = () => {
            overlay.remove();
            resolve(false);
        };
    });
}

function createAddGameModal(isEditing = false, gameData = {}) {
    const overlay = document.createElement("div");
    overlay.classList.add("modal-overlay");
    const modal = document.createElement("div");
    modal.classList.add("add-game-modal");
    const firstPageHTML = `
        <div class="modal-content" id="first-page">
            <button class="close-modal-btn">&times;</button>
            <h2>${isEditing ? "Editar Jogo" : "Adicionar Novo Jogo"}</h2>
            <form id="add-game-form">
                <div class="form-group">
                    <label for="Nome_jogo">Nome do Jogo:</label>
                    <input type="text" id="Nome_jogo" name="Nome_jogo" required value="${
                        gameData.Nome_jogo || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="Descricao_jogo">Descrição:</label>
                    <textarea id="Descricao_jogo" name="Descricao_jogo" required>${
                        gameData.Descricao_jogo || ""
                    }</textarea>
                </div>
                <div class="form-group">
                    <label for="Preco_jogo">Preço (R$):</label>
                    <input type="number" id="Preco_jogo" name="Preco_jogo" step="0.01" required value="${
                        gameData.Preco_jogo || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="Logo_jogo">Logo (URL da Imagem):</label>
                    <input type="url" id="Logo_jogo" name="Logo_jogo" value="${
                        gameData.Logo_jogo || ""
                    }">
                </div>
                <div class="form-group">
                    <label for="Capa_jogo">Capa (URL da Imagem):</label>
                    <input type="url" id="Capa_jogo" name="Capa_jogo" required value="${
                        gameData.Capa_jogo || ""
                    }">
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
                        <div class="multiselect-tags"></div>
                        <div class="multiselect-dropdown hidden">
                            ${[
                                "Ação",
                                "Aventura",
                                "Casual",
                                "Corrida",
                                "Esportes",
                                "Estratégia",
                                "Indie",
                                "Luta",
                                "Musical",
                                "Narrativo",
                                "Plataforma",
                                "Puzzle",
                                "RPG",
                                "Simulação",
                                "Sobrevivência",
                                "Terror",
                                "Tiro",
                            ]
                                .map(
                                    (g) =>
                                        `<span class="multiselect-option" data-value="${g}">${g}</span>`
                                )
                                .join("")}
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label>Categorias:</label>
                    <div class="multiselect-container" id="multiselect-category">
                        <div class="multiselect-tags"></div>
                        <div class="multiselect-dropdown hidden">
                            ${[
                                "Singleplayer",
                                "Multiplayer Local",
                                "Multiplayer Online",
                                "Co-op",
                                "PvP",
                                "PvE",
                                "MMO",
                                "Cross-Plataform",
                                "2D",
                                "3D",
                                "2.5D",
                                "Top-Down",
                                "Side-Scrooling",
                                "Isométrico",
                                "Primeira Pessoa",
                                "Terceira Pessoa",
                                "Linear",
                                "Mundo Aberto",
                                "Sandbox",
                                "Campanha",
                                "Missões/Fases",
                                "Permadeath",
                                "Rouguelike",
                            ]
                                .map(
                                    (c) =>
                                        `<span class="multiselect-option" data-value="${c}">${c}</span>`
                                )
                                .join("")}
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
        <div class="modal-content" id="second-page" style="display: none;">
            <button class="close-modal-btn">&times;</button>
            <h2>Adicionar Mídias</h2>
            <div class="media-container">
                <div class="form-group">
                    <label for="media-upload">Selecionar Imagens/Vídeos:</label>
                    <input type="file" id="media-upload" name="media-upload" multiple accept="image/*,video/*">
                </div>
                <p>Total de mídias: <span id="media-count">0</span></p>
                <div id="media-preview-container" class="media-preview-container"></div>
            </div>
            <div class="form-buttons">
                <button type="button" class="back-btn">Voltar</button>
                <button type="button" class="submit-btn">${
                    isEditing ? "Salvar Edições" : "Adicionar Jogo"
                }</button>
            </div>
        </div>
    `;
    modal.innerHTML = firstPageHTML + secondPageHTML;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
        if (
            e.target.classList.contains("modal-overlay") ||
            e.target.classList.contains("close-modal-btn")
        ) {
            overlay.remove();
        }
    });
    const firstPage = modal.querySelector("#first-page");
    const secondPage = modal.querySelector("#second-page");
    const nextBtn = firstPage.querySelector(".next-btn");
    const backBtn = secondPage.querySelector(".back-btn");
    const submitBtn = secondPage.querySelector(".submit-btn");
    const mediaPreviewContainer = secondPage.querySelector(
        "#media-preview-container"
    );
    const mediaUploadInput = secondPage.querySelector("#media-upload");
    const mediaCountSpan = secondPage.querySelector("#media-count");
    let existingMidiasToKeep = isEditing ? gameData.midias || [] : [];
    let newMediaFiles = [];
    const setupMediaPreview = () => {
        mediaPreviewContainer.innerHTML = "";
        mediaCountSpan.textContent =
            existingMidiasToKeep.length + newMediaFiles.length;
        existingMidiasToKeep.forEach((mediaUrl) => {
            const fullUrl = `http://localhost:3000${mediaUrl}`;
            const fileName = mediaUrl.split("/").pop();
            const mediaElement = document.createElement("div");
            mediaElement.classList.add("media-preview-item");
            const fileExtension = mediaUrl.split(".").pop().toLowerCase();
            let mediaContent = "";
            if (
                ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(fileExtension)
            ) {
                mediaContent = `<img src="${fullUrl}" alt="Mídia do Jogo"/>`;
            } else if (["mp4", "webm", "ogg"].includes(fileExtension)) {
                mediaContent = `<video src="${fullUrl}" controls></video>`;
            } else {
                mediaContent = `<p>Arquivo não suportado: ${fileName}</p>`;
            }
            mediaElement.innerHTML = `
                <div class="media-preview-image">
                    ${mediaContent}
                </div>
                <div class="media-details">
                    <span>${fileName}</span>
                    <button class="remove-media-btn">Remover</button>
                </div>
            `;
            mediaElement
                .querySelector(".remove-media-btn")
                .addEventListener("click", () => {
                    mediaElement.remove();
                    existingMidiasToKeep = existingMidiasToKeep.filter(
                        (url) => url !== mediaUrl
                    );
                    mediaCountSpan.textContent =
                        existingMidiasToKeep.length + newMediaFiles.length;
                });
            mediaPreviewContainer.appendChild(mediaElement);
        });
        newMediaFiles.forEach((file, index) => {
            const fileURL = URL.createObjectURL(file);
            const mediaElement = document.createElement("div");
            mediaElement.classList.add("media-preview-item");
            let mediaContent = "";
            if (file.type.startsWith("image/")) {
                mediaContent = `<img src="${fileURL}" alt="${file.name}" />`;
            } else if (file.type.startsWith("video/")) {
                mediaContent = `<video src="${fileURL}" controls></video>`;
            } else {
                mediaContent = `<p>Arquivo não suportado: ${file.name}</p>`;
            }
            mediaElement.innerHTML = `
                <div class="media-preview-image">
                    ${mediaContent}
                </div>
                <div class="media-details">
                    <span>${file.name}</span>
                    <button class="remove-media-btn">Remover</button>
                </div>
            `;
            mediaElement
                .querySelector(".remove-media-btn")
                .addEventListener("click", () => {
                    mediaElement.remove();
                    newMediaFiles = newMediaFiles.filter((f, i) => i !== index);
                    mediaCountSpan.textContent =
                        existingMidiasToKeep.length + newMediaFiles.length;
                });
            mediaPreviewContainer.appendChild(mediaElement);
        });
    };
    nextBtn.addEventListener("click", () => {
        const form = document.getElementById("add-game-form");
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        firstPage.style.display = "none";
        secondPage.style.display = "block";
        setupMediaPreview();
    });
    backBtn.addEventListener("click", () => {
        secondPage.style.display = "none";
        firstPage.style.display = "block";
    });
    mediaUploadInput.addEventListener("change", (e) => {
        newMediaFiles.push(...Array.from(e.target.files));
        mediaUploadInput.value = "";
        setupMediaPreview();
    });
    const genreMultiselect = setupMultiselect("multiselect-genre");
    const categoryMultiselect = setupMultiselect("multiselect-category");
    if (isEditing) {
        genreMultiselect.setValues(gameData.generos);
        categoryMultiselect.setValues(gameData.categorias);
        document.getElementById("Faixa_etaria").value = gameData.Faixa_etaria;
    }
    submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("Nome_jogo", document.getElementById("Nome_jogo").value);
        formData.append(
            "Descricao_jogo",
            document.getElementById("Descricao_jogo").value
        );
        formData.append("Preco_jogo", document.getElementById("Preco_jogo").value);
        formData.append("Logo_jogo", document.getElementById("Logo_jogo").value);
        formData.append("Capa_jogo", document.getElementById("Capa_jogo").value);
        formData.append(
            "Faixa_etaria",
            document.getElementById("Faixa_etaria").value
        );
        genreMultiselect
            .getValues()
            .forEach((g) => formData.append("generos[]", g));
        categoryMultiselect
            .getValues()
            .forEach((c) => formData.append("categorias[]", c));
        existingMidiasToKeep.forEach((url) =>
            formData.append("existing_midias[]", url)
        );
        newMediaFiles.forEach((file) => formData.append("midias", file));
        const jogoId = gameData.ID_jogo || gameData.id_jogo || gameData.id;
        if (!jogoId) {
            console.error("Erro: ID do jogo não encontrado para edição.");
            showMessage(
                "Não foi possível salvar as edições. ID do jogo não encontrado."
            );
            return;
        }
        const url = `http://localhost:3000/jogos/${jogoId}`;
        try {
            const response = await fetch(url, {
                method: "PUT",
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Erro ao salvar as edições do jogo."
                );
            }
            showMessage("Jogo editado com sucesso!");
            window.location.reload();
        } catch (error) {
            console.error("Erro na edição:", error);
            showMessage(
                "Ocorreu um erro ao salvar as edições do jogo. " + error.message
            );
        }
    });
    return { modal, genreMultiselect, categoryMultiselect };
}

function renderGameDetails(game) {
    document.getElementById("nome-jogo").textContent = game.Nome_jogo;
    const logoDiv = document.getElementById("logo-jogo");
    logoDiv.innerHTML = "";
    if (game.Logo_jogo) {
        const logoImg = document.createElement("img");
        if (game.Logo_jogo.startsWith('http://') || game.Logo_jogo.startsWith('https://')) {
            logoImg.src = game.Logo_jogo;
        } else {
            logoImg.src = `http://localhost:3000${game.Logo_jogo}`;
        }
        logoImg.alt = `Logo de ${game.Nome_jogo}`;
        logoImg.style.maxWidth = "100%";
        logoDiv.appendChild(logoImg);
    } else {
        console.log("Nenhuma logo encontrada para o jogo.");
    }
    document.getElementById("descrição").textContent =
        game.Descricao_jogo || "Descrição não disponível.";
    const faixaEtariaImg = document.getElementById("faixa-etaria-img");
    const faixaEtaria = game.Faixa_etaria;
    faixaEtariaImg.src = `../../assets/imagens/${faixaEtaria.toLowerCase()}.png`;
    faixaEtariaImg.alt = `Faixa Etária: ${faixaEtaria}`;
    const precoSpan = document.getElementById("preco");
    const preco = parseFloat(game.Preco_jogo);
    precoSpan.textContent =
        preco === 0 ? "Grátis" : `R$${preco.toFixed(2).replace(".", ",")}`;

    const avaliacaoDiv = document.getElementById("avaliacao");
    if (avaliacaoDiv) {
        const averageRating = game.Media_nota ? parseFloat(game.Media_nota) : 0;
        const totalStars = 5;
        const ratingPercentage = (averageRating / 10) * 100;

        let starsHtml = "";
        for (let i = 0; i < totalStars; i++) {
            starsHtml += "&#9733;";
        }

        avaliacaoDiv.innerHTML = `
            <div class="star-container">${starsHtml}</div>
            <div class="star-fill" style="width: ${ratingPercentage}%;">${starsHtml}</div>
        `;
    }

    const generosDiv = document.getElementById("genero");
    generosDiv.innerHTML = game.generos
        .map((genero) => `<span>${genero}</span>`)
        .join("");
    const categoriasDiv = document.getElementById("categoria");
    categoriasDiv.innerHTML = game.categorias
        .map((categoria) => `<span>${categoria}</span>`)
        .join("");
}

function setupSwiperSliders(game) {
    const mainWrapper = document.querySelector(
        ".jogo-main-image .swiper-wrapper"
    );
    const thumbsWrapper = document.querySelector(
        ".jogo-side-image .swiper-wrapper"
    );
    if (!mainWrapper || !thumbsWrapper) {
        console.error("Elementos do Swiper não encontrados.");
        return;
    }
    mainWrapper.innerHTML = "";
    thumbsWrapper.innerHTML = "";
    const midias = game.midias || [];
    if (midias.length === 0) {
        const placeholderSlide = `
            <div class="swiper-slide">
                <img src="../../assets/imagens/placeholder-image.jpg" alt="Sem mídia disponível" />
            </div>
        `;
        mainWrapper.innerHTML = placeholderSlide;
        thumbsWrapper.innerHTML = placeholderSlide;
    } else {
        midias.forEach((media) => {
            const fullUrl = `http://localhost:3000${media}`;
            const fileExtension = media.split(".").pop().toLowerCase();
            const mainSlide = document.createElement("div");
            mainSlide.classList.add("swiper-slide");
            const thumbSlide = document.createElement("div");
            thumbSlide.classList.add("swiper-slide");
            if (
                ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(fileExtension)
            ) {
                mainSlide.innerHTML = `<img src="${fullUrl}" alt="Mídia do Jogo"/>`;
                thumbSlide.innerHTML = `<img src="${fullUrl}" alt="Mídia do Jogo"/>`;
            } else if (["mp4", "webm", "ogg"].includes(fileExtension)) {
                mainSlide.innerHTML = `<video src="${fullUrl}" controls></video>`;
                thumbSlide.innerHTML = `<video src="${fullUrl}" alt="Thumbnail de Vídeo"></video>`;
            }
            mainWrapper.appendChild(mainSlide);
            thumbsWrapper.appendChild(thumbSlide);
        });
    }
    if (typeof Swiper !== "undefined") {
        if (window.swiperMainInstance)
            window.swiperMainInstance.destroy(true, true);
        if (window.swiperThumbsInstance)
            window.swiperThumbsInstance.destroy(true, true);
        window.swiperThumbsInstance = new Swiper(".jogo-side-image", {
            spaceBetween: 16,
            slidesPerView: 4,
            freeMode: true,
            loop: false,
            watchSlidesProgress: true,
        });
        window.swiperMainInstance = new Swiper(".jogo-main-image", {
            spaceBetween: 10,
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            thumbs: {
                swiper: window.swiperThumbsInstance,
            },
        });
    }
}

function renderActionButtons(isSignedIn, isAdmin, gameData) {
    const detalhesJogo = document.querySelector(".detalhes-jogo");
    if (!detalhesJogo) {
        console.error("Elemento '.detalhes-jogo' não encontrado.");
        return;
    }
    const existingButtons = detalhesJogo.querySelectorAll("button");
    existingButtons.forEach((btn) => btn.remove());
    if (isAdmin) {
        const editBtn = document.createElement("button");
        editBtn.id = "editar";
        editBtn.textContent = "Editar Jogo";
        editBtn.addEventListener("click", () => {
            createAddGameModal(true, gameData);
        });
        const removeBtn = document.createElement("button");
        removeBtn.id = "remover";
        removeBtn.textContent = "Remover Jogo";
        removeBtn.addEventListener("click", async () => {
            const confirmed = await createConfirmModal(
                "Tem certeza que deseja remover este jogo? Esta ação não pode ser desfeita."
            );
            if (confirmed) {
                try {
                    const jogoId = gameData.ID_jogo || gameData.id_jogo || gameData.id;
                    if (!jogoId) {
                        showMessage("Erro: ID do jogo não encontrado para remoção.");
                        return;
                    }

                    const response = await fetch(
                        `http://localhost:3000/jogos/${jogoId}`,
                        {
                            method: "DELETE",
                        }
                    );

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || "Erro ao remover o jogo.");
                    }
                    showMessage("Jogo removido com sucesso!");
                    window.location.href = "homepage.html";
                } catch (error) {
                    console.error("Erro na remoção:", error);
                    showMessage("Não foi possível remover o jogo. " + error.message);
                }
            }
        });
        detalhesJogo.appendChild(editBtn);
        detalhesJogo.appendChild(removeBtn);
    } else {
        const buyBtn = document.createElement("button");
        buyBtn.id = "comprar";
        buyBtn.textContent = "Comprar";
        const wishBtn = document.createElement("button");
        wishBtn.id = "desejos";
        wishBtn.textContent = "Adicionar à Lista de Desejos";
        if (isSignedIn) {
            buyBtn.addEventListener("click", () => {
                showMessage("Função de compra não implementada ainda.");
            });
            wishBtn.addEventListener("click", () => {
                showMessage(
                    "Função de adicionar à lista de desejos não implementada ainda."
                );
            });
        } else {
            buyBtn.addEventListener("click", () => {
                showMessage("Você precisa estar logado para comprar.");
                window.location.href = "login.html";
            });
            wishBtn.addEventListener("click", () => {
                showMessage(
                    "Você precisa estar logado para adicionar à lista de desejos."
                );
                window.location.href = "login.html";
            });
        }
        detalhesJogo.appendChild(buyBtn);
        detalhesJogo.appendChild(wishBtn);
    }
}

function renderComments(comments, user, isAdmin) {
    const commentsContainer = document.querySelector(".comentarios-container");
    if (!commentsContainer) {
        console.error("Elemento .comentarios-container não encontrado.");
        return;
    }

    commentsContainer.innerHTML = "";

    if (comments.length === 0) {
        commentsContainer.innerHTML =
            '<p class="no-comments">Nenhum comentário ainda. Seja o primeiro a avaliar!</p>';
        return;
    }

    comments.forEach((comment) => {
        const commentDiv = document.createElement("div");
        commentDiv.classList.add("comentariosJaFeito");

        let removeButtonHtml = "";
        const isUserAuthor = user?.id === comment.ID_usuario;

        if (isUserAuthor || isAdmin) {
            removeButtonHtml = `<button class="remove-comment-btn" data-comment-id="${comment.ID_comentario}">&#10006;</button>`;
        }

        const headerDiv = document.createElement("div");
        headerDiv.classList.add("image-perfil");
        headerDiv.innerHTML = `
            <img src="${
                comment.Imagem_perfil || "../../assets/imagens/default_avatar.png"
            }" alt="${comment.NomeUsuario}">
            <span>${comment.NomeUsuario}</span>
            ${removeButtonHtml}
        `;

        const ratingDiv = document.createElement("div");
        ratingDiv.classList.add("nota");
        let starHtml = "";
        const rating = Math.round(comment.nota / 2);
        for (let i = 0; i < 5; i++) {
            starHtml += `<span class="star" style="color: ${
                i < rating ? "var(--star-color)" : "var(--non-selected-color)"
            };">&#9733;</span>`;
        }
        ratingDiv.innerHTML = starHtml;

        const textDiv = document.createElement("div");
        textDiv.id = "cometarioFeito";
        textDiv.textContent = comment.txtcomentario;

        commentDiv.appendChild(headerDiv);
        commentDiv.appendChild(ratingDiv);
        commentDiv.appendChild(textDiv);

        commentsContainer.appendChild(commentDiv);
    });
}

function setupRatingForm(isSignedIn, user, jogoId, isAdmin) {
    const formContainer = document.querySelector("#adicionar-comentario");
    if (!formContainer) return;

    if (!isSignedIn) {
        formContainer.style.display = 'none';
        return;
    } else {
        formContainer.style.display = 'block';
    }
    
    const userProfileImage = formContainer.querySelector(".image-perfil img");
    const userNameElement = formContainer.querySelector("#nome");
    if (isSignedIn && user) {
        userProfileImage.src =
            user.imageUrl || "../../assets/imagens/default_avatar.png";
        userProfileImage.alt = user.username || "Usuário";
        userNameElement.textContent = user.username || "Usuário";
    }

    const commentInput = formContainer.querySelector(".inputComentario");
    const ratingStars = formContainer.querySelectorAll(".nota .star");
    const submitBtn = formContainer.querySelector("#comentario button");
    let currentRating = 0;
    
    ratingStars.forEach((star, index) => {
        star.addEventListener("click", () => {
            currentRating = index + 1;
            ratingStars.forEach((s, i) => {
                s.style.color =
                    i < currentRating ? "var(--star-color)" : "var(--non-selected-color)";
            });
        });
    });

    submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const data = {
            ID_usuario: user.id,
            ID_jogo: jogoId,
            txtcomentario: commentInput.value,
            nota: currentRating * 2,
        };

        if (currentRating === 0) {
            showMessage(
                "Por favor, dê uma nota antes de enviar o comentário.",
                "error"
            );
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/comentarios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Erro ao enviar o comentário.");
            }

            showMessage("Comentário enviado com sucesso!");
            commentInput.value = "";
            currentRating = 0;
            ratingStars.forEach((s) => (s.style.color = "var(--non-selected-color)"));
            
            fetchGameAndRender(jogoId);
            fetchCommentsAndRender(jogoId, user, isAdmin);
        } catch (error) {
            console.error("Erro ao enviar comentário:", error);
            showMessage(
                "Ocorreu um erro ao enviar o comentário. " + error.message,
                "error"
            );
        }
    });
}

async function fetchGameAndRender(jogoId) {
    try {
        const response = await fetch(`http://localhost:3000/jogos/${jogoId}`);
        if (!response.ok) {
            throw new Error("Não foi possível buscar os detalhes do jogo.");
        }
        const game = await response.json();
        renderGameDetails(game);
    } catch (error) {
        console.error("Erro ao buscar detalhes do jogo:", error);
    }
}

async function fetchCommentsAndRender(jogoId, user, isAdmin) {
    try {
        const response = await fetch(`http://localhost:3000/comentarios/${jogoId}`);
        if (!response.ok) {
            throw new Error("Não foi possível buscar os comentários e nota média.");
        }
        const data = await response.json();

        renderComments(data.comentarios, user, isAdmin);
        const media = data.media ? parseFloat(data.media).toFixed(1) : "0.0";
        const mediaNotaSpan = document.getElementById("media-nota-span");
        if (mediaNotaSpan) mediaNotaSpan.textContent = media;
    } catch (error) {
        console.error("Erro ao buscar comentários e nota média:", error);
        const commentsList = document.querySelector(".comentarios-container");
        if (commentsList)
            commentsList.innerHTML =
                '<p class="no-comments">Erro ao carregar os comentários.</p>';
        const mediaNotaSpan = document.getElementById("media-nota-span");
        if (mediaNotaSpan) mediaNotaSpan.textContent = "0.0";
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    let isSignedIn = false;
    let isAdmin = false;
    let user = null;

    try {
        const authData = await initializeAuth();
        isSignedIn = authData.isSignedIn;
        isAdmin = authData.isAdmin;
        user = authData.user;
    } catch (authError) {
        console.error("Falha na inicialização da autenticação:", authError);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const jogoId = urlParams.get("id");
    if (!jogoId) {
        document.querySelector("main").innerHTML =
            '<p style="color: red; text-align: center;">ID do jogo não fornecido. Verifique o link.</p>';
        return;
    }

    let game = null;
    try {
        const response = await fetch(`http://localhost:3000/jogos/${jogoId}`);
        if (!response.ok) {
            if (response.status === 404) {
                document.querySelector(
                    "main"
                ).innerHTML = `<p style="color: red; text-align: center;">Jogo não encontrado. Verifique se o ID ${jogoId} existe no banco de dados. Certifique-se de que o back-end está rodando.</p>`;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || "Erro ao buscar detalhes do jogo.");
        }
        game = await response.json();
        renderGameDetails(game);
        setupSwiperSliders(game);
        renderActionButtons(isSignedIn, isAdmin, game);
        setupRatingForm(isSignedIn, user, jogoId, isAdmin);
        fetchCommentsAndRender(jogoId, user, isAdmin);
    } catch (error) {
        console.error("Erro ao carregar jogo:", error);
        document.querySelector("main").innerHTML =
            '<p style="color: red; text-align: center;">Não foi possível carregar os detalhes do jogo. Verifique o console para mais detalhes ou se o ID é válido. Certifique-se de que o back-end está rodando e o jogo existe.</p>';
    }

    document.addEventListener("click", async (event) => {
        if (event.target.classList.contains("remove-comment-btn")) {
            const commentId = event.target.dataset.commentId;
            const userId = user?.id;

            if (!userId) {
                showMessage(
                    "ID do usuário não fornecido. Acesso não autorizado.",
                    "error"
                );
                return;
            }

            const confirmDelete = await createConfirmModal(
                "Tem certeza de que deseja remover este comentário?"
            );

            if (confirmDelete) {
                try {
                    const response = await fetch(
                        `http://localhost:3000/remover-comentario/${commentId}`,
                        {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                "x-user-id": userId,
                            },
                        }
                    );

                    if (response.ok) {
                        showMessage("Comentário removido com sucesso!");
                        const urlParams = new URLSearchParams(window.location.search);
                        const jogoId = urlParams.get("id");
                        fetchCommentsAndRender(jogoId, user, isAdmin);
                        fetchGameAndRender(jogoId);
                    } else {
                        const errorData = await response.json();
                        showMessage(
                            `Erro ao remover o comentário: ${errorData.message}`,
                            "error"
                        );
                    }
                } catch (error) {
                    console.error("Erro na requisição DELETE:", error);
                    showMessage(
                        "Não foi possível remover o comentário. Tente novamente mais tarde.",
                        "error"
                    );
                }
            }
        }
    });
});