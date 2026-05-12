// 預設單字數據 (初始10個，可擴展到1000+)
const defaultWords = [
    { english: 'apple', chinese: '蘋果', pos: '名詞 (n.)', example: 'I eat an apple every day.' },
    { english: 'book', chinese: '書', pos: '名詞 (n.)', example: 'She reads a book.' },
    { english: 'cat', chinese: '貓', pos: '名詞 (n.)', example: 'The cat is sleeping.' },
    { english: 'dog', chinese: '狗', pos: '名詞 (n.)', example: 'My dog is friendly.' },
    { english: 'eat', chinese: '吃', pos: '動詞 (v.)', example: 'I eat breakfast at 7 AM.' },
    { english: 'friend', chinese: '朋友', pos: '名詞 (n.)', example: 'He is my best friend.' },
    { english: 'go', chinese: '去', pos: '動詞 (v.)', example: 'I go to school by bus.' },
    { english: 'happy', chinese: '快樂的', pos: '形容詞 (adj.)', example: 'She looks happy today.' },
    { english: 'house', chinese: '房子', pos: '名詞 (n.)', example: 'They live in a big house.' },
    { english: 'run', chinese: '跑', pos: '動詞 (v.)', example: 'He can run very fast.' }
];

// 全域變數
let allWords = JSON.parse(localStorage.getItem('words')) || defaultWords;
let filteredWords = [...allWords];
let currentIndex = 0;
let currentPage = 1;
let itemsPerPage = 20;
let currentView = 'card';

// DOM 元素 - 導覽
const cardViewBtn = document.getElementById('cardViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const adminViewBtn = document.getElementById('adminViewBtn');

// DOM 元素 - 視圖容器
const cardView = document.getElementById('cardView');
const listView = document.getElementById('listView');
const adminView = document.getElementById('adminView');

// DOM 元素 - 卡片模式
const card = document.getElementById('card');
const wordEl = document.getElementById('word');
const chineseEl = document.getElementById('chinese');
const posEl = document.getElementById('partOfSpeech');
const exampleEl = document.getElementById('example');
const wordNumberEl = document.getElementById('wordNumber');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const randomBtn = document.getElementById('randomBtn');

// DOM 元素 - 搜尋
const searchInput = document.getElementById('searchInput');
const searchResult = document.getElementById('searchResult');

// DOM 元素 - 列表模式
const itemsPerPageSelect = document.getElementById('itemsPerPage');
const wordsTableBody = document.getElementById('wordsTableBody');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const currentPageEl = document.getElementById('currentPage');
const totalPagesEl = document.getElementById('totalPages');
const pageInput = document.getElementById('pageInput');
const goToPageBtn = document.getElementById('goToPageBtn');

// DOM 元素 - 管理介面
const addWordForm = document.getElementById('addWordForm');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const clearBtn = document.getElementById('clearBtn');

// DOM 元素 - 統計
const wordCountEl = document.getElementById('wordCount');

// ===== 初始化 =====
function init() {
    updateWordCount();
    displayWord();
    setupEventListeners();
    refreshListView();
}

function updateWordCount() {
    wordCountEl.textContent = `單字總數: ${allWords.length}`;
}

// ===== 事件監聽器 =====
function setupEventListeners() {
    // 視圖切換
    cardViewBtn.addEventListener('click', () => switchView('card'));
    listViewBtn.addEventListener('click', () => switchView('list'));
    adminViewBtn.addEventListener('click', () => switchView('admin'));

    // 卡片模式
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + filteredWords.length) % filteredWords.length;
        displayWord();
    });
    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % filteredWords.length;
        displayWord();
    });
    randomBtn.addEventListener('click', () => {
        currentIndex = Math.floor(Math.random() * filteredWords.length);
        displayWord();
    });

    // 搜尋
    searchInput.addEventListener('input', handleSearch);

    // 列表模式
    itemsPerPageSelect.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        refreshListView();
    });
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            refreshListView();
        }
    });
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            refreshListView();
        }
    });
    goToPageBtn.addEventListener('click', () => {
        const pageNum = parseInt(pageInput.value);
        const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
        if (pageNum > 0 && pageNum <= totalPages) {
            currentPage = pageNum;
            pageInput.value = '';
            refreshListView();
        } else {
            alert(`請輸入 1 到 ${totalPages} 之間的頁碼`);
        }
    });

    // 管理介面
    addWordForm.addEventListener('submit', handleAddWord);
    exportBtn.addEventListener('click', handleExport);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', handleImport);
    clearBtn.addEventListener('click', handleClear);
}

