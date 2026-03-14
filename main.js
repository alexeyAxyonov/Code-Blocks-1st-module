function getBlockId(block) {
    if (block.dataset && block.dataset.blockId) return block.dataset.blockId;
    
    if (block.id) return block.id;
    
    return block.textContent;
}

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
    },

    clear_data(){
        data = {};
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
            printError(`Массив ${arr_name} уже существует`);
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
    },
    
    clear_data(){
        data = {};
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
            printError("Количество значений превышает длину массива");
        }
    }
    
    get(index) {
        if (index < 0 || index >= this._length) {
            printError("Индекс вне диапазона");
        }
        return this._data[index];
    }
    
    set(index, value) {
        if (index < 0 || index >= this._length) {
            printError("Индекс вне диапазона");
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


//TODO: переписать функции создания переменных и массива.
function VariablePopUp() {
    const varName = prompt("Введите имя переменной:");
    if (varName && varName.trim()) AddVariables(varName.trim());
}

function ArrayPopUp() {
    const arrName = prompt("Введите имя массива:");
    const length = prompt("Введите размер массива:");
    if (arrName && length) AddArray(arrName.trim(), parseInt(length));
}

function AddVariables(vars){
    //Получает список переменных из variables
    let intermediate_value = vars.split(/\s*,\s*/).filter(item => item !== '');
    for (let i = 0; i < intermediate_value.length; i++){
        if (is_valid_variable_name(intermediate_value[i])){
            variables.set_variable(intermediate_value[i], 0);
            console.log("Создана переменная " + intermediate_value[i]);
            //TODO: добавить объекты VariableBlock.
        }
        else{
            printError(`Невозможно создать переменную с названием ${intermediate_value[i]}`);
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
        printError(`Невозможно создать массив с названием ${arr_name}`)
    }
}

function updateVarsDisplay() {
    const display = document.getElementById("vars-display");
    if (!display) return;
    const keys = Object.keys(variables.data);
    if (keys.length === 0) {
        display.innerHTML = '<p class="empty-text">Переменных нет</p>';
        return;
    }
    display.innerHTML = keys
        .map(
            (k) =>
                `<div class="var-row">
                    <span class="var-name">${k}</span>
                    <span> = </span>
                    <span class="var-value">${variables.data[k]}</span>
                </div>`
        )
        .join("");
}

//Всё что за этим комментом возможно нужно разбросать в отдельный файл

function printError(text) {
    const errDiv = document.getElementById("errors");
    if (!errDiv) return;
    const empty = errDiv.querySelector(".empty-text");
    if (empty) empty.remove();
    const p = document.createElement("p");
    p.className = "error-entry";
    p.textContent = "⚠ " + text;
    errDiv.appendChild(p);
}

// поддержка локальных переменных
function evaluateExpression(expr, localVars = {}) {
    if (expr === null || expr === undefined) return 0;

    expr = String(expr).trim();
    if (expr === "") return 0;

    // сначала локальные переменные, потом глобальные
    const substituted = expr.replace(/[a-zA-Z_$][a-zA-Z0-9_$]*/g, (match) => {
        if (localVars && localVars.hasOwnProperty(match)) {
            return localVars[match];
        }
        if (variables.is_variable_name(match)) {
            return variables.get_variable(match);
        }
        return match;
    });

    try {
        const tokens = tokenize(substituted); //разбиваем выражение на части
        const rpn = toRPN(tokens); //ОПС
        const ast = buildAST(rpn); //строим дерево из наших блоков
        if (ast && typeof ast.execute === 'function') {
            return ast.execute();//выполняем дерево
        }
        return ast || 0;
    } catch (e) {
        console.error("Ошибка в выражении:", expr, e);
        printError(`Ошибка в выражении: "${expr}"`);
        return 0;
    }
}

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
        console.log("executed_block")
    }
}

class StartBlock extends BaseBlock{
    execute(){
        console.log("executed start_block");
    }
}

class EndBlock extends BaseBlock{
    execute(){
        console.log("executed end_block");
    }
}

class RawArithmeticOperationBlock extends BaseBlock{
    constructor(id){
        super(id, "raw-arith");
        this.operation = null;
    }

    set_operation(oper){
        this.operation = oper;
    }

    execute(){
        return evaluateExpression(this.operation);
    }
}

function setupArithmeticBlock(blockElement, blockInstance) {
    blockElement.classList.add('arithmetic-block');
    
    blockElement.innerHTML = '';
    
    const displayDiv = document.createElement('div');
    displayDiv.className = 'expression-display';
    displayDiv.textContent = blockInstance.operation || 'Выражение не задано';
    blockElement.appendChild(displayDiv);
    
    blockElement.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        
        const currentExpr = blockInstance.operation || '';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentExpr;

        const oldDisplay = blockElement.querySelector('.expression-display');
        if (oldDisplay) {
            oldDisplay.style.display = 'none';
        }
        
        blockElement.appendChild(input);
        input.focus();
        
        // Функция сохранения выражения
        const saveExpression = () => {
            if (!input.isConnected) return;

            const expr = input.value.trim();
            blockInstance.set_operation(expr);
            
            // Обновляем отображение
            const display = blockElement.querySelector('.expression-display');
            if (display) {
                display.textContent = expr || 'Выражение не задано';
                display.style.display = 'block';
            }
            
            if (input.parentNode === blockElement){
                input.remove();
            }
        };

        let isSaving = false;
        
        input.addEventListener('blur', () => {
            if (!isSaving){
                isSaving = true;
                saveExpression();
            }
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!isSaving){
                    isSaving = true;
                    saveExpression();
                }
            }
        });
    });
}

