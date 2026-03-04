
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
    constructor(id, name){
        super(id, 'array');
        this.name = name;
    }
}

class IfBlock extends BaseBlock{
    constructor(id, name){
        super(id, 'if');
        this.name = name;
        this.condition = null;
        this.then_branch = null;
        this.else_branch = null;
    }

    set_condition(condition){
        this.condition = condition;
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
        const condition_value = this.evaluate_condition();
        
        console.log(`If condition evaluated to: ${condition_value}`);
        
        if (condition_value) {
            this.execute_branch(this.then_branch, args);
        } else if (this.else_branch) {
            this.execute_branch(this.else_branch, args);
        }
    }

    evaluate_condition() {
        if (this.condition instanceof ArithmeticOperationBlock) {
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
            this.raise_error('Количество вызовов превысило допустимое значение', 'soft');
        }
    }
}

class ForBlock extends BaseBlock{

}

class WhileBlock extends BaseBlock{
    constructor(id){
        super(id, 'while');
        this.condition = null;
        this.body_start = null;
        this.max_iterations = 1000;
    }
    set_condition(condition) {
        this.condition = condition;
    }

    set_body(block) {
        this.body_start = block;
        if (block) {
            block.past_block = this;
        }
    }

    execute(args) {
        let iterations = 0;
        
        console.log('Начало цикла while');
        
        while (iterations < this.max_iterations) {
            const condition_value = this.evaluate_condition();
            
            if (!condition_value) {
                console.log(`Цикл while закончился после ${iterations} повторений`);
                break;
            }
            
            this.execute_body(args);
            
            iterations++;
        }
        
        if (iterations >= this.max_iterations) {
            this.raise_error(`Цикл while превысил максимальное количество повторений (${this.maxIterations})`, 'soft');
        }
    }

    evaluate_condition() {
        if (this.condition instanceof ArithmeticOperationBlock) {
            return this.condition.execute();
        }
        
        else if (this.condition instanceof VariableBlock) {
            return this.condition.get_var_value();
        }
        
        else {
            return Boolean(this.condition);
        }
    }

    execute_body(args) {
        if (!this.body_start) return;
        
        let current = this.body_start;
        
        while (current) {
            const next_in_body = current.next_block;
            
            current.execute(args);
            
            current = next_in_body;
        }
    }
}
class BlockManager {
    constructor() {
        this.blocks = new Map();
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
        }
    }
    
    clear() {
        this.blocks.clear();
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
}

class RootUI{
    constructor(){
        this.manager = BlockManager();
        this.drop_zone = document.querySelector('.drop-zone');
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
        });
        
        document.getElementById('add_vars').addEventListener('click', () => {
            VariablePopUp();
        });
        
        document.getElementById('add_arr').addEventListener('click', () => {
            ArrayPopUp();
        });
        this.manager.loadFromLocalStorage();
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
        const block = this.drop_zone.querySelector('.start-block');
        while (block){
            block.execute();
            block = block.next_block;
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    window.app = new RootUI();
});


