document.addEventListener("DOMContentLoaded", async () => {
    loadFiles()
    const result = await window.api.getMemory()
    document.getElementById("memory").innerText = result.memory + " de HD disponível"

    document.querySelectorAll(".file-item").forEach((el) => {
      el.addEventListener("click", () => {
        const file = el.querySelector(".path").value;
        window.api.openFile(file)
      })
    })
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
        const color = file.type === "merge" ? "bg-red-400" : "bg-green-400";
        listFiles.innerHTML += `
    <div class="file-item px-4 py-3 hover:bg-gray-100 cursor-default" title="Clique para abrir o arquivo.">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
        <input type="hidden" class="path" value="${file.path}">
          <div class="w-8 h-8 rounded ${color} flex items-center justify-center">
          
            <i data-lucide="file-text" class="w-4 h-4 text-slate-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text-icon lucide-file-text"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
            </i>
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
