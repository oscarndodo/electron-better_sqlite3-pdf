// ============================================
// VARIÁVEIS
// ============================================
let currentFile = null;
let totalPages = 0;
let pagesToRemove = new Set(); // Páginas que serão removidas

// ============================================
// INICIALIZAÇÃO
// ============================================
lucide.createIcons();

document.addEventListener('DOMContentLoaded', function () {
    setupDragAndDrop();

    // Enter no input
    document.getElementById('pagesInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') applyPagesFromInput();
    });
});

// ============================================
// DRAG & DROP
// ============================================
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add('border-red-400', 'bg-red-50');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-red-400', 'bg-red-50');

            if (eventName === 'drop') {
                const file = e.dataTransfer.files[0];
                if (file && (file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf'))) {
                    loadPDF(file);
                }
            }
        });
    });
}

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================
function triggerFileInput() {
    document.getElementById('fileInput').click();
}

document.getElementById('fileInput').addEventListener('change', function (e) {
    if (e.target.files[0]) {
        loadPDF(e.target.files[0]);
    }
});

async function loadPDF(file) {
    currentFile = file;
    pagesToRemove.clear();

    // Simular número de páginas
    const buffer = await file.arrayBuffer();
    totalPages = await window.api.getPages(buffer);


    // Mostrar informações
    document.getElementById('fileName').textContent =
        file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
    document.getElementById('fileInfo').textContent = `${totalPages} páginas`;

    // Ir para tela de seleção
    document.getElementById('uploadScreen').classList.add('hidden');
    document.getElementById('selectionScreen').classList.remove('hidden');
    document.getElementById('selectionScreen').classList.add('flex');

    // Criar lista de páginas
    createPagesList();

    // Resetar botão
    document.getElementById('removeBtn').disabled = true;

    // Limpar input
    document.getElementById('pagesInput').value = '';

    // Atualizar contador
    updateCounter();
}



// ============================================
// LISTA DE PÁGINAS
// ============================================
function createPagesList() {
    const container = document.getElementById('pagesList');
    container.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageElement = document.createElement('div');
        pageElement.className = `page-item p-3 border rounded-lg cursor-default transition-all ${pagesToRemove.has(i)
            ? 'border-red-500 bg-red-50'
            : 'border-gray-200 hover:border-gray-300'
            }`;
        pageElement.dataset.page = i;

        pageElement.innerHTML = `
                    <div class="text-center">
                        <div class="w-10 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto mb-2">
                            <i data-lucide="${pagesToRemove.has(i) ? 'x-circle' : 'file'}" 
                               class="w-5 h-5 ${pagesToRemove.has(i) ? 'text-red-600' : 'text-gray-400'}"></i>
                        </div>
                        <span class="text-sm font-medium ${pagesToRemove.has(i) ? 'text-red-700' : 'text-gray-700'}">
                            Página ${i}
                        </span>
                    </div>
                `;

        pageElement.addEventListener('click', () => togglePageSelection(i));
        container.appendChild(pageElement);
    }

    lucide.createIcons();
}

function togglePageSelection(pageNum) {
    if (pagesToRemove.has(pageNum)) {
        pagesToRemove.delete(pageNum);
    } else {
        pagesToRemove.add(pageNum);
    }

    // Atualizar visual
    const pageElement = document.querySelector(`.page-item[data-page="${pageNum}"]`);
    if (pageElement) {
        pageElement.className = `page-item p-3 border rounded-lg cursor-default transition-all ${pagesToRemove.has(pageNum)
            ? 'border-red-500 bg-red-50'
            : 'border-gray-200 hover:border-gray-300'
            }`;

        const icon = pageElement.querySelector('i');
        const text = pageElement.querySelector('span');

        if (icon) {
            icon.setAttribute('data-lucide', pagesToRemove.has(pageNum) ? 'x-circle' : 'file');
            icon.className = `w-5 h-5 ${pagesToRemove.has(pageNum) ? 'text-red-600' : 'text-gray-400'}`;
        }

        if (text) {
            text.className = `text-sm font-medium ${pagesToRemove.has(pageNum) ? 'text-red-700' : 'text-gray-700'}`;
        }
    }

    // Atualizar ícones
    lucide.createIcons();

    // Atualizar botão e contador
    updateCounter();
    document.getElementById('removeBtn').disabled = pagesToRemove.size === 0;
}

