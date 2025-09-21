import { initializeAuth, clerk } from "./auth.js";
import { setupMultiselect } from "./multiselect.js";

// --- FUNÇÕES DE UTILIDADE (MODAIS) ---
function showMessage(message, type = "success") {
    const modal = document.createElement("div");
    modal.className = `custom-message-modal ${type}`;
    modal.innerHTML = `<div class="modal-content-message"><p>${message}</p><span class="close-message-btn">&times;</span></div>`;
    document.body.appendChild(modal);
    const close = () => { if (document.body.contains(modal)) document.body.removeChild(modal); };
    modal.querySelector('.close-message-btn').addEventListener('click', close);
    setTimeout(close, 4000);
}

function createConfirmModal(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
            <div class="confirm-modal">
                <p>${message}</p>
                <div class="confirm-buttons">
                    <button id="confirm-yes">Sim</button>
                    <button id="confirm-no">Não</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        const close = (value) => { document.body.removeChild(overlay); resolve(value); };
        overlay.querySelector("#confirm-yes").onclick = () => close(true);
        overlay.querySelector("#confirm-no").onclick = () => close(false);
    });
}

// --- MODAL DE EDIÇÃO (COMPLETO E FUNCIONAL) ---
async function createEditModal(gameData) {
    let allGenres = [], allCategories = [];
    try {
        const [genresRes, categoriesRes] = await Promise.all([
            fetch('http://localhost:3000/generos'),
            fetch('http://localhost:3000/categorias')
        ]);
        if (!genresRes.ok || !categoriesRes.ok) throw new Error('Falha ao carregar listas.');
        allGenres = await genresRes.json();
        allCategories = await categoriesRes.json();
    } catch (error) {
        return showMessage("Não foi possível carregar o formulário.", "error");
    }

    const overlay = document.createElement("div");
    overlay.classList.add("modal-overlay");
    const modal = document.createElement("div");
    modal.classList.add("add-game-modal");

    let existingMidiasToKeep = [...(gameData.midias || [])];
    let newMediaFiles = [];
    let page1Data = {};

    const generosOptionsHTML = allGenres.map(g => `<span class="multiselect-option" data-value="${g}">${g}</span>`).join("");
    const categoriasOptionsHTML = allCategories.map(c => `<span class="multiselect-option" data-value="${c}">${c}</span>`).join("");

    const firstPageHTML = `
        <div class="modal-content" id="first-page">
            <button class="close-modal-btn">&times;</button>
            <h2>Editar Jogo</h2>
            <form id="edit-game-form-p1" novalidate>
                <div class="form-group"><label>Nome:</label><input type="text" id="Nome_jogo" required value="${gameData.Nome_jogo || ''}"></div>
                <div class="form-group"><label>Descrição:</label><textarea id="Descricao_jogo" required>${gameData.Descricao_jogo || ''}</textarea></div>
                <div class="form-group"><label>Preço (R$):</label><input type="number" id="Preco_jogo" step="0.01" required value="${gameData.Preco_jogo || 0}"></div>
                <div class="form-group"><label>Desconto (%):</label><input type="number" id="Desconto_jogo" min="0" max="100" value="${gameData.Desconto_jogo || 0}"></div>
                <div class="form-group"><label>Logo (URL):</label><input type="url" id="Logo_jogo" value="${gameData.Logo_jogo || ''}"></div>
                <div class="form-group"><label>Capa (URL):</label><input type="url" id="Capa_jogo" required value="${gameData.Capa_jogo || ''}"></div>
                <div class="form-group"><label>Faixa Etária:</label>
                    <select id="Faixa_etaria" required>
                        <option value="L">L</option><option value="10">10+</option><option value="12">12+</option>
                        <option value="14">14+</option><option value="16">16+</option><option value="18">18+</option>
                    </select>
                </div>
                <div class="form-group"><label>Gêneros:</label>
                    <div class="multiselect-container" id="multiselect-genre-edit">
                        <div class="multiselect-tags"></div><div class="multiselect-dropdown hidden">${generosOptionsHTML}</div>
                    </div>
                </div>
                <div class="form-group"><label>Categorias:</label>
                    <div class="multiselect-container" id="multiselect-category-edit">
                        <div class="multiselect-tags"></div><div class="multiselect-dropdown hidden">${categoriasOptionsHTML}</div>
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
            <h2>Editar Mídias</h2> 
            <div class="form-group"><label for="media-upload-edit">Adicionar novas mídias:</label><input type="file" id="media-upload-edit" multiple accept="image/*,video/*"></div>
            <p>Total de mídias: <span id="media-count-edit">0</span></p>
            <div id="media-preview-container" class="media-preview-container"></div>
           
            <div class="form-buttons">
                <button type="button" class="back-btn">Voltar</button>
                <button type="button" class="submit-btn">Salvar Alterações</button>
            </div>
        </div>
    `;

    modal.innerHTML = firstPageHTML + secondPageHTML;
    document.body.appendChild(overlay);
    overlay.appendChild(modal);

    const formP1 = modal.querySelector('#edit-game-form-p1');
    modal.querySelector('#Faixa_etaria').value = gameData.Faixa_etaria || 'L';
    const firstPage = modal.querySelector('#first-page');
    const secondPage = modal.querySelector('#second-page');
    
    const genreMultiselect = setupMultiselect("multiselect-genre-edit");
    genreMultiselect.setValues(gameData.generos || []);
    const categoryMultiselect = setupMultiselect("multiselect-category-edit");
    categoryMultiselect.setValues(gameData.categorias || []);

    const mediaPreviewContainer = modal.querySelector("#media-preview-container");
    const mediaCountSpan = modal.querySelector("#media-count-edit");

  const renderMediaPreviews = () => {
    // 1. Limpa COMPLETAMENTE o container. Esta é a correção principal.
    mediaPreviewContainer.innerHTML = '';

    // 2. Atualiza o contador de mídias
    mediaCountSpan.textContent = existingMidiasToKeep.length + newMediaFiles.length;

    // 3. Renderiza as mídias existentes (se houver)
    mediaPreviewContainer.innerHTML += '<h4>Mídias Atuais</h4>';
    if (existingMidiasToKeep.length === 0) {
        mediaPreviewContainer.innerHTML += '<p>Nenhuma mídia existente.</p>';
    } else {
        existingMidiasToKeep.forEach(url => {
            const item = document.createElement('div');
            item.className = 'media-preview-item';
            const filename = url.split('/').pop();

            item.innerHTML = `
                <img src="http://localhost:3000${url}" alt="Mídia">
                <button type="button" class="remove-media-btn">Remover</button>
                <span class="media-filename">${filename}</span>
            `;
            
            item.querySelector('.remove-media-btn').onclick = () => {
                existingMidiasToKeep = existingMidiasToKeep.filter(u => u !== url);
                renderMediaPreviews(); // Chama a si mesma para redesenhar a lista atualizada
            };
            mediaPreviewContainer.appendChild(item);
        });
    }
     // 4. Renderiza as novas mídias (se houver)
    if (newMediaFiles.length > 0) {
        mediaPreviewContainer.innerHTML += '<h4>Novas Mídias</h4>';
        newMediaFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'media-preview-item';
            item.innerHTML = `
                <img src="${URL.createObjectURL(file)}" alt="Nova Mídia">
                <button type="button" class="remove-media-btn">Remover</button>
                <span class="media-filename">${file.name}</span>
            `;
            item.querySelector('.remove-media-btn').onclick = () => {
                newMediaFiles.splice(index, 1);
                renderMediaPreviews();
            };
            mediaPreviewContainer.appendChild(item);
        });
    }
};
    renderMediaPreviews();

    const closeModal = () => overlay.remove();
    modal.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', closeModal));

    firstPage.querySelector('.next-btn').addEventListener('click', () => {
        if (!formP1.checkValidity()) return formP1.reportValidity();
        page1Data = {
            Nome_jogo: modal.querySelector('#Nome_jogo').value, Descricao_jogo: modal.querySelector('#Descricao_jogo').value,
            Preco_jogo: modal.querySelector('#Preco_jogo').value, Desconto_jogo: modal.querySelector('#Desconto_jogo').value,
            Logo_jogo: modal.querySelector('#Logo_jogo').value, Capa_jogo: modal.querySelector('#Capa_jogo').value,
            Faixa_etaria: modal.querySelector('#Faixa_etaria').value,
            generos: genreMultiselect.getValues(), categorias: categoryMultiselect.getValues(),
        };
        firstPage.style.display = 'none';
        secondPage.style.display = 'block';
    });

    secondPage.querySelector('.back-btn').addEventListener('click', () => {
        secondPage.style.display = 'none';
        firstPage.style.display = 'block';
    });

    modal.querySelector('#media-upload-edit').addEventListener('change', (e) => {
        newMediaFiles.push(...e.target.files);
        renderMediaPreviews();
    });

    firstPage.querySelector('.clear-btn').addEventListener('click', () => {
        formP1.reset();
        modal.querySelector('#Faixa_etaria').value = gameData.Faixa_etaria || 'L';
        genreMultiselect.setValues(gameData.generos || []);
        categoryMultiselect.setValues(gameData.categorias || []);
    });

    secondPage.querySelector('.submit-btn').addEventListener('click', async () => {
        const formData = new FormData();
        Object.keys(page1Data).forEach(key => {
            if (Array.isArray(page1Data[key])) {
                page1Data[key].forEach(value => formData.append(key, value));
            } else { formData.append(key, page1Data[key]); }
        });
        existingMidiasToKeep.forEach(url => formData.append("existing_midias", url));
        newMediaFiles.forEach(file => formData.append("midias", file));

        try {
            const token = await clerk.session.getToken();
            const response = await fetch(`http://localhost:3000/jogos/${gameData.ID_jogo}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            showMessage("Jogo atualizado com sucesso!");
            closeModal();
            window.location.reload();
        } catch (error) {
            showMessage(`Erro ao editar jogo: ${error.message}`, "error");
        }
    });
}

// --- FUNÇÕES DE RENDERIZAÇÃO E AÇÕES ---
function renderGameDetails(game) {
    document.title = game.Nome_jogo;
    document.getElementById("nome-jogo").textContent = game.Nome_jogo;
    document.getElementById("logo-jogo").innerHTML = game.Logo_jogo ? `<img src="${game.Logo_jogo}" alt="Logo de ${game.Nome_jogo}">` : '';
    document.getElementById("descrição").textContent = game.Descricao_jogo || "Descrição não disponível.";
    document.getElementById("faixa-etaria-img").src = `../../assets/imagens/${(game.Faixa_etaria || 'L').toLowerCase()}.png`;

    const precoSpan = document.getElementById("preco");
    const precoOriginal = parseFloat(game.Preco_jogo);
    const desconto = parseFloat(game.Desconto_jogo);
    if (precoOriginal === 0) {
        precoSpan.textContent = "Grátis";
    } else if (desconto > 0) {
        const precoComDesconto = precoOriginal * (1 - desconto / 100);
        precoSpan.innerHTML = `<span class="desconto-tag">-${desconto.toFixed(0)}%</span> <span class="preco-original-riscado">R$ ${precoOriginal.toFixed(2).replace(".", ",")}</span> <span class="preco-desconto">R$ ${precoComDesconto.toFixed(2).replace(".", ",")}</span>`;
    } else {
        precoSpan.textContent = `R$ ${precoOriginal.toFixed(2).replace(".", ",")}`;
    }

    updateAverageRating(game.Media_nota); // Renderiza a avaliação inicial

    document.getElementById("genero").innerHTML = (game.generos || []).map(g => `<span>${g}</span>`).join("");
    document.getElementById("categoria").innerHTML = (game.categorias || []).map(c => `<span>${c}</span>`).join("");
}

function updateAverageRating(averageRating) {
    const avaliacaoDiv = document.getElementById("avaliacao");
    if (!avaliacaoDiv) return;
    const ratingValue = averageRating ? parseFloat(averageRating) : 0;
    const ratingPercentage = (ratingValue / 10) * 100;
    const starsHtml = '&#9733;'.repeat(5);
    avaliacaoDiv.innerHTML = `<div class="star-container">${starsHtml}</div><div class="star-fill" style="width: ${ratingPercentage}%;">${starsHtml}</div>`;
}

function setupSwiperSliders(game) {
    const mainWrapper = document.querySelector(".jogo-main-image .swiper-wrapper");
    const thumbsWrapper = document.querySelector(".jogo-side-image .swiper-wrapper");
    if (!mainWrapper || !thumbsWrapper) { console.error("Elementos do Swiper não encontrados."); return; }
    mainWrapper.innerHTML = "";
    thumbsWrapper.innerHTML = "";

    const midias = game.midias || [];
    if (midias.length === 0) {
        mainWrapper.innerHTML = `<div class="swiper-slide"><img src="../../assets/imagens/placeholder-image.jpg" alt="Sem mídia"></div>`;
    } else {
        midias.forEach((media) => {
            const fullUrl = `http://localhost:3000${media}`;
            const isVideo = ['.mp4', '.webm', '.ogg'].some(ext => media.endsWith(ext));
            mainWrapper.innerHTML += `<div class="swiper-slide">${isVideo ? `<video src="${fullUrl}" controls muted loop></video>` : `<img src="${fullUrl}" alt="Mídia"/>`}</div>`;
            thumbsWrapper.innerHTML += `<div class="swiper-slide">${isVideo ? `<video src="${fullUrl}" muted></video>` : `<img src="${fullUrl}" alt="Thumbnail"/>`}</div>`;
        });
    }

    if (typeof Swiper !== "undefined") {
        if (window.swiperMainInstance) window.swiperMainInstance.destroy(true, true);
        if (window.swiperThumbsInstance) window.swiperThumbsInstance.destroy(true, true);
        
        window.swiperThumbsInstance = new Swiper(".jogo-side-image", { spaceBetween: 10, slidesPerView: 4, freeMode: true, watchSlidesProgress: true });
        window.swiperMainInstance = new Swiper(".jogo-main-image", {
            spaceBetween: 10, loop: midias.length > 1,
            autoplay: { delay: 3000, disableOnInteraction: false },
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            thumbs: { swiper: window.swiperThumbsInstance },
        });
    }
}