class ArithmeticOperationBlock extends BaseBlock {
    constructor(id, type) {
        super(id, type);
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
        
        console.log(`Evaluated: ${leftValue} ${this.type} ${rightValue} = ${result}`);
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
        super(id, "equals-block");
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
            printError("Деление на 0");
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
            printError("Модуль от нуля");
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
    constructor(id, var_name = "", expression = "0") {
        super(id);
        this.type = "assign";
        this.var_name = var_name;
        this.expression = expression;
    }

    setVariableName(name) {
        this.variableName = name;
    }

    setExpression(expr) {
        this.expression = expr;
    }

    execute(args){
        if (!this.variableName || !this.expression) {
            console.log("Assign block: incomplete assignment");
            return;
        }

        // Check if variable exists
        if (!variables.is_variable_name(this.variableName)) {
            printError(`Переменная "${this.variableName}" не существует. Сначала объявите её.`);
            return;
        }

        // Evaluate the expression
        const value = evaluateExpression(this.expression);
        
        // Assign the value
        variables.set_variable(this.variableName, value);
        
        console.log(`Assign: ${this.variableName} = ${value} (from ${this.expression})`);
        updateVarsDisplay();
    }
}

function setupAssignBlock(blockElement, blockInstance) {
    blockElement.classList.add('assign-block');
    
    updateAssignBlockDisplay(blockElement, blockInstance);
    
    blockElement.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        showAssignPrompts(blockElement, blockInstance);
    });
}

function updateAssignBlockDisplay(blockElement, blockInstance) {
    blockElement.innerHTML = '';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'assign-title';
    titleDiv.textContent = 'Присваивание';
    blockElement.appendChild(titleDiv);
    
    const displayDiv = document.createElement('div');
    displayDiv.className = 'assign-display';
    
    if (blockInstance.variableName && blockInstance.expression) {
        displayDiv.innerHTML = `<span class="assign-var">${blockInstance.variableName}</span> <span class="assign-equals">=</span> <span class="assign-expr">${blockInstance.expression}</span>`;
    } else {
        displayDiv.textContent = 'Дважды кликните для настройки';
        displayDiv.style.opacity = '0.7';
    }
    
    blockElement.appendChild(displayDiv);
}

function showAssignPrompts(blockElement, blockInstance) {
    const varName = prompt("Введите имя переменной:", blockInstance.variableName || "");
    
    if (varName === null) return;
    
    if (!varName.trim()) {
        alert("Имя переменной не может быть пустым");
        return;
    }
    
    if (!variables.is_variable_name(varName.trim())) {
        const createVar = confirm(`Переменная "${varName}" не существует. Создать её?`);
        if (createVar) {
            variables.set_variable(varName.trim(), 0);
            updateVarsDisplay();
        } else {
            return;
        }
    }
    
    const expr = prompt("Введите выражение :", blockInstance.expression || "");
    
    if (expr === null) return;
    
    if (!expr.trim()) {
        alert("Выражение не может быть пустым");
        return;
    }
    
    blockInstance.setVariableName(varName.trim());
    blockInstance.setExpression(expr.trim());
    
    updateAssignBlockDisplay(blockElement, blockInstance);
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
        //TODO: проверить поведение
        const v = this.get_var_value();
        console.log(`${this.name} = ${v}`);
        return v;
    }
}

class ArrayBlock extends BaseBlock{
    constructor(id, name){
        super(id, 'array');
        this.name = name;
    }
}

class IfBlock extends BaseBlock{
    constructor(id, name){
        super(id, 'if');
        this.name = name;
        this.then_branch = null;
        this.else_branch = null;
    }

    getConditionBlock(){
        console.log("getConditionBlock called for if block:", this.id);
        console.log("this.next_block:", this.next_block);
        if (this.next_block && this.next_block instanceof RawArithmeticOperationBlock) {
            console.log("Found RawArithmeticOperationBlock as next_block");
            return this.next_block;
        }
        console.log("No RawArithmeticOperationBlock found as next_block");
        return null;
    }

    set_then_branch(block){
        this.then_branch = block;
        if(block){
            block.past_block = this;
        }
    }

    set_else_branch(block) {
        this.else_branch = block;
        if (block) {
            block.past_block = this;
        }
    }

    execute(args){
        const condition_block = this.getConditionBlock();
        if (!condition_block){
            printError("Блок If не имеет условия (присоедините арифметический блок сверху)");
            return;
        }
        const condition_value = Boolean(condition_block.execute());
        console.log(`If condition evaluated to: ${condition_value}`);
        
        if (condition_value) {
            this.executeBranch(this.then_branch);
        } else if (this.else_branch) {
            this.executeBranch(this.else_branch);
        } else {
            console.log("No else branch, continuing");
        }
    }

    evaluate_condition() {
        if (this.condition instanceof RawArithmeticOperationBlock) {
            return this.condition.execute();
        }
        
        else if (this.condition instanceof VariableBlock) {
            return this.condition.get_var_value();
        }
        
        else {
            return Boolean(this.condition);
        }
    }

