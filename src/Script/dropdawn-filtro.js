const ARROW_ICON_URL = "../../assets/imagens/seta-filtro.png";
const X_ICON_URL = "../../assets/imagens/x-filtro.png";

const selectTriggers = document.querySelectorAll('.select');

selectTriggers.forEach(trigger => {
    const initialText = trigger.querySelector('.select-text').textContent;
    trigger.setAttribute('data-initial-text', initialText);

    trigger.addEventListener('click', function(event) {
        const filtroContainer = this.closest('.filtro');
        const filtroContent = filtroContainer.querySelector('.filtro-content');
        const selectIcon = this.querySelector('.select-icon');

        if (event.target === selectIcon && this.classList.contains('is-selected')) {
            event.stopPropagation();
            
            const filterName = filtroContent.getAttribute('data-filtro-name');
            this.querySelector('.select-text').textContent = this.getAttribute('data-initial-text');
            
            selectIcon.src = ARROW_ICON_URL;
            selectIcon.alt = "Seta para baixo";
            
            this.classList.remove('is-selected');

            filtroContent.classList.remove('show');

            document.dispatchEvent(new CustomEvent('filterApplied', {
                detail: { filterName, filterValue: null }
            }));
            
            return;
        }

        document.querySelectorAll('.filtro-content.show').forEach(openFiltro => {
            if (openFiltro !== filtroContent) {
                openFiltro.classList.remove('show');
            }
        });

        filtroContent.classList.toggle('show');
    });
});

document.querySelectorAll('.filtro-content li').forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault();

        const filtroContainer = this.closest('.filtro');
        const selectDisplay = filtroContainer.querySelector('.select');
        const selectTextSpan = selectDisplay.querySelector('.select-text');
        const selectIcon = selectDisplay.querySelector('.select-icon');
        const filtroContent = filtroContainer.querySelector('.filtro-content');
        const filterName = filtroContent.getAttribute('data-filtro-name');
        const filterValue = this.getAttribute('data-value');

        selectTextSpan.textContent = this.textContent;
        selectIcon.src = X_ICON_URL;
        selectIcon.alt = "Limpar seleção";
        
        selectDisplay.classList.add('is-selected');
        filtroContent.classList.remove('show');

        document.dispatchEvent(new CustomEvent('filterApplied', {
            detail: { filterName, filterValue }
        }));
    });
});

window.addEventListener('click', function(event) {
    if (!event.target.closest('.filtro')) {
        document.querySelectorAll('.filtro-content.show').forEach(openFiltro => {
            openFiltro.classList.remove('show');
        });
    }
});