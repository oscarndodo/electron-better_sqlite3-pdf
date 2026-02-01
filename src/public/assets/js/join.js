// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let files = []; // Array para armazenar todos os arquivos
let sortable = null; // Instância do SortableJS
let nextFileId = 1; // Contador para IDs únicos

// ============================================
// INICIALIZAÇÃO
// ============================================
// Inicializar ícones do Lucide
lucide.createIcons();

// Configurar quando a página carrega
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    setupDragAndDrop();
});

// ============================================
// CONFIGURAÇÃO DOS EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Input de arquivo principal
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileSelect);

    // Input de arquivo adicional
    const additionalFileInput = document.getElementById('additionalFileInput');
    additionalFileInput.addEventListener('change', handleAdditionalFiles);
}

// ============================================
// DRAG & DROP PARA UPLOAD
// ============================================
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');

    // Prevenir comportamentos padrão
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight durante drag
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('border-green-400', 'bg-green-50');
        }, false);
    });

    // Remover highlight
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('border-green-400', 'bg-green-50');
        }, false);
    });

    // Lidar com arquivos soltos
    dropZone.addEventListener('drop', function (e) {
        const dt = e.dataTransfer;
        const droppedFiles = dt.files;

        if (droppedFiles.length > 0) {
            processFiles(Array.from(droppedFiles));
        }
    }, false);
}

// ============================================
// FUNÇÕES DE CONTROLE DE ARQUIVOS
// ============================================
function triggerFileInput() {
    console.log('Abrindo seletor de arquivos principal');
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    console.log('Arquivos selecionados no input principal');
    const selectedFiles = Array.from(event.target.files);
    processFiles(selectedFiles);
}

function addMoreFiles() {
    console.log('Abrindo seletor de arquivos adicionais');
    document.getElementById('additionalFileInput').click();
}

function handleAdditionalFiles(event) {
    console.log('Arquivos adicionais selecionados');
    const selectedFiles = Array.from(event.target.files);
    processFiles(selectedFiles, true); // true = são adicionais
}

async function processFiles(fileList, isAdditional = false) {
    console.log('Iniciando processamento de arquivos...');

    // Se não for arquivo adicional, limpar array existente
    if (!isAdditional) {
        files = [];
        nextFileId = 1;
    }

    // Verificar limite de 10 arquivos
    if (files.length + fileList.length > 10) {
        // alert('Máximo de 10 arquivos permitidos. Remova alguns arquivos antes de adicionar mais.');
        return;
    }

    // Processar cada arquivo
    for (const file of fileList) {
        // Validar se é PDF
        if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
            // alert(`"${file.name}" não é um PDF válido.`);
            continue;
        }

        // Criar objeto para o arquivo
        const fileObj = {
            id: nextFileId++,
            name: file.name.length > 40 ? file.name.substring(0, 37) + '...' : file.name,
            originalName: file.name,
            size: (file.size / (1024 * 1024)).toFixed(1),
            pages: await getSimulatedPageCount(),
            file: file
        };

        files.push(fileObj);
    }

    // Se for a primeira vez e temos arquivos, mostrar listagem
    if (!isAdditional && files.length > 0) {
        showListArea();
    } else if (isAdditional) {
    }

    // Atualizar interface
    renderFileList();
    updateStats();

    // Limpar inputs
    document.getElementById('fileInput').value = '';
    document.getElementById('additionalFileInput').value = '';
}

async function getSimulatedPageCount() {
    // Simulação - em produção usar pdf.js
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(Math.floor(Math.random() * 25) + 1);
        }, 50);
    });
}

// ============================================
// CONTROLE DE VISUALIZAÇÃO
// ============================================
function showListArea() {
    document.getElementById('uploadArea').classList.add('hidden');
    document.getElementById('listArea').classList.remove('hidden');
    document.getElementById('listArea').classList.add('flex');
    initSortable();
}

function backToUpload() {
    // RESETAR COMPLETAMENTE A LISTA
    files = [];
    nextFileId = 1;

    // Atualizar interface para estado vazio
    renderFileList();
    updateStats();

    // Mostrar área de upload
    document.getElementById('uploadArea').classList.remove('hidden');
    document.getElementById('listArea').classList.add('hidden');
    document.getElementById('listArea').classList.remove('flex');
}