    executeBranch(start_block, args) {
        if (!start_block) return;
        
        let current = start_block;
        let iterations = 0;
        const max_iterations = 1000;
        
        while (current && iterations < max_iterations) {
            const next_in_branch = current.next_block;
            
            current.execute(args);
            
            if (current instanceof ReturnBlock) {
                break;
            }
            
            current = next_in_branch;
            iterations++;
        }
        
        if (iterations >= max_iterations) {
            printError('Количество вызовов превысило допустимое значение');
        }
    }
    isInThenBranch(block) {
        if (!this.then_branch) return false;
        
        let current = this.then_branch;
        while (current) {
            if (current === block) return true;
            current = current.next_block;
        }
        return false;
    }

    isInElseBranch(block) {
        if (!this.else_branch) return false;
        
        let current = this.else_branch;
        while (current) {
            if (current === block) return true;
            current = current.next_block;
        }
        return false;
    }
}

function setupIfBlock(blockElement, blockInstance) {
    blockElement.classList.add('if-block');
    
    updateIfBlockDisplay(blockElement, blockInstance);
    
    blockElement.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        showIfBranchConfiguration(blockElement, blockInstance);
    });
}

function updateIfBlockDisplay(blockElement, blockInstance) {
    blockElement.innerHTML = '';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'if-title';
    titleDiv.textContent = 'Если';
    blockElement.appendChild(titleDiv);
    
    const conditionDiv = document.createElement('div');
    conditionDiv.className = 'if-condition';
    
    const conditionBlock = blockInstance.getConditionBlock();
    if (conditionBlock && conditionBlock.element) {
        const exprDisplay = conditionBlock.element.querySelector('.expression-display');
        conditionDiv.innerHTML = `<span class="if-label">условие:</span> <span class="if-expr">${exprDisplay ? exprDisplay.textContent : 'выражение'}</span>`;
    } else {
        conditionDiv.innerHTML = '<span class="if-label">условие:</span> <span class="if-unset">не задано</span>';
    }
    
    blockElement.appendChild(conditionDiv);
    
    const branchesDiv = document.createElement('div');
    branchesDiv.className = 'if-branches';
    
    if (blockInstance.then_branch) {
        branchesDiv.innerHTML += '<span class="if-then">✓ then</span>';
    } else {
        branchesDiv.innerHTML += '<span class="if-then">✗ then</span>';
    }
    
    if (blockInstance.else_branch) {
        branchesDiv.innerHTML += '<span class="if-else">✓ else</span>';
    } else {
        branchesDiv.innerHTML += '<span class="if-else">✗ else</span>';
    }
    
    blockElement.appendChild(branchesDiv);
}

function showIfBranchConfiguration(blockElement, blockInstance) {
    const dropZone = document.querySelector('.drop-zone');
    const allBlocks = Array.from(dropZone.querySelectorAll('.block-item'));
    
    let message = "Настройка веток IF\n\n";
    message += "Текущее условие: ";
    
    const conditionBlock = blockInstance.getConditionBlock();
    if (conditionBlock && conditionBlock.element) {
        const exprDisplay = conditionBlock.element.querySelector('.expression-display');
        message += exprDisplay ? exprDisplay.textContent : 'задано';
    } else {
        message += "не задано (присоедините арифметический блок сверху)";
    }
    
    message += "\n\nВетка THEN: " + (blockInstance.then_branch ? "задана" : "не задана");
    message += "\nВетка ELSE: " + (blockInstance.else_branch ? "задана" : "не задана");
    
    message += "\n\nВыберите действие:\n";
    message += "1. Указать начало ветки THEN\n";
    message += "2. Указать начало ветки ELSE\n";
    message += "3. Очистить ветку THEN\n";
    message += "4. Очистить ветку ELSE\n";
    message += "5. Отмена";
    
    const choice = prompt(message, "1");
    
    if (choice === "1") {
        // Set THEN branch
        const blockId = prompt("Введите ID блока начала ветки THEN (или перетащите блок и введите его ID):", 
                                blockInstance.then_branch?.id || "");
        if (blockId) {
            const targetBlock = allBlocks.find(b => b.id === blockId || b.dataset.blockId === blockId);
            if (targetBlock && targetBlock.blockInstance) {
                blockInstance.set_then_branch(targetBlock.blockInstance);
                updateIfBlockDisplay(blockElement, blockInstance);
            } else {
                alert("Блок не найден");
            }
        }
    } else if (choice === "2") {
        // Set ELSE branch
        const blockId = prompt("Введите ID блока начала ветки ELSE:", 
                                blockInstance.else_branch?.id || "");
        if (blockId) {
            const targetBlock = allBlocks.find(b => b.id === blockId || b.dataset.blockId === blockId);
            if (targetBlock && targetBlock.blockInstance) {
                blockInstance.set_else_branch(targetBlock.blockInstance);
                updateIfBlockDisplay(blockElement, blockInstance);
            } else {
                alert("Блок не найден");
            }
        }
    } else if (choice === "3") {
        // Clear THEN branch
        blockInstance.set_then_branch(null);
        updateIfBlockDisplay(blockElement, blockInstance);
    } else if (choice === "4") {
        // Clear ELSE branch
        blockInstance.set_else_branch(null);
        updateIfBlockDisplay(blockElement, blockInstance);
    }
}

class ForBlock extends BaseBlock {
    constructor(id) {
        super(id, 'for');
        this.init = null;
        this.condition = null; 
        this.step = null;      
        this.body_start = null;
        this.max_iterations = 1000;
        
        // поля для хранения текстовых выражений
        this.init_text = "";
        this.condition_text = "";
        this.step_text = "";
    }

    set_init(value) {
        if (value instanceof ArithmeticOperationBlock || 
            value instanceof VariableBlock) {
            this.init = value;
            this.init_text = ""; // очищаем текст, если это блок
        } else if (typeof value === 'string') {
            this.init_text = value;
            this.init = null;
        }
    }

