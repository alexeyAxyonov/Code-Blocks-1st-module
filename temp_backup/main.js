class TestBlock {
    constructor(id, element) {
        this.id = id;
        this.element = element;
        this.past_block = null;
        this.next_block = null;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('start');
    const actionBtn = document.getElementById('action');
    
    if (!startBtn || !actionBtn) {
        console.error('Элементы блоков не найдены!');
        return;
    }
    
    const startBlock = new TestBlock('start', startBtn);
    const actionBlock = new TestBlock('action', actionBtn);
    
    startBlock.next_block = actionBlock;
    actionBlock.past_block = startBlock;
    
    console.log('Созданы блоки:');
    console.log('Стартовый блок:', startBlock);
    console.log('Блок действия:', actionBlock);
    console.log('Связь: start.next_block =', startBlock.next_block.id);
});

function StartProgram() {
    alert('Программа запущена!');
    console.log('Программа выполнена пользователем.');
}

const startButton = document.getElementById('start_btn');
if (startButton) {
    startButton.addEventListener('click', StartProgram);
} else {
    console.error('Кнопка запуска не найдена!');
}

document.addEventListener('DOMContentLoaded', function() {
    const blocks = document.querySelectorAll('.block');
    
    for (let block of blocks) {
        if (block.id === 'start') {
            block.dataset.type = 'start';
            block.dataset.info = 'Начало программы';
        } else if (block.id === 'action') {
            block.dataset.type = 'action';
            block.dataset.info = 'Основное действие';
        }
        
        console.log(`Блок ${block.id}:`, block.dataset);
    }
});

const blocksContainer = document.querySelector('.blocks-container');


function getNextElement(cursorPositionY, currentElement) {
    
    const currentElementCoord = currentElement.getBoundingClientRect();
    
    const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;

    const nextElement = (cursorPositionY < currentElementCenter) 
        ? currentElement 
        : currentElement.nextElementSibling;
    
    return nextElement;
}

blocksContainer.addEventListener('dragstart', (evt) => {
    evt.target.classList.add('dragging');
    
    evt.dataTransfer.setData('text/plain', evt.target.id);
});

blocksContainer.addEventListener('dragend', (evt) => {
    
    evt.target.classList.remove('dragging');
});

blocksContainer.addEventListener('dragover', (evt) => {
    evt.preventDefault();

    const activeElement = blocksContainer.querySelector('.dragging');
    
    const currentElement = evt.target.closest('.block');

    if (!activeElement || !currentElement || activeElement === currentElement) {
        return;
    }

    const nextElement = getNextElement(evt.clientY, currentElement);

    if (nextElement && activeElement === nextElement.previousElementSibling) {
        return;
    }

    blocksContainer.insertBefore(activeElement, nextElement);
    
    console.log('Новый порядок блоков:', 
        Array.from(blocksContainer.children).map(el => el.id));
});

blocksContainer.addEventListener('drop', (evt) => {
    evt.preventDefault();
});