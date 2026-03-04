let variables = {
    data: {},
    metadata: {},

    get_variable(var_name){
        return this.data[var_name];
    },

    set_variable(var_name, value){
        this.data[var_name] = value;
    },

    is_variable_name(var_name){
        //Проверяет, существует ли уже название var_name в data
        if (!this.data[var_name]){
            return false;
        }
        else{
            return true;
        }
    }
};
let arrays = {
    data: {},
    metadata: {},

    get_array(arr_name){
        return this.data[arr_name];
    },

    make_array(arr_name, length, values=[]){
        if (!this.data[arr_name]){
            this.data[arr_name] = new FixedArray(length, values);
        }
        else{
            //Универсальная ошибка. Текст: "Массив [arr_name] уже существует"
        }
    },

    set_array(arr_name, values){
        this.data[arr_name].fill(values);
    },

    is_array_name(arr_name){
        //Проверяет, существует ли уже название arr_name в data
        if (!this.data[arr_name]){
            return false;
        }
        else{
            return true;
        }
    }
};

class FixedArray {
    constructor(length, elements=[]) {
        this._length = length;
        this._data = [...elements];
        Object.defineProperty(this, 'length', {
            get: () => this._length,
            enumerable: true,
            configurable: false
        });
    }

    fill(elements){
        //Оператор присваивания такой, т.к. перегрузки в js не существует
        if (elements.length <= this._length){
            this._data = [...elements];
        }
        else{
            //Универсальная ошибка. Текст: "Количество значений превышает длину массива"
        }
    }
    
    get(index) {
        if (index < 0 || index >= this._length) {
            //Универсальная ошибка. Текст: "Индекс вне диапазона"
        }
        return this._data[index];
    }
    
    set(index, value) {
        if (index < 0 || index >= this._length) {
            //Универсальная ошибка. Текст: "Индекс вне диапазона"
        }
        this._data[index] = value;
    }
    
    [Symbol.iterator]() {
        //Делает массив итерируемым
        return this._data[Symbol.iterator]();
    }
    
    toArray() {
        //Возвращает все данные в виде списка
        return [...this._data];
    }
}

function is_valid_variable_name(str_var){
        const forbidden_characters = [
        'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
        'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
        'for', 'function', 'if', 'import', 'in', 'instanceof', 'new',
        'return', 'super', 'switch', 'this', 'throw', 'try', 'typeof',
        'var', 'void', 'while', 'with', 'yield',
        'let', 'static', 'implements', 'interface', 'package', 'private',
        'protected', 'public', 'await'];
        
        if (forbidden_characters.includes(str_var)){
            return false;
        }
        const regex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
        if (!regex.test(str_var)){
            return false;
        }
        
        if (variables.is_variable_name(str_var) || 
            arrays.is_array_name(str_var)){
                return false;
        }
        return true;
    }

function VariablePopUp(){

}

function ArrayPopUp(){

}

function AddVariables(vars){
    //Получает список переменных из variables
    let intermediate_value = vars.split(/\s*,\s*/).filter(item => item !== '');
    for (let i = 0; i < intermediate_value.length; i++){
        if (is_valid_variable_name(intermediate_value[i])){
            variables.set_variable(intermediate_value[i], 0);
            //TODO: добавить объекты VariableBlock.
        }
        else{
            //Универсальная ошибка. Текст: "Невозможно создать переменную с названием [intermediate_value[i]]"
        }
    }
}

function AddArray(arr_name, len){
    if (is_valid_variable_name(arr_name)){
        arrays.make_array(arr_name, len);
        //TODO: добавить объект ArrayBlock (по сути тот же VariableBlock, но обращается он
        //к arrays а не к variables)
    }
    else{
        //Универсальная ошибка. Текст: "Невозможно создать массив с названием [arr_name]"
    }
}

//Всё что за этим комментом возможно нужно разбросать в отдельный файл

class BaseBlock{
    //Если хотите изменить поведение всех блоков в целом, то изменяйте этот класс. От него будут наследоваться все остальные блоки
    /* Планируемое поведение BaseBlock:
    1. Drag-and-drop
    2. Подсветка при неправильной интерпретации
    3. */