    set_condition(value) {
        if (value instanceof ArithmeticOperationBlock || 
            value instanceof VariableBlock) {
            this.condition = value;
            this.condition_text = "";
        } else if (typeof value === 'string') {
            this.condition_text = value;
            this.condition = null;
        }
    }

    set_step(value) {
        if (value instanceof ArithmeticOperationBlock || 
            value instanceof VariableBlock) {
            this.step = value;
            this.step_text = "";
        } else if (typeof value === 'string') {
            this.step_text = value;
            this.step = null;
        }
    }

    set_body(block) {
        this.body_start = block;
        if (block) {
            block.past_block = this;
        }
    }

    // вычисление значения из блока или текста
    evaluateValue(item, localVars = {}) {
        if (item instanceof ArithmeticOperationBlock) {
            return item.execute();
        } else if (item instanceof VariableBlock) {
            return item.get_var_value();
        } else if (typeof item === 'string') {
            // Если это текст - вычисляем выражение
            return evaluateExpression(item, localVars);
        }
        return item;
    }

    execute(args) {
        let iterations = 0;
        
        console.log('Начало цикла for');
        
        // создаем локальные переменные для цикла
        const localVars = {};
        
        // инициализация
        if (this.init) {
            this.evaluateValue(this.init, localVars);
        } else if (this.init_text) {
            evaluateExpression(this.init_text, localVars);
        }
        
        while (iterations < this.max_iterations) {
            // проверяем условие
            let condition_value = true;
            if (this.condition) {
                condition_value = Boolean(this.evaluateValue(this.condition, localVars));
            } else if (this.condition_text) {
                condition_value = Boolean(evaluateExpression(this.condition_text, localVars));
            }
            
            if (!condition_value) {
                console.log(`Цикл for закончился после ${iterations} повторений`);
                break;
            }
            
            // Выполняем тело цикла
            this.execute_body(args, localVars);
            
            // выполняем шаг
            if (this.step) {
                this.evaluateValue(this.step, localVars);
            } else if (this.step_text) {
                evaluateExpression(this.step_text, localVars);
            }
            
            iterations++;
        }
        
        if (iterations >= this.max_iterations) {
            printError(`Цикл for превысил максимальное количество повторений: ${this.max_iterations}`);
        }
    }

    // передаем локальные переменные в тело цикла
    execute_body(args, localVars) {
        if (!this.body_start) return;
        
        let current = this.body_start;
        
        while (current) {
            const next_in_body = current.next_block;
            
            // Здесь можно передать локальные переменные, если нужно
            if (typeof current.execute === 'function') {
                current.execute(args);
            }
            
            current = next_in_body;
        }
    }
}

class WhileBlock extends BaseBlock {
    constructor(id) {
        super(id, 'while');
        this.condition = null;
        this.body_start = null;
        this.max_iterations = 1000;
        // поле для текстового условия
        this.condition_text = "";
    }

    // установка условия с поддержкой блоков и текста
    set_condition(value) {
        if (value instanceof ArithmeticOperationBlock || 
            value instanceof VariableBlock) {
            this.condition = value;
            this.condition_text = "";
        } else if (typeof value === 'string') {
            this.condition_text = value;
            this.condition = null;
        }
    }

    set_body(block) {
        this.body_start = block;
        if (block) {
            block.past_block = this;
        }
    }

    // вычисление условия
    evaluateCondition(localVars = {}) {
        if (this.condition instanceof ArithmeticOperationBlock) {
            return Boolean(this.condition.execute());
        } else if (this.condition instanceof VariableBlock) {
            return Boolean(this.condition.get_var_value());
        } else if (this.condition_text) {
            return Boolean(evaluateExpression(this.condition_text, localVars));
        }
        return false;
    }

    execute(args) {
        let iterations = 0;
        
        console.log('Начало цикла while');
        
        while (iterations < this.max_iterations) {
            const condition_value = this.evaluateCondition();
            
            if (!condition_value) {
                console.log(`Цикл while закончился после ${iterations} повторений`);
                break;
            }
            
            this.execute_body(args);
            
            iterations++;
        }
        
        if (iterations >= this.max_iterations) {
            printError(`Цикл while превысил максимальное количество повторений: ${this.max_iterations}`);
        }
    }

    execute_body(args) {
        if (!this.body_start) return;
        
        let current = this.body_start;
        
        while (current) {
            const next_in_body = current.next_block;
            
            if (typeof current.execute === 'function') {
                current.execute(args);
            }
            
            current = next_in_body;
        }
    }
}

class DeclareBlock extends BaseBlock {
    constructor(id, var_name = "x", initial_value = 0) {
        super(id, "declare");
        this.var_name = var_name;
        this.initial_value = initial_value;
    }
    execute() {
        variables.set_variable(this.var_name, this.initial_value);
        console.log(`Объявлена: ${this.var_name} = ${this.initial_value}`);
        updateVarsDisplay();
    }
}

class PrintBlock extends BaseBlock {
    constructor(id, expression = "") {
        super(id, "print");
        this.expression = expression;
    }

    setContent(content){
        this.expression = content;
    }

    execute() {
        const expr = this.expression.trim();
        //если является вводные данные строкой то просто выводим
        if (expr.startsWith('"') && expr.endsWith('"')){
            const w = expr.slice(1, -1); // убираем кавычки
            printOutput(w);
            console.log("Вывод:", w);
        }
        //если являются арифметическим выражением или переменной => решаем и выводим
        else {
            const v = evaluateExpression(expr);
            printOutput(String(v));
            console.log("Вывод:", v);
        }
    }
}