function renderActionButtons(isSignedIn, isAdmin, gameData) {
    const container = document.querySelector(".detalhes-jogo");
    const existingButtons = container.querySelector('.action-buttons');
    if (existingButtons) existingButtons.remove();
    
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className = 'action-buttons';

    if (isAdmin) {
        buttonWrapper.innerHTML = `<button id="editar-jogo">Editar Jogo</button><button id="remover-jogo">Remover Jogo</button>`;
        container.appendChild(buttonWrapper);
        document.getElementById('editar-jogo').addEventListener('click', () => createEditModal(gameData));
        document.getElementById('remover-jogo').addEventListener('click', () => handleRemoveGame(gameData.ID_jogo));
    } else {
        buttonWrapper.innerHTML = `<button id="comprar">Comprar</button><button id="desejos">Adicionar à Lista de Desejos</button>`;
        container.appendChild(buttonWrapper);
    }
}

async function handleRemoveGame(jogoId) {
    const confirmed = await createConfirmModal("Tem certeza que deseja remover este jogo?");
    if (!confirmed) return;
    try {
        const token = await clerk.session.getToken();
        const response = await fetch(`http://localhost:3000/jogos/${jogoId}`, {
            method: "DELETE", headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error((await response.json()).message);
        showMessage("Jogo removido com sucesso!");
        setTimeout(() => window.location.href = "homepage.html", 1500);
    } catch (error) {
        showMessage(`Erro ao remover o jogo: ${error.message}`, "error");
    }
}

// --- FUNÇÕES DE COMENTÁRIOS ---
function renderComments(comments, currentUser, isAdmin) {
    const container = document.querySelector(".comentarios-container");
    container.innerHTML = "";
    if (!comments || comments.length === 0) {
        container.innerHTML = '<p class="no-comments">Nenhum comentário ainda.</p>';
        return;
    }

    comments.forEach(comment => {
        const isAuthor = currentUser?.id === comment.ID_usuario;
        const canRemove = isAdmin || isAuthor;
        const ratingPercentage = (comment.nota / 10) * 100;
        const starsHtml = '&#9733;'.repeat(5);

        const commentDiv = document.createElement("div");
        commentDiv.className = "comentariosJaFeito";
        commentDiv.innerHTML = `
            <div class="image-perfil">
                <img src="${comment.Imagem_perfil || '../../assets/imagens/default_avatar.png'}" alt="${comment.NomeUsuario}">
                <span>${comment.NomeUsuario}</span>
                ${canRemove ? `<button class="remove-comment-btn" data-comment-id="${comment.ID_comentario}">&times;</button>` : ''}
            </div>
            <div class="nota"><div class="star-container">${starsHtml}</div><div class="star-fill" style="width: ${ratingPercentage}%;">${starsHtml}</div></div>
            <div class="comentarioFeito">${comment.txtcomentario || ''}</div>`;
        container.appendChild(commentDiv);
    });
}

function setupCommentForm(isSignedIn, user, isAdmin, jogoId) {
    const formContainer = document.querySelector("#adicionar-comentario");
    const commentInput = formContainer.querySelector(".inputComentario");
    const submitButton = formContainer.querySelector("button");
    const stars = formContainer.querySelectorAll(".nota .star");

    if (!isSignedIn) { formContainer.style.display = 'none'; return; }
    formContainer.style.display = 'flex';
    formContainer.querySelector(".image-perfil img").src = user.imageUrl || "../../assets/imagens/default_avatar.png";
    formContainer.querySelector("#nome").textContent = user.username;

    let currentRating = 0;
    const resetStars = () => {
        currentRating = 0;
        stars.forEach(s => s.style.color = 'var(--non-selected-color)');
    };
    
    stars.forEach((star, index) => {
        star.onmouseover = () => stars.forEach((s, i) => s.style.color = i <= index ? 'var(--star-color)' : 'var(--non-selected-color)');
        star.onmouseout = () => stars.forEach((s, i) => s.style.color = i < currentRating ? 'var(--star-color)' : 'var(--non-selected-color)');
        star.onclick = () => { currentRating = index + 1; };
    });

    if (!submitButton.hasAttribute('data-listener-set')) {
        submitButton.setAttribute('data-listener-set', 'true');
        submitButton.addEventListener('click', async () => {
            if (currentRating === 0) return showMessage("Por favor, selecione uma nota.", "error");
            
            const commentText = commentInput.value;
            submitButton.disabled = true;
            try {
                const token = await clerk.session.getToken();
                const response = await fetch("http://localhost:3000/comentarios", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ ID_jogo: jogoId, txtcomentario: commentText, nota: currentRating * 2 })
                });

                if (!response.ok) throw new Error((await response.json()).message);
                
                showMessage("Comentário enviado com sucesso!");
                commentInput.value = '';
                resetStars();
                
                const newCommentsRes = await fetch(`http://localhost:3000/comentarios/${jogoId}`);
                const newCommentsData = await newCommentsRes.json();
                renderComments(newCommentsData.comentarios, user, isAdmin);
                updateAverageRating(newCommentsData.media);
            } catch (error) {
                showMessage(`Erro ao enviar comentário: ${error.message}`, "error");
            } finally {
                submitButton.disabled = false;
            }
        });
    }
}