    constructor(id, type, element = null){
        this.past_block = undefined;
        this.next_block = undefined;
        this.id = id;
        this.type = type;
        this.element = element;
        this.x = 0;
        this.y = 0;
        this.width = 100;
        this.height = 40;
    }
    add_next_block(block){
        if (this.next_block){
            this.remove_next_block();
        }
        this.next_block = block;
        if (block){
            block.past_block = this;
        }
    }
    remove_next_block(){
        if (this.next_block){
            this.next_block.past_block = undefined;
            this.next_block = undefined;
        }
    }
    add_past_block(block){
        if (this.past_block){
            this.remove_past_block();
        }
        this.past_block = block;
        if (block){
            block.next_block = this;
        }
    }
    remove_past_block(){
        if(this.past_block){
            this.past_block.next_block = undefined;
            this.past_block = undefined;
        }
    }

    insert_after(block) {
        if (!block) return;
        
        const oldNext = this.next_block;
        
        this.add_next_block(block);
        
        if (oldNext) {
            block.add_next_block(oldNext);
        }
    }

    insert_before(block) {
        if (!block) return;
        
        if (this.past_block) {
            this.past_block.insert_after(block);
        } else {
            block.add_next_block(this);
        }
    }

    get_first_block() {
        let current = this;
        while (current.past_block) {
            current = current.past_block;
        }
        return current;
    }
    
    get_last_block() {
        let current = this;
        while (current.next_block) {
            current = current.next_block;
        }
        return current;
    }
    
    is_first() {
        return !this.past_block;
    }
    
    is_last() {
        return !this.next_block;
    }
    

    execute(args){
        // Здесь ничего не будет, но в каждом блоке эта функция
        // Будпет переписываться.
    }

    raise_error(error_text, error_type='force_stop'){
        /*Вызывает ошибку в терминале. Значения error_type:
        1. force_stop: Выводит ошибку и останавливает программу. Выделяет блок с ошибкой.
        2. soft: Выводит ошибку, но программа продолжает работать (например, при
        создании переменной/массива с неправильным названием*/
    }
}

class StartBlock extends BaseBlock{
}

class EndBlock extends BaseBlock{
}

class ArithmeticOperationBlock extends BaseBlock {
    constructor(id) {
        super(id, 'arithmetic');
        this.left = null;
        this.right = null;
    }

    add_left(value){
        this.left = value;
    }

    add_right(value){
        this.right = value;
    }

    execute() {
        const leftValue = this.get_value(this.left);
        const rightValue = this.get_value(this.right);
        
        const result = this.operate(leftValue, rightValue);
        
        console.log(`Evaluated: ${leftValue} ${this.operator} ${rightValue} = ${result}`);
        return result;
    }

    get_value(something) {
        if (something instanceof ArithmeticOperationBlock) {
            return something.execute();
        }
        
        else if (something instanceof VariableBlock) {
            return something.get_var_value();
        }
        
        else {
            return something;
        }
    }

    operate(left, right) {

    }
}

class EqualsBlock extends ArithmeticOperationBlock{
    //Логический оператор сравнения
    constructor(id){
        super(id, "==");
    }
    operate(left, right){
        return left === right;
    }
}

class Plus extends ArithmeticOperationBlock{
    constructor(id){
        super(id, "+");
    }

    operate(left, right){
        if (typeof left === 'string' || typeof right === 'string') {
            return String(left) + String(right);
        }
        
        return left + right;
    }
}

class Minus extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, '-');
    }
    
    operate(left, right) {
        return left - right;
    }
}

class Multiply extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, '*');
    }
    
    operate(left, right) {
        return left * right;
    }
}

class Divide extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, '/');
    }
    
    operate(left, right) {
        if (right === 0) {
            // Универсальная ошибка: Деление на 0
            return 0;
        }
        return left / right;
    }
}

class Modulo extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, '%');
    }
    
    operate(left, right) {
        if (right === 0) {
            // Универсальная ошибка: модуль по нулю
            return 0;
        }
        return left % right;
    }
}

class Power extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, '^');
    }
    
    operate(left, right) {
        return Math.pow(left, right);
    }
}

class GreaterThanBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, '>');
    }
    
    operate(left, right) {
        return left > right;
    }
}

class LessThanBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, '<');
    }
    
    operate(left, right) {
        return left < right;
    }
}

class GreaterThanOrEqualBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, '>=');
    }
    
    operate(left, right) {
        return left >= right;
    }
}

class LessThanOrEqualBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, '<=');
    }
    
    operate(left, right) {
        return left <= right;
    }
}

class NotEqualsBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, '!=');
    }
    
    operate(left, right) {
        return left !== right;
    }
}

class AndBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, '&&');
    }
    
    operate(left, right) {
        return Boolean(left) && Boolean(right);
    }
}

class OrBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, '||');
    }
    
    operate(left, right) {
        return Boolean(left) || Boolean(right);
    }
}

class NotBlock extends ArithmeticOperationBlock {
    // Есть только один! дочерний элемент, а не два, как у остальных.
    constructor(id) {
        super(id, '!');
    }
    
    execute() {
        const value = this.get_value(this.left);
        const result = !Boolean(value);
        console.log(`Not: ${value} -> ${result}`);
        return result;
    }
    
    operate(left, right) {
        return !Boolean(left);
    }
}


class AssignmentOperator extends ArithmeticOperationBlock{
    execute(args){
        let [var_name, value] = [args];
        this.assign(var_name, value);
    }
    assign(var_name, value){
        if (variables.get_variable(var_name)){
            variables.set_variable(var_name, value);
        }
        else if (arrays.data.get_array(var_name)){
            arrays.set_array(var_name, value);
        }
        else{
            //Универсальная ошибка. Текст: "Переменной/массива [var_name] не существует"
        }
    }
}

class VariableBlock extends BaseBlock{
    //Класс блоков с переменными. При наведении отображает значение
    //TODO: сделать отображение значения при наведении.

    constructor(id, name){
        super(id, 'variable');
        this.name = name;
    }

    get_var_value(){
        variables.get_variable(this.name);
    }
    execute(){

    }
}

class ArrayBlock extends BaseBlock{

}

class IfBlock extends BaseBlock{

}

class ElseBlock extends BaseBlock{

}

class ForBlock extends BaseBlock{

}

class WhileBlock extends BaseBlock{

}

class BlockManager {
    constructor() {
        this.blocks = new Map();
        this.connections = new Map(); //Место для соединения блоков
    }
    
    add_block(block) {
        this.blocks.set(block.id, block);
    }
    
    remove_block(id) {
        const block = this.blocks.get(id);
        if (block) {
            block.detach_next();
            block.detach_prev();
            this.blocks.delete(id);
            this.connections.delete(id);
        }
    }
    
    clear() {
        this.blocks.clear();
        this.connections.clear();
    }

    get_chain(startBlock) {
        const chain = [];
        let current = startBlock;
        while (current) {
            chain.push(current);
            current = current.next_block;
        }
        return chain;
    }
    
    //Место для соединения блоков
    connectBlocks(block1, block2) {
        if (!block1 || !block2) return;
        
        const id1 = block1.id || block1.textContent;
        const id2 = block2.id || block2.textContent;
        
        if (!this.connections.has(id1)) {
            this.connections.set(id1, []);
        }
        if (!this.connections.has(id2)) {
            this.connections.set(id2, []);
        }
        //связь блоков
        if (!this.connections.get(id1).includes(id2)) {
            this.connections.get(id1).push(id2);
        }
        if (!this.connections.get(id2).includes(id1)) {
            this.connections.get(id2).push(id1);
        }
        
        console.log('Blocks connected:', id1, id2);
    }
    //Разъединение блоков
    disconnectBlocks(block1, block2) {
        if (!block1 || !block2) return;
        
        const id1 = block1.id || block1.textContent;
        const id2 = block2.id || block2.textContent;
        //удаление связи 
        if (this.connections.has(id1)) {
            this.connections.set(id1, this.connections.get(id1).filter(id => id !== id2));
        }
        if (this.connections.has(id2)) {
            this.connections.set(id2, this.connections.get(id2).filter(id => id !== id1));
        }
        
        console.log('Blocks disconnected:', id1, id2);
    }
    //Проверка соединения
    areConnected(block1, block2) {
        const id1 = block1.id || block1.textContent;
        const id2 = block2.id || block2.textContent;
        
        return this.connections.has(id1) && this.connections.get(id1).includes(id2);
    }
    
    //проверка, есть ли у блока соединения
    hasConnections(block) {
        const id = block.id || block.textContent;
        return this.connections.has(id) && this.connections.get(id).length > 0;
    }
}