function updateCounter() {
    const countElement = document.getElementById('selectedCount');
    if (pagesToRemove.size === 0) {
        countElement.textContent = 'Nenhuma página selecionada para remover';
        countElement.className = 'text-sm text-gray-500';
    } else {
        countElement.textContent = `${pagesToRemove.size} página${pagesToRemove.size !== 1 ? 's' : ''} selecionada${pagesToRemove.size !== 1 ? 's' : ''} para remover`;
        countElement.className = 'text-sm font-medium text-red-600';
    }
}

// ============================================
// CONTROLES
// ============================================
function selectAllPages() {
    pagesToRemove.clear();
    for (let i = 1; i <= totalPages; i++) {
        pagesToRemove.add(i);
    }

    createPagesList();
    updateCounter();
    document.getElementById('removeBtn').disabled = false;
}

function clearSelection() {
    pagesToRemove.clear();
    createPagesList();
    updateCounter();
    document.getElementById('removeBtn').disabled = true;
}

function applyPagesFromInput() {
    const input = document.getElementById('pagesInput').value.trim();
    if (!input) return;

    pagesToRemove.clear();
    const parts = input.split(',');

    for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
            // Intervalo
            const [startStr, endStr] = trimmed.split('-');
            const start = parseInt(startStr);
            const end = parseInt(endStr);

            if (!isNaN(start) && !isNaN(end) && start <= end) {
                for (let i = start; i <= end; i++) {
                    if (i >= 1 && i <= totalPages) {
                        pagesToRemove.add(i);
                    }
                }
            }
        } else {
            // Página única
            const page = parseInt(trimmed);
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                pagesToRemove.add(page);
            }
        }
    }

    createPagesList();
    updateCounter();
    document.getElementById('removeBtn').disabled = pagesToRemove.size === 0;
}

// ============================================
// PROCESSAMENTO
// ============================================
async function removeSelectedPages() {
    if (!currentFile || pagesToRemove.size === 0) return;

    const removeBtn = document.getElementById('removeBtn');
    const originalText = removeBtn.innerHTML;

    // Mostrar loading
    removeBtn.disabled = true;
    removeBtn.innerHTML = `
                <div class="flex items-center space-x-2">
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processando...</span>
                </div>
            `;

    try {
        // Preparar dados
        const operationData = {
            fileName: currentFile.name,
            fileBuffer: await currentFile.arrayBuffer(),
            pagesToRemove: Array.from(pagesToRemove).sort((a, b) => a - b)
        };

        // console.log('Removendo páginas:', operationData);
        const result = await window.api.initCut(operationData)
        if (!result.error) {
            backToUpload();
        }

    } catch (error) {
        alert('Erro ao processar o PDF. Tente novamente.');
        console.error(error);
    } finally {
        // Restaurar botão
        removeBtn.disabled = false;
        removeBtn.innerHTML = originalText;
    }
}

// ============================================
// NAVEGAÇÃO
// ============================================
function backToUpload() {
    document.getElementById('uploadScreen').classList.remove('hidden');
    document.getElementById('selectionScreen').classList.add('hidden');
    document.getElementById('selectionScreen').classList.remove('flex');

    // Resetar
    currentFile = null;
    pagesToRemove.clear();
    totalPages = 0;
    document.getElementById('fileInput').value = '';
}

// ============================================
// HOTKEY ESC
// ============================================
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !document.getElementById('selectionScreen').classList.contains('hidden')) {
        backToUpload();
    }
});

// Adicionar animação
const style = document.createElement('style');
style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin {
                animation: spin 1s linear infinite;
            }
            .page-item {
                transition: all 0.2s ease;
            }
        `;
document.head.appendChild(style);