function setupPrintBlock(blockElement, blockInstance) {
    blockElement.classList.add('print-block');
    
    updatePrintBlockDisplay(blockElement, blockInstance);
    
    blockElement.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        showPrintPrompt(blockElement, blockInstance);
    });
}

function updatePrintBlockDisplay(blockElement, blockInstance) {
    blockElement.innerHTML = '';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'print-title';
    titleDiv.textContent = 'Вывод';
    blockElement.appendChild(titleDiv);
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'print-content';
    
    if (blockInstance.content) {
        if (blockInstance.isString) {
            contentDiv.innerHTML = `<span class="print-string">${blockInstance.content}</span>`;
        } else {
            contentDiv.innerHTML = `<span class="print-expression">${blockInstance.content}</span>`;
        }
    } else {
        contentDiv.textContent = 'Дважды кликните для ввода';
        contentDiv.style.opacity = '0.7';
    }
    
    blockElement.appendChild(contentDiv);
}

function showPrintPrompt(blockElement, blockInstance) {
    const message = "Введите текст или выражение для вывода:\n" +
                    "• Текст в кавычках: \"Привет мир\"\n" +
                    "• Выражение: 5 + 3 * 2\n" +
                    "• Переменная: x";
    
    const content = prompt(message, blockInstance.content || "");
    
    if (content === null) return; // User cancelled
    
    blockInstance.setContent(content);
    updatePrintBlockDisplay(blockElement, blockInstance);
}

function printOutput(text) {
    const output = document.getElementById("output");
    if (!output) return;
    const empty = output.querySelector(".empty-text");
    if (empty) empty.remove();
    const p = document.createElement("p");
    p.className = "output-entry output";
    p.textContent = text;
    output.appendChild(p);
}

//Перевод выражения в массив элементов 
function tokenize(expr)
{
    const regex = /\d+\.?\d*|[+\-*/^%()]|[a-zA-Z_$][\w$]*|>|<|>=|<=|==|!=|!|&&|\|\|/g;
    return expr.match(regex) || [];
}
//Пееревод в Общую Польскую Строку
function toRPN(tokens) {
    const rpn = []; //ОПС
    const stack = [];//Временный стэк для операций
    const precedence = { "+" : 1, "-" : 1, "*" : 2 , "/" : 2, "^" : 3,
            ">" : 0, "<" : 0, ">=" : 0, "<=" : 0, "==" : 0, "!=" : 0, "&&":0,"||":0,"!":3};      
    
    //проход по элементам выражения
    for (const token of tokens)
    {
        if (!isNaN(token)) {
            rpn.push(token);
        }
        else if (token in precedence) {
            while (stack.length && stack[stack.length-1] != "(" &&
            precedence[stack[stack.length-1]]>=precedence[token])
            {
                rpn.push(stack.pop());
            }
            stack.push(token);
        }
        else if (token == "(")
            stack.push(token);

        else if (token == ")") {
            while (stack[stack.length-1] !== "(") {
                rpn.push(stack.pop());
            }
            stack.pop();
        }
    }
    while (stack.length) {
            rpn.push(stack.pop());
    }
    return rpn;
}
//Создание синтаксического дерева - перевод из ОПС в конечное выражение вида пример Multiply(2,Plus(3,1)) => 2*(3+1)
function buildAST(rpn) {
    const stack = []; //для выражений

    for (const token of rpn) {
        if (!isNaN(token)) {
            stack.push(Number(token));
        } else if ("+-*/^".includes(token)) {
            const right = stack.pop();
            const left = stack.pop();
            let block; //создаём пустой блок
            switch(token) {
                case "+": block = new Plus(); break;
                case "-": block = new Minus(); break;
                case "*": block = new Multiply(); break;
                case "/": block = new Divide(); break;
                case "^": block = new Power(); break;
                case "==": block = new EqualsBlock(); break;
            }
            if (block) { //проверка для защиты от ошибок
                block.add_left(left);
                block.add_right(right);
                stack.push(block);
            }
        }
        else if (["==","!=","<",">","<=",">=","&&","||","!"].includes(token)) {
            const right = stack.pop();
            const left = token !== "!" ? stack.pop() : null; //если унарный "!" то только 1 операнд
            let block;

            switch(token) {
                case "==": block = new EqualsBlock(); break;
                case "!=": block = new NotEqualsBlock(); break;
                case "<": block = new LessThanBlock(); break;
                case "<=": block = new LessThanOrEqualBlock(); break;
                case ">": block = new GreaterThanBlock(); break;
                case ">=": block = new GreaterThanOrEqualBlock(); break;

                case "&&": block = new AndBlock(); break;
                case "||": block = new OrBlock(); break;
            }

            block.add_left(left);
            block.add_right(right);
            stack.push(block);
        }

        else if (token === "!") { // унарный NOT имеет один операнд
            const operand = stack.pop();
            const block = new NotBlock();
            block.add_left(operand);
            stack.push(block);
        }
    }    
    
    return stack[0]; //корень дерева - конечное выражение
}


class BlockManager {
    constructor() {
        this.blocks = new Map();
        this.connections = new Map(); //Место для соединения блоков
    }
    
    add_block(block) {
        console.log("Добавил блок: " + (block.name || block.id));
        this.blocks.set(block.id, block);
    }
    