// Класс для drag-and-drop
class DragDropManager {
    constructor(blockManager, dropZone) {
        this.blockManager = blockManager;
        this.dropZone = dropZone;
        this.draggedBlock = null; //текущий блок
        this.draggedGroup = []; //группа блоков для группового перетаскивания
        this.dropIndicator = this.createDropIndicator();
        this.snapThreshold = 15;
        this.init();
    }

    //индикатор куда можно сбросить 
    createDropIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'drop-indicator';
        this.dropZone.appendChild(indicator);
        return indicator;
    }

    init() {
        // Все блоки перетаскиваемые
        document.querySelectorAll('#sidebar .block-item').forEach(block => {
            block.setAttribute('draggable', 'true');
            block.addEventListener('dragstart', (e) => this.handleDragStart(e, block));
            block.addEventListener('dragend', () => this.handleDragEnd());
        });

        // Для зоны сброса
        this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
    }

    handleDragStart(e, block) {
        // если это групповое перетаскивание, используем сохранённую группу
        if (this.draggedGroup.length === 0) {
            this.draggedBlock = block;//тащим этот блок
            this.draggedGroup = [block];
        }
        
        e.dataTransfer.setData('text/plain', block.textContent);
        e.dataTransfer.effectAllowed = 'move';
        
        this.draggedGroup.forEach(b => b.classList.add('dragging'));
        
        const rect = block.getBoundingClientRect();//позиция блока
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;
    }

    handleDragEnd() {
        if (this.draggedBlock) {
            this.draggedGroup.forEach(b => {
                b.classList.remove('dragging');
                b.classList.remove('group-dragging'); 
            });
            this.draggedBlock = null;
            this.draggedGroup = []; 
            this.groupPositions = null; 
        }
        this.hideDropIndicator();
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (!this.draggedBlock) return;
        //координаты мыши для зоны сброса
        const dropZoneRect = this.dropZone.getBoundingClientRect();
        const mouseX = e.clientX - dropZoneRect.left;
        const mouseY = e.clientY - dropZoneRect.top;
        //позиция блока+мышь
        const blockX = mouseX - this.offsetX;
        const blockY = mouseY - this.offsetY;
        //прилипание в правой зоне
        if (this.draggedBlock.parentNode === this.dropZone) {
            // если есть группа - перемещаем всю группу
            if (this.draggedGroup.length > 1 && this.groupPositions) {
                this.updateGroupPositions(this.groupPositions, blockX, blockY);
            } else {
                this.draggedBlock.style.left = blockX + 'px';
                this.draggedBlock.style.top = blockY + 'px';
            }
            this.checkSnapping();
        } else {
            //позиция блока слева
            this.draggedBlock.style.left = blockX + 'px';
            this.draggedBlock.style.top = blockY + 'px';
        }
    }
    
    //Проверка: близко ли блок?
    checkSnapping() {
        const dropZoneRect = this.dropZone.getBoundingClientRect();
        const draggedRect = this.draggedBlock.getBoundingClientRect();
        
        const otherBlocks = Array.from(this.dropZone.querySelectorAll('.block-item:not(.dragging)'));
        
        let snapped = false; // было ли прилипание?
        
        otherBlocks.forEach(block => {
            const blockRect = block.getBoundingClientRect();
            //проверка расстояния
            const distanceBottomToTop = Math.abs(draggedRect.bottom - blockRect.top);
            if (distanceBottomToTop < this.snapThreshold && 
                this.isHorizontalOverlap(draggedRect, blockRect)) {
                    //прилипание сверху к низу другого блока
                this.draggedBlock.style.top = (blockRect.top - dropZoneRect.top - this.draggedBlock.offsetHeight) + 'px';
                if (!this.blockManager.areConnected(this.draggedBlock, block)) {
                    this.blockManager.connectBlocks(this.draggedBlock, block);
                    //соединение
                    //обновляем ручки у обоих блоков
                    this.updateGroupHandles(this.draggedBlock);
                    this.updateGroupHandles(block);
                }
                snapped = true; 
            }
            
            const distanceTopToBottom = Math.abs(draggedRect.top - blockRect.bottom);
            if (distanceTopToBottom < this.snapThreshold && 
                this.isHorizontalOverlap(draggedRect, blockRect)) {
                this.draggedBlock.style.top = (blockRect.bottom - dropZoneRect.top) + 'px';
                if (!this.blockManager.areConnected(this.draggedBlock, block)) {
                    this.blockManager.connectBlocks(this.draggedBlock, block);
                    // обновляем ручки у обоих блоков
                    this.updateGroupHandles(this.draggedBlock);
                    this.updateGroupHandles(block);
                }
                snapped = true;
            }
        });
        
        // если не было прилипания, проверяем отлипание
        if (!snapped) {
            this.checkDetach();
        }
    }
    
    //проверка отлипания
    checkDetach() {
        if (!this.draggedBlock) return;
        
        // Проверяем все блоки, с которыми есть соединение
        const connections = this.blockManager.connections.get(this.draggedBlock.id || this.draggedBlock.textContent) || [];
        
        connections.forEach(connId => {
            const connectedBlock = Array.from(this.dropZone.querySelectorAll('.block-item')).find(
                b => (b.id || b.textContent) === connId
            );
            
            if (connectedBlock) {
                const draggedRect = this.draggedBlock.getBoundingClientRect();
                const blockRect = connectedBlock.getBoundingClientRect();
                
                // Вычисляем расстояние между блоками
                const distance = Math.min(
                    Math.abs(draggedRect.bottom - blockRect.top),
                    Math.abs(draggedRect.top - blockRect.bottom)
                );
                
                // разъединяем
                if (distance > this.snapThreshold * 2) {
                    if (this.blockManager.areConnected(this.draggedBlock, connectedBlock)) {
                        this.blockManager.disconnectBlocks(this.draggedBlock, connectedBlock);
                        // Обновляем ручки у обоих блоков
                        this.updateGroupHandles(this.draggedBlock);
                        this.updateGroupHandles(connectedBlock);
                    }
                }
            }
        });
    }

    //для вертикального прилипания
    isHorizontalOverlap(rect1, rect2) {
        return !(rect1.right < rect2.left || rect1.left > rect2.right);
    }

    hideDropIndicator() {
        this.dropIndicator.style.display = 'none';
    }

    handleDrop(e) {
        e.preventDefault();
        
        if (!this.draggedBlock) return;
        
        this.draggedBlock.classList.remove('dragging');
        
        const dropZoneRect = this.dropZone.getBoundingClientRect();
        const mouseX = e.clientX - dropZoneRect.left;
        const mouseY = e.clientY - dropZoneRect.top;
        
        const blockX = mouseX - this.offsetX;
        const blockY = mouseY - this.offsetY;
        
        if (this.draggedBlock.parentNode === this.dropZone) {
            console.log('Block moved within right zone');//блок в правой зоне
        } else {
            //клон блока из левого списка
            const newBlock = this.draggedBlock.cloneNode(true);
            newBlock.setAttribute('draggable', 'true');
            //обработка нового блока
            newBlock.addEventListener('dragstart', (e) => this.handleDragStart(e, newBlock));
            newBlock.addEventListener('dragend', () => this.handleDragEnd());
            
            this.dropZone.appendChild(newBlock); //добавление в правую зону
            newBlock.style.left = blockX + 'px';//позиция
            newBlock.style.top = blockY + 'px';
            newBlock.id = 'block_' + Date.now() + '_' + Math.random();//уникальный id
            
            console.log('Block cloned from sidebar');
        }
        
        this.hideDropIndicator();
        // сбрасываем группу после drop
        this.draggedGroup = [];
        this.groupPositions = null;
    }
    
    //создание кнопки-ручки для группового перетаскивания
    createGroupHandle(block) {
        const handle = document.createElement('div');
        handle.className = 'group-drag-handle';
        
        handle.addEventListener('mousedown', (e) => {
            e.stopPropagation(); // Не даём событию уйти на блок
            
            // Находим все соединённые блоки
            const group = this.findConnectedGroup(block);
            if (group.length > 0) {
                this.draggedGroup = group;
                this.draggedBlock = block;
                
                group.forEach(b => b.classList.add('group-dragging'));
                
                // Запоминаем позиции всех блоков в группе
                this.groupPositions = this.saveGroupPositions(group, block);
                
                // Запоминаем смещение мыши
                const rect = block.getBoundingClientRect();
                this.offsetX = e.clientX - rect.left;
                this.offsetY = e.clientY - rect.top;
                
                // Запускаем drag
                const dragEvent = new DragEvent('dragstart', {
                    dataTransfer: new DataTransfer(),
                    clientX: e.clientX,
                    clientY: e.clientY
                });
                dragEvent.dataTransfer.setData('text/plain', 'group');
                block.dispatchEvent(dragEvent);
            }
        });
        
        return handle;
    }
    
    // рекурсивный поиск всех соединённых блоков
    findConnectedGroup(block, visited = new Set()) {
        if (!block || visited.has(block)) return [];
        
        visited.add(block);
        let group = [block];
        
        const id = block.id || block.textContent;
        if (this.blockManager.connections.has(id)) {
            this.blockManager.connections.get(id).forEach(connId => {
                const connBlock = Array.from(this.dropZone.querySelectorAll('.block-item')).find(
                    b => (b.id || b.textContent) === connId
                );
                if (connBlock && !visited.has(connBlock)) {
                    group = group.concat(this.findConnectedGroup(connBlock, visited));
                }
            });
        }
        
        return group;
    }
    
    //сохранение относительных позиций блоков в группе
    saveGroupPositions(group, mainBlock) {
        const mainRect = mainBlock.getBoundingClientRect();
        return group.map(block => ({
            block: block,
            offsetX: (parseInt(block.style.left) || 0) - (parseInt(mainBlock.style.left) || 0),
            offsetY: (parseInt(block.style.top) || 0) - (parseInt(mainBlock.style.top) || 0)
        }));
    }
    
    // обновление позиций всей группы
    updateGroupPositions(positions, mainX, mainY) {
        positions.forEach(pos => {
            pos.block.style.left = (mainX + pos.offsetX) + 'px';
            pos.block.style.top = (mainY + pos.offsetY) + 'px';
        });
    }
    
    // обновление кнопок-ручек у блока и его соединений
    updateGroupHandles(block) {
        if (!block) return;
        
        const group = this.findConnectedGroup(block);
        group.forEach(b => {
            // Добавляем класс connected, если есть соединения
            if (this.blockManager.hasConnections(b)) {
                b.classList.add('connected');
                // Добавляем ручку, если её нет
                if (!b.querySelector('.group-drag-handle')) {
                    const handle = this.createGroupHandle(b);
                    b.appendChild(handle);
                }
            } else {
                b.classList.remove('connected'); // Убираем оранжевую обводку
                // Удаляем ручку, если она есть
                const handle = b.querySelector('.group-drag-handle');
                if (handle) handle.remove();
            }
        });
    }
}

