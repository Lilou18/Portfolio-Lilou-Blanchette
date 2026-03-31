export function setupCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach(item => {
        item.addEventListener("click", () => {
            navigator.clipboard.writeText(item.dataset.copy);
            const tooltip = item.querySelector('.copy-tooltip');
            if (tooltip != null) {
                tooltip.textContent = 'Copié!';
                setTimeout(() => {
                    tooltip.innerHTML = 'Copier <i class="fa-solid fa-copy copy-icon"></i>';
                }, 2000);
            }
        });
    });
}