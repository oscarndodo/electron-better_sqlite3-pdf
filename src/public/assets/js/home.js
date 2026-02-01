// Inicializar ícones Lucide
lucide.createIcons();

// Adicionar interatividade básica
document.addEventListener('DOMContentLoaded', function () {
    // Efeito hover nos cards
    const cards = document.querySelectorAll('.card-hover');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-4px)';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });

    // Simular notificação
    const bellIcon = document.querySelector('[data-lucide="bell"]');
    if (bellIcon) {
        bellIcon.addEventListener('click', function () {
            alert('Notificações:\n- Assinatura pendente em "Contrato_Serviços.pdf"\n- Novo template disponível: Fatura');
        });
    }

    // Adicionar funcionalidade aos botões principais
    const quickActions = document.querySelectorAll('.btn-primary');
    quickActions.forEach(btn => {
        btn.addEventListener('click', function (e) {
            if (this.textContent.includes('Novo PDF')) {
                alert('Abrir modal para criar novo PDF');
            }
        });
    });
});