class RootUI{
    constructor(){
        this.manager = new BlockManager();
        this.dropZone = document.querySelector('.drop-zone');
        this.dragDropManager = new DragDropManager(this.manager, this.dropZone);

        this.init();
    }

    init(){
        document.getElementById('start_button').addEventListener('click', () => {
            this.manager.run_program();
        });
        
        document.getElementById('stop_button').addEventListener('click', () => {
            console.log('Program stopped');
        });
        
        document.getElementById('clear_button').addEventListener('click', () => {
            this.manager.clear();
            this.dropZone.innerHTML = '';
        });
        
        document.getElementById('add_vars').addEventListener('click', () => {
            VariablePopUp();
        });
        
        document.getElementById('add_arr').addEventListener('click', () => {
            ArrayPopUp();
        });
    }

    render_block(block_id){
         // При создании нового блока его надо рендерить.
    }

    
    render_saved_blocks(){
         /*Также юзер будет создавать переменные и массивы, их также надо сохранять и тут
        распаковывать. */
        //TODO: сделать систему сохранений и эту функцию заодно.
    }

    mainloop(){
        const block = this.dropZone.querySelector('.start-block');
        while (block){
            block.execute();
            block = block.next_block;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.app = new RootUI();
    
    //добавляем ручки к уже соединённым блокам
    setTimeout(() => {
        document.querySelectorAll('.drop-zone .block-item').forEach(block => {
            if (window.app.manager.hasConnections(block)) {
                block.classList.add('connected');
                if (!block.querySelector('.group-drag-handle')) {
                    const handle = window.app.dragDropManager.createGroupHandle(block);
                    block.appendChild(handle);
                }
            }
        });
    }, 200);
});