    remove_block(id) {
        const block = this.blocks.get(id);
        if (block) {
            if (block.past_block) 
            {
                block.past_block.next_block = null;
            }
            if (block.next_block)
            {
                block.next_block.past_block = null;
            }
            this.blocks.delete(id);
            this.connections.delete(id);
        }
    }
    
    clear() {
        this.blocks.clear();
        this.connections.clear();

        variables.clear_data();
        arrays.clear_data();

        document.getElementById("output").innerHTML = 
        '<p class="empty-text">Нажмите "Начать" для запуска</p>';
        document.getElementById("errors").innerHTML =
        '<p class="empty-text">Ошибок нет</p>';
    }

    run_program(start_block_id){
        let block = this.blocks.get(start_block_id);
        while (block){
            block.execute();
            block = block.next_block;
        }
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
        
        const id1 = getBlockId(block1);
        const id2 = getBlockId(block2);

        console.log("Соединяем блоки: " + block1.blockInstance.type + " id: " + id1 + " | " + block2.type + " id: " + id2);
        
        // Получаем экземпляры блоков
        const block1Instance = block1.blockInstance;
        const block2Instance = block2.blockInstance;
        
        if (!block1Instance || !block2Instance) return;
        
        // Запрещаем соединение двух StartBlock
        if (block1Instance instanceof StartBlock && block2Instance instanceof StartBlock) {
            return;
        }
        
        // Запрещаем соединение двух EndBlock
        if (block1Instance instanceof EndBlock && block2Instance instanceof EndBlock) {
            return;
        }
        
        // Запрещаем присоединение второго блока к StartBlock
        if (block1Instance instanceof StartBlock && block1Instance.next_block) {
            console.log("К блоку Start уже присоединён блок");
            printError("К блоку 'Начало' можно присоединить только один блок");
            return;
        }
        
        // Запрещаем присоединение второго блока к EndBlock сверху
        if (block2Instance instanceof EndBlock && block2Instance.past_block) {
            console.log("К блоку End уже присоединён блок сверху");
            printError("К блоку 'Конец' можно присоединить только один блок сверху");
            return;
        }
        
        // Также проверяем обратную ситуацию (когда EndBlock может быть block1)
        if (block1Instance instanceof EndBlock && block1Instance.past_block) {
            console.log("К блоку End уже присоединён блок сверху");
            printError("К блоку 'Конец' можно присоединить только один блок сверху");
            return;
        }

        // определяем, какой блок сверху, а какой снизу
        const rect1 = block1.getBoundingClientRect();
        const rect2 = block2.getBoundingClientRect();
        
        const block1Bottom = rect1.bottom;
        const block1Top = rect1.top;
        const block2Bottom = rect2.bottom;
        const block2Top = rect2.top;
        
        // Проверяем вертикальное расположение
        const isBlock1Above = block1Bottom <= block2Top + 5;
        const isBlock2Above = block2Bottom <= block1Top + 5;
        
        if (!isBlock1Above && !isBlock2Above) return;
        
        // Определяем верхний и нижний блок
        let topBlock, bottomBlock, topInstance, bottomInstance;
        
        if (isBlock1Above) {
            topBlock = block1;
            bottomBlock = block2;
            topInstance = block1Instance;
            bottomInstance = block2Instance;
        } else {
            topBlock = block2;
            bottomBlock = block1;
            topInstance = block2Instance;
            bottomInstance = block1Instance;
        }
        
        // Дополнительная проверка для StartBlock как верхнего блока
        if (topInstance instanceof StartBlock && topInstance.next_block) {
            console.log("К блоку Start уже присоединён блок");
            printError("К блоку 'Начало' можно присоединить только один блок");
            return;
        }
        
        // Дополнительная проверка для EndBlock как нижнего блока
        if (bottomInstance instanceof EndBlock && bottomInstance.past_block) {
            console.log("К блоку End уже присоединён блок сверху");
            printError("К блоку 'Конец' можно присоединить только один блок сверху");
            return;
        }
        
        // У любого блока может быть ТОЛЬКО ОДИН блок сверху
        if (topInstance.past_block) return;
        
        // У любого блока может быть ТОЛЬКО ОДИН блок снизу
        if (bottomInstance.next_block) return;
        
        // Создаём соединение
        topInstance.add_next_block(bottomInstance);
        if (topInstance instanceof IfBlock && bottomInstance instanceof RawArithmeticOperationBlock) {
            if (bottomInstance.next_block) {
                topInstance.set_then_branch(bottomInstance.next_block);
                updateIfBlockDisplay(topBlock, topInstance);
            }
        }
        console.log("After add_next_block - topInstance.next_block:", topInstance.next_block ? "set to " + topInstance.next_block.constructor.name : "null");

        console.log("=== CONNECTION DEBUG ===");
        console.log("topInstance type:", topInstance.constructor.name);
        console.log("bottomInstance type:", bottomInstance.constructor.name);
        console.log("topInstance.next_block:", topInstance.next_block ? topInstance.next_block.constructor.name : "null");
        console.log("bottomInstance.past_block:", bottomInstance.past_block ? bottomInstance.past_block.constructor.name : "null");

        if (topInstance instanceof IfBlock) {
            console.log("TOP is IfBlock");
            console.log("topInstance.getConditionBlock():", topInstance.getConditionBlock() ? "FOUND" : "NOT FOUND");
            if (topInstance.getConditionBlock()) {
                console.log("Condition block type:", topInstance.getConditionBlock().constructor.name);
            }
        }

        if (bottomInstance instanceof IfBlock) {
            console.log("BOTTOM is IfBlock");
            console.log("bottomInstance.getConditionBlock():", bottomInstance.getConditionBlock() ? "FOUND" : "NOT FOUND");
            if (bottomInstance.getConditionBlock()) {
                console.log("Condition block type:", bottomInstance.getConditionBlock().constructor.name);
            }
        }
        console.log("========================");

        if (topInstance instanceof IfBlock) {
            const topElement = topBlock;
            updateIfBlockDisplay(topElement, topInstance);
        }

        if (bottomInstance instanceof IfBlock) {
            const bottomElement = bottomBlock;
            updateIfBlockDisplay(bottomElement, bottomInstance);
        }
        
        // Сохраняем связь в connections
        if (!this.connections.has(id1)) this.connections.set(id1, []);
        if (!this.connections.has(id2)) this.connections.set(id2, []);
        
        if (!this.connections.get(id1).includes(id2)) {
            this.connections.get(id1).push(id2);
        }
        if (!this.connections.get(id2).includes(id1)) {
            this.connections.get(id2).push(id1);
        }
        
        // Обновляем ручки
        if (window.app && window.app.dragDropManager) {
            window.app.dragDropManager.updateGroupHandles(block1);
            window.app.dragDropManager.updateGroupHandles(block2);
        }
    }
    //Разъединение блоков
    disconnectBlocks(block1, block2) {
        if (!block1 || !block2) return;
        
        const id1 = getBlockId(block1);
        const id2 = getBlockId(block2);
        //удаление связи 
        if (this.connections.has(id1)) {
            this.connections.set(id1, this.connections.get(id1).filter(id => id !== id2));
        }
        if (this.connections.has(id2)) {
            this.connections.set(id2, this.connections.get(id2).filter(id => id !== id1));
        }

        const block1Instance = block1.blockInstance;
        const block2Instance = block2.blockInstance;
        
        if (block1Instance && block2Instance) {
            if (block1Instance.next_block === block2Instance) {
                block1Instance.remove_next_block();
            }
            if (block2Instance.next_block === block1Instance) {
                block2Instance.remove_next_block();
            }
        }

        // обновляем ручки после разъединения
        if (window.app && window.app.dragDropManager) {
            window.app.dragDropManager.updateGroupHandles(block1);
            window.app.dragDropManager.updateGroupHandles(block2);
        }
    }
    //Проверка соединения
    areConnected(block1, block2) {
        const id1 = getBlockId(block1);
        const id2 = getBlockId(block2);
        
        return this.connections.has(id1) && this.connections.get(id1).includes(id2);
    }
    