// ===== 視圖切換 =====
function switchView(view) {
    // 隱藏所有視圖
    cardView.classList.remove('active');
    listView.classList.remove('active');
    adminView.classList.remove('active');

    // 移除所有按鈕的 active 類別
    cardViewBtn.classList.remove('active');
    listViewBtn.classList.remove('active');
    adminViewBtn.classList.remove('active');

    // 顯示選擇的視圖
    currentView = view;
    switch (view) {
        case 'card':
            cardView.classList.add('active');
            cardViewBtn.classList.add('active');
            break;
        case 'list':
            listView.classList.add('active');
            listViewBtn.classList.add('active');
            currentPage = 1;
            refreshListView();
            break;
        case 'admin':
            adminView.classList.add('active');
            adminViewBtn.classList.add('active');
            break;
    }
}

// ===== 卡片模式 =====
function displayWord() {
    if (filteredWords.length === 0) {
        wordEl.textContent = '沒有符合的單字';
        chineseEl.textContent = '';
        posEl.textContent = '';
        exampleEl.textContent = '';
        wordNumberEl.textContent = '0 / 0';
        return;
    }

    if (currentIndex >= filteredWords.length) {
        currentIndex = 0;
    }

    const word = filteredWords[currentIndex];
    wordEl.textContent = word.english;
    chineseEl.textContent = word.chinese;
    posEl.textContent = word.pos;
    exampleEl.textContent = word.example;
    wordNumberEl.textContent = `${currentIndex + 1} / ${filteredWords.length}`;
    card.classList.remove('flipped');
}

// ===== 搜尋功能 =====
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();

    if (query === '') {
        filteredWords = [...allWords];
        searchResult.textContent = '';
    } else {
        filteredWords = allWords.filter(word => 
            word.english.toLowerCase().includes(query) ||
            word.chinese.toLowerCase().includes(query)
        );
        searchResult.textContent = `找到 ${filteredWords.length} 個結果`;
    }

    currentIndex = 0;
    currentPage = 1;

    // 如果在卡片模式，更新顯示
    if (currentView === 'card') {
        displayWord();
    } else if (currentView === 'list') {
        refreshListView();
    }
}

// ===== 列表模式 =====
function refreshListView() {
    const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageWords = filteredWords.slice(startIndex, endIndex);

    // 更新表格
    wordsTableBody.innerHTML = '';
    pageWords.forEach((word, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="index">${startIndex + index + 1}</td>
            <td><strong>${word.english}</strong></td>
            <td>${word.chinese}</td>
            <td>${word.pos}</td>
            <td>${word.example}</td>
        `;
        wordsTableBody.appendChild(tr);
    });

    // 更新分頁資訊
    currentPageEl.textContent = `第 ${currentPage} 頁`;
    totalPagesEl.textContent = `共 ${totalPages} 頁`;

    // 更新按鈕狀態
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// ===== 管理介面 =====
function handleAddWord(e) {
    e.preventDefault();
    const english = document.getElementById('english').value.trim();
    const chinese = document.getElementById('chineseInput').value.trim();
    const pos = document.getElementById('pos').value.trim();
    const example = document.getElementById('exampleInput').value.trim();

    if (english && chinese && pos && example) {
        allWords.push({ english, chinese, pos, example });
        localStorage.setItem('words', JSON.stringify(allWords));
        addWordForm.reset();
        alert('單字已新增！');
        
        // 重置篩選和索引
        filteredWords = [...allWords];
        currentIndex = allWords.length - 1;
        updateWordCount();
        
        if (currentView === 'card') {
            displayWord();
        }
    } else {
        alert('請填寫所有欄位。');
    }
}

function handleExport() {
    const dataStr = JSON.stringify(allWords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `words-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported) && imported.length > 0) {
                allWords = imported;
                localStorage.setItem('words', JSON.stringify(allWords));
                filteredWords = [...allWords];
                currentIndex = 0;
                currentPage = 1;
                updateWordCount();
                alert(`成功匯入 ${imported.length} 個單字！`);
                if (currentView === 'card') {
                    displayWord();
                } else if (currentView === 'list') {
                    refreshListView();
                }
            } else {
                alert('檔案格式不正確或為空！');
            }
        } catch (err) {
            alert('無法解析 JSON 檔案！');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function handleClear() {
    if (confirm('確定要清空所有單字嗎？此操作無法復原！')) {
        if (confirm('再次確認：這將永久刪除所有單字。')) {
            allWords = [];
            filteredWords = [];
            localStorage.setItem('words', JSON.stringify(allWords));
            currentIndex = 0;
            currentPage = 1;
            updateWordCount();
            displayWord();
            refreshListView();
            alert('所有單字已清空。');
        }
    }
}

// 初始化
init();