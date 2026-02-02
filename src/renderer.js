document.addEventListener("DOMContentLoaded", async () => {
    loadFiles()
    const result = await window.api.getMemory()
    document.getElementById("memory").innerText = result.memory + " armazenamento disponível"
})

function openJoin() {
    window.api.openJoinWindow()
}

function openCut() {
    window.api.openCutWindow()
}




const loadFiles = async () => {
    const files = await window.api.getAllfiles()
    listFiles = document.getElementById("list-files")
    files.forEach((file) => {
        const color = file.type === "merge" ? "red" : "green";
        listFiles.innerHTML += `
    <div onclick="window.api.openFile(${file.path})" class="px-4 py-3 hover:bg-gray-50 cursor-default">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded bg-${color}-500 flex items-center justify-center">
            <i data-lucide="file-text" class="w-4 h-4 text-${color}-500"></i>
          </div>
          <div>
            <h4 class="font-medium text-gray-800 text-sm">${file.name}</h4>
            <p class="text-gray-500 text-xs">
              Modificado ${timeAgoIntl(file.timestamp)} • ${file.pages} páginas
            </p>
          </div>
        </div>
        <button class="p-1 hover:bg-gray-100 rounded">
          <i data-lucide="more-vertical" class="w-4 h-4 text-gray-500"></i>
        </button>
      </div>
    </div>
  `;
    });



    function timeAgoIntl(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const seconds = Math.floor((now - date) / 1000);

        const rtf = new Intl.RelativeTimeFormat('mz', { numeric: 'auto' });

        if (seconds < 60) return rtf.format(-seconds, 'second');
        if (seconds < 3600) return rtf.format(-Math.floor(seconds / 60), 'minute');
        if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), 'hour');
        if (seconds < 604800) return rtf.format(-Math.floor(seconds / 86400), 'day');
        if (seconds < 2592000) return rtf.format(-Math.floor(seconds / 604800), 'week');
        if (seconds < 31536000) return rtf.format(-Math.floor(seconds / 2592000), 'month');
        return rtf.format(-Math.floor(seconds / 31536000), 'year');
    }

}