// ============================================
// RENDERIZAÇÃO DA LISTA DE ARQUIVOS
// ============================================
function renderFileList() {
    const filesList = document.getElementById('filesList');
    const emptyListMessage = document.getElementById('emptyListMessage');
    const mergeBtn = document.getElementById('mergeBtn');

    // Verificar se há arquivos
    if (files.length === 0) {
        if (emptyListMessage) emptyListMessage.classList.remove('hidden');
        if (mergeBtn) mergeBtn.disabled = true;
        if (filesList) filesList.innerHTML = '';
        return;
    }

    // Esconder mensagem de lista vazia
    if (emptyListMessage) emptyListMessage.classList.add('hidden');

    // Habilitar botão se tiver pelo menos 2 arquivos
    if (mergeBtn) {
        mergeBtn.disabled = files.length < 2;
    }

    // Limpar lista atual
    if (filesList) {
        filesList.innerHTML = '';

        // Adicionar cada arquivo à lista
        files.forEach((file, index) => {
            const fileElement = createFileElement(file, index);
            filesList.appendChild(fileElement);
        });

    }

    // Re-inicializar SortableJS para drag & drop
    initSortable();

    // Atualizar ícones Lucide
    lucide.createIcons();
}

function createFileElement(file, index) {
    // Criar elemento div para o arquivo
    const div = document.createElement('div');
    div.className = 'file-item bg-white border border-gray-200 rounded-lg p-4 hover:border-green-300 group transition-all duration-200';
    div.dataset.id = file.id;

    // Adicionar efeito visual de entrada
    div.style.animation = 'fadeIn 0.3s ease-out';

    // Definir conteúdo HTML - SEM ÍCONES DE SETAS
    div.innerHTML = `
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <!-- Área de arraste com feedback visual -->
                        <div class="relative cursor-move handle" title="Arraste para reordenar">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                                <i data-lucide="file-text" class="w-5 h-5 text-green-700"></i>
                            </div>
                            <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-800 text-white text-xs rounded-full flex items-center justify-center font-medium order-number">
                                ${index + 1}
                            </div>
                            <div class="absolute -bottom-1 -right-1 w-4 h-4">
                                <i data-lucide="grip-vertical" class="w-3 h-3 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></i>
                            </div>
                        </div>
                        
                        <!-- Informações do arquivo -->
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center space-x-2 mb-1">
                                <h4 class="font-medium text-sm text-gray-900 truncate">${file.name}</h4>
                            </div>
                            <div class="flex items-center space-x-3 text-sm text-gray-500">
                                <span>${file.pages} páginas</span>
                                <span>•</span>
                                <span>${file.size} MB</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Apenas botão de remover -->
                    <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button class="remove-btn p-1.5 hover:bg-red-50 hover:text-red-600 rounded transition-all duration-200" title="Remover arquivo">
                            <i data-lucide="trash-2" class="w-4 h-4 text-gray-500"></i>
                        </button>
                    </div>
                </div>
            `;

    // Adicionar event listener ao botão de remover
    const removeBtn = div.querySelector('.remove-btn');

    if (removeBtn) {
        removeBtn.addEventListener('click', function (event) {
            event.stopPropagation(); // Evitar propagação
            removeFile(file.id);
        });

        // Adicionar feedback visual ao hover do botão
        removeBtn.addEventListener('mouseenter', function () {
            this.classList.add('scale-110');
        });

        removeBtn.addEventListener('mouseleave', function () {
            this.classList.remove('scale-110');
        });
    }

    return div;
}

// ============================================
// SORTABLEJS - DRAG & DROP PARA REORDENAÇÃO
// ============================================
function initSortable() {
    const filesList = document.getElementById('filesList');

    if (!filesList || files.length === 0) {
        return;
    }

    // Destruir instância anterior se existir
    if (sortable) {
        sortable.destroy();
    }

    // Criar nova instância
    sortable = Sortable.create(filesList, {
        animation: 150,
        handle: '.handle',
        ghostClass: 'bg-green-50',
        chosenClass: 'border-green-400',
        dragClass: 'opacity-50',

        // Feedback durante o arraste
        onStart: function (evt) {
            console.log('Iniciando arraste do item');
            evt.item.classList.add('shadow-lg');
        },

        // Quando o arraste termina
        onEnd: function (evt) {
            console.log('Arraste terminado');
            evt.item.classList.remove('shadow-lg');

            // Obter índices antigo e novo
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;


            // Se a posição mudou
            if (oldIndex !== newIndex) {
                // Mover arquivo no array
                const [movedFile] = files.splice(oldIndex, 1);
                files.splice(newIndex, 0, movedFile);

                // Atualizar números de ordem
                updateOrderNumbers();
                // Atualizar estatísticas
                updateStats();

                // Feedback visual
                showReorderFeedback(newIndex);
            }
        }
    });

}

// Atualizar números de ordem (1, 2, 3...)
function updateOrderNumbers() {
    const fileItems = document.querySelectorAll('.file-item');

    fileItems.forEach((item, index) => {
        const orderNumber = item.querySelector('.order-number');
        if (orderNumber) {
            orderNumber.textContent = index + 1;
        }

        // Efeito visual para mostrar que a ordem mudou
        item.classList.add('border-green-400');
        setTimeout(() => {
            item.classList.remove('border-green-400');
        }, 500);
    });
}