async function handleRemoveComment(commentId, user, isAdmin, jogoId) {
    const commentDiv = document.querySelector(`button[data-comment-id="${commentId}"]`).closest('.comentariosJaFeito');
    const confirmed = await createConfirmModal("Tem certeza que deseja remover este comentário?");
    if (!confirmed) return;
    
    commentDiv.style.opacity = '0.5';
    try {
        const token = await clerk.session.getToken();
        const response = await fetch(`http://localhost:3000/remover-comentario/${commentId}`, {
            method: "DELETE", headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error((await response.json()).message);
        
        commentDiv.remove();
        showMessage("Comentário removido com sucesso!");

        const newCommentsRes = await fetch(`http://localhost:3000/comentarios/${jogoId}`);
        const newCommentsData = await newCommentsRes.json();
        updateAverageRating(newCommentsData.media);
    } catch (error) {
        commentDiv.style.opacity = '1';
        showMessage(`Erro ao remover comentário: ${error.message}`, "error");
    }
}


// --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
async function main() {
    const urlParams = new URLSearchParams(window.location.search);
    const jogoId = urlParams.get("id");
    if (!jogoId) {
        document.querySelector("main").innerHTML = '<p class="error-message">ID do jogo não fornecido.</p>';
        return;
    }

    try {
        const authData = await initializeAuth();
        
        const gameRes = await fetch(`http://localhost:3000/jogos/${jogoId}`);
        if (!gameRes.ok) throw new Error(`Jogo não encontrado (ID: ${jogoId})`);
        const game = await gameRes.json();
        
        const commentsRes = await fetch(`http://localhost:3000/comentarios/${jogoId}`);
        const commentsData = commentsRes.ok ? await commentsRes.json() : { comentarios: [] };
        game.Media_nota = commentsData.media || game.Media_nota;

        renderGameDetails(game);
        setupSwiperSliders(game);
        renderActionButtons(authData.isSignedIn, authData.isAdmin, game);
        renderComments(commentsData.comentarios, authData.user, authData.isAdmin);
        setupCommentForm(authData.isSignedIn, authData.user, authData.isAdmin, jogoId);
        
    } catch (error) {
        console.error("Erro ao carregar a página do jogo:", error);
        document.querySelector("main").innerHTML = `<p class="error-message">Não foi possível carregar os detalhes do jogo. ${error.message}</p>`;
    }
}

document.addEventListener("DOMContentLoaded", main);

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-comment-btn')) {
        const urlParams = new URLSearchParams(window.location.search);
        const jogoId = urlParams.get("id");
        const commentId = event.target.dataset.commentId;
        const { user, isAdmin } = clerk.user ? { user: clerk.user, isAdmin: (clerk.user.publicMetadata.role === 'admin') } : { user: null, isAdmin: false };
        handleRemoveComment(commentId, user, isAdmin, jogoId);
    }
});