    //проверка, есть ли у блока соединения
    hasConnections(block) {
        const id = getBlockId(block);
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

        // принудительное обновление ручек при загрузке
        setTimeout(() => {
            document.querySelectorAll('.drop-zone .block-item').forEach(block => {
                this.updateGroupHandles(block);
            });
        }, 1000);
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
        if (!this.draggedBlock) return;
        
        // проверка для StartBlock и EndBlock
        const isDraggedStart = this.draggedBlock.blockInstance instanceof StartBlock;
        const isDraggedEnd = this.draggedBlock.blockInstance instanceof EndBlock;
        
        const dropZoneRect = this.dropZone.getBoundingClientRect();
        const draggedRect = this.draggedBlock.getBoundingClientRect();
        
        const otherBlocks = Array.from(this.dropZone.querySelectorAll('.block-item:not(.dragging)'));
        
        let snapped = false; // было ли прилипание?
        
        otherBlocks.forEach(block => {
            const blockInstance = block.blockInstance;
            
            // если оба блока StartBlock - пропускаем
            if (isDraggedStart && blockInstance instanceof StartBlock) {
                return; // пропускаем этот блок, не проверяем прилипание
            }
            
            // если оба блока EndBlock - пропускаем
            if (isDraggedEnd && blockInstance instanceof EndBlock) {
                return; // пропускаем этот блок, не проверяем прилипание
            }
            
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

                    if (block.blockInstance instanceof IfBlock) {
                        updateIfBlockDisplay(block, block.blockInstance);
                    }
                    if (this.draggedBlock.blockInstance instanceof IfBlock) {
                        updateIfBlockDisplay(this.draggedBlock, this.draggedBlock.blockInstance);
                    }
                }
                snapped = true; 
            }
            
            const distanceTopToBottom = Math.abs(draggedRect.top - blockRect.bottom);
            if (distanceTopToBottom < this.snapThreshold && 
                this.isHorizontalOverlap(draggedRect, blockRect)) {
                this.draggedBlock.style.top = (blockRect.bottom - dropZoneRect.top) + 'px';
                if (!this.blockManager.areConnected(this.draggedBlock, block)) {
                    this.blockManager.connectBlocks(this.draggedBlock, block);
                    if (block.blockInstance instanceof IfBlock) {
                        updateIfBlockDisplay(block, block.blockInstance);
                    }
                    if (this.draggedBlock.blockInstance instanceof IfBlock) {
                        updateIfBlockDisplay(this.draggedBlock, this.draggedBlock.blockInstance);
                    }
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
        const connections = this.blockManager.connections.get(getBlockId(this.draggedBlock.id)) || [];
        
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

        const blockId = 'block_' + Date.now() + '_' + Math.random();
    
        // Определить тип блока
        let baseBlock;
        if (this.draggedBlock.classList.contains('start-block')) {
            baseBlock = new StartBlock(blockId, 'start');
        } else if (this.draggedBlock.classList.contains('end-block')) {
            baseBlock = new EndBlock(blockId, 'end');
        } else if (this.draggedBlock.classList.contains('arithmetic-block')){
            baseBlock = new RawArithmeticOperationBlock(blockId);
        } else if (this.draggedBlock.classList.contains('assign-block')){
            baseBlock = new AssignmentOperator(blockId);
            setTimeout(() => {
                const newBlockElement = this.dropZone.querySelector(`[data-block-id="${blockId}"]`);
                if (newBlockElement) {
                    newBlockElement.blockInstance = baseBlock;
                    baseBlock.element = newBlockElement;
                    setupAssignBlock(newBlockElement, baseBlock);
                    showAssignPrompts(newBlockElement, baseBlock);
                }
            }, 100);
        } else if (this.draggedBlock.classList.contains('if-block')){
            baseBlock = new IfBlock(blockId);
            setTimeout(() => {
                const newBlockElement = this.dropZone.querySelector(`[data-block-id="${blockId}"]`);
                if (newBlockElement) {
                    newBlockElement.blockInstance = baseBlock;
                    baseBlock.element = newBlockElement;
                    setupIfBlock(newBlockElement, baseBlock); 
                }
            }, 100);
        } else if (this.draggedBlock.classList.contains('for-block')){
            baseBlock = new ForBlock(blockId);
        } else if (this.draggedBlock.classList.contains('while-block')){
            baseBlock = new WhileBlock(blockId);
        } else if (this.draggedBlock.classList.contains('declare-block')){
            baseBlock = new DeclareBlock(blockId);
        } else if (this.draggedBlock.classList.contains('print-block')){
            baseBlock = new PrintBlock(blockId);
            setTimeout(() => {
            const newBlockElement = this.dropZone.querySelector(`[data-block-id="${blockId}"]`);
            if (newBlockElement) {
                newBlockElement.blockInstance = baseBlock;
                baseBlock.element = newBlockElement;
                setupPrintBlock(newBlockElement, baseBlock);
                showPrintPrompt(newBlockElement, baseBlock);
            }
        }, 100);
        } else{
            throw new Error("Неизвестный блок!");
        }
        if (this.draggedBlock.parentNode === this.dropZone) {
            console.log('Block moved within right zone'); //блок в правой зоне
        } else {
            //клон блока из левого списка
            const newBlock = this.draggedBlock.cloneNode(true);
            //Добавление ID. Возможно неправильно, что я делаю blockId у логической и визуальной части одинаковым
            newBlock.dataset.blockId = blockId;
            // На случай если отсутствие этого ломает что-то в чужом коде.
            newBlock.dataset.id = blockId;
            //Связь логической части блока и визуальной
            newBlock.blockInstance = baseBlock;
            baseBlock.element = newBlock;

            newBlock.setAttribute('draggable', 'true');
            //обработка нового блока
            newBlock.addEventListener('dragstart', (e) => this.handleDragStart(e, newBlock));
            newBlock.addEventListener('dragend', () => this.handleDragEnd());

            if (baseBlock instanceof RawArithmeticOperationBlock) {
                setupArithmeticBlock(newBlock, baseBlock);
            }
            
            this.dropZone.appendChild(newBlock); //добавление в правую зону
            newBlock.style.left = blockX + 'px';//позиция
            newBlock.style.top = blockY + 'px';

            console.log('Block cloned from sidebar');
            
            // обновляем ручки для нового блока
            setTimeout(() => {
                this.updateGroupHandles(newBlock);
            }, 50);
            
            console.log("Создан блок:", {
            visualId: newBlock.dataset.blockId,
            logicalId: baseBlock.id,
            type: baseBlock.type || baseBlock.constructor.name
                });
        }
        this.blockManager.add_block(baseBlock);
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
        
        const id = getBlockId(block);
        if (this.blockManager.connections.has(id)) {
            this.blockManager.connections.get(id).forEach(connId => {
                const connBlock = Array.from(this.dropZone.querySelectorAll('.block-item')).find(
                    b => getBlockId(b) === connId
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
    
    // обновление кнопок-ручек у блока
    updateGroupHandles(block) {
        if (!block) return;
        
        // Добавляем класс connected, если есть соединения
        if (this.blockManager.hasConnections(block)) {
            block.classList.add('connected');
            // Добавляем ручку, если её нет
            if (!block.querySelector('.group-drag-handle')) {
                const handle = this.createGroupHandle(block);
                block.appendChild(handle);
            }
        } else {
            block.classList.remove('connected'); // Убираем оранжевую обводку
            // Удаляем ручку, если она есть
            const handle = block.querySelector('.group-drag-handle');
            if (handle) handle.remove();
        }
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
            this.mainloop();
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
        //При создании нового блока его надо рендерить.
    }

    
    render_saved_blocks(){
        /*Также юзер будет создавать переменные и массивы, их также надо сохранять и тут
        распаковывать. */
        //TODO: сделать систему сохранений и эту функцию заодно.
    }

    mainloop(){
        const startBlock = this.dropZone.querySelector('.start-block');
        if (!startBlock) {
            console.error("Нет начального блока");
            printError("Добавьте блок 'Начало программы'");
            return;
        }
        
        const blockId = startBlock.dataset.blockId || startBlock.id;
        if (!blockId) {
            console.error("Начальный блок не имеет ID");
            printError("Ошибка: начальный блок не идентифицирован");
            return;
        }
        
        this.manager.run_program(blockId);
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