// Feedback visual após reordenar
function showReorderFeedback(newIndex) {
    const fileItems = document.querySelectorAll('.file-item');
    if (fileItems[newIndex]) {
        fileItems[newIndex].classList.add('bg-green-50');
        setTimeout(() => {
            fileItems[newIndex].classList.remove('bg-green-50');
        }, 1000);
    }
}

// ============================================
// FUNÇÕES DE MANIPULAÇÃO DE ARQUIVOS
// ============================================
function removeFile(fileId) {
    // Encontrar índice do arquivo
    const index = files.findIndex(f => f.id === fileId);

    if (index === -1) {
        console.log(`Arquivo ID ${fileId} não encontrado`);
        return;
    }


    // Feedback visual antes de remover
    const fileItem = document.querySelector(`.file-item[data-id="${fileId}"]`);
    if (fileItem) {
        fileItem.classList.add('opacity-50', 'scale-95');

        // Aguardar animação antes de remover
        setTimeout(() => {
            // Remover do array
            const removedFile = files.splice(index, 1)[0];
            console.log(`Arquivo removido: ${removedFile.name}`);

            // Re-renderizar lista
            renderFileList();
            updateStats();

            // Se não houver mais arquivos, voltar para upload
            if (files.length === 0) {
                console.log('Lista vazia após remoção, voltando para upload');
                backToUpload();
            } else {
                console.log(`Restam ${files.length} arquivo(s) na lista`);
            }
        }, 300);
    }
}

// ============================================
// ESTATÍSTICAS
// ============================================
function updateStats() {
    // Calcular totais
    const totalPages = files.reduce((sum, file) => sum + file.pages, 0);
    const totalSize = files.reduce((sum, file) => sum + parseFloat(file.size), 0);

    // Atualizar interface
    document.getElementById('fileCountText').textContent = `${files.length} arquivo${files.length !== 1 ? 's' : ''}`;
    document.getElementById('pageCountText').textContent = `${totalPages} página${totalPages !== 1 ? 's' : ''}`;
    document.getElementById('totalSizeText').textContent = `${totalSize.toFixed(1)} MB`;

}

// ============================================
// PROCESSAMENTO DO MERGE
// ============================================
async function mergePDFs() {

    // Verificar se há arquivos suficientes
    if (files.length < 2) {
        return;
    }

    const mergeBtn = document.getElementById('mergeBtn');
    const originalContent = mergeBtn.innerHTML;

    // Mostrar estado de carregamento
    mergeBtn.disabled = true;
    mergeBtn.innerHTML = `
                <div class="flex items-center space-x-2">
                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processando...</span>
                </div>
            `;

    try {
       

        const mergeData = await prepareMergeData(files);
    // const result = await window.api.invoke("init-merge", mergeData);


        const result = await window.api.initMerge(mergeData)

        if (result.db || result.db > 0){
            window.navigator.reload()
        }

        // Se o utilizador cancelou ou houve falha
        if (!result || result.error) {
            throw new Error('Operação cancelada pelo utilizador');
        }

        // Apenas aqui limpamos tudo
        files = [];
        nextFileId = 1;

        backToUpload();
        renderFileList();
        updateStats();

    } catch (error) {
        console.error('Erro no merge:', error);
        // alert(`Erro ao juntar PDFs: ${error.message}`);
    } finally {
        mergeBtn.disabled = false;
        mergeBtn.innerHTML = originalContent;
    }

}

async function prepareMergeData(files) {
    const filesWithBuffer = [];

    for (const file of files) {
        const arrayBuffer = await file.file.arrayBuffer(); // pega os bytes do PDF
        filesWithBuffer.push({
            order: files.indexOf(file),
            name: file.originalName,
            size: parseFloat(file.size),
            pages: file.pages,
            buffer: arrayBuffer // <-- aqui vai o ArrayBuffer
        });
    }

    return {
        files: filesWithBuffer,
        metadata: {
            totalFiles: files.length,
            totalPages: files.reduce((sum, f) => sum + f.pages, 0),
            totalSizeMB: parseFloat(files.reduce((sum, f) => sum + parseFloat(f.size), 0).toFixed(1))
        }
    };
}


// ============================================
// HOTKEY ESC
// ============================================
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const listArea = document.getElementById('listArea');
        if (!listArea.classList.contains('hidden')) {
            backToUpload();
        }
    }
});

// Adicionar CSS para animações
const style = document.createElement('style');
style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .file-item {
                animation: fadeIn 0.3s ease-out;
            }
            
            .sortable-chosen {
                border-color: #3b82f6 !important;
                background-color: #eff6ff !important;
            }
            
            .sortable-ghost {
                opacity: 0.4;
                background-color: #dbeafe !important;
            }
        `;
document.head.appendChild(style);