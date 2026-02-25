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

class BaseBlock extends HTMLElement{
    //Если хотите изменить поведение всех блоков в целом, то изменяйте этот класс. От него будут наследоваться все остальные блоки
    /* Планируемое поведение BaseBlock:
    1. Drag-and-drop
    2. Подсветка при неправильной интерпретации
    3. */

    constructor(id){
        super();
        past_block = undefined;
        next_block = undefined;
        this.id = id;
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
    
    get_chain_length() {
        let length = 1;
        let current = this;
        
        while (current.next_block) {
            current = current.next_block;
            length++;
        }
        
        current = this;
        while (current.past_block) {
            current = current.past_block;
            length++;
        }
        
        return length;
    }

    execute(args){
        // Здесь ничего не будет, но в каждом блоке эта функция
        // Будет переписываться.
    }

    raise_error(error_text, error_type='force_stop'){
        /*Вызывает ошибку в терминале. Значения error_type:
        1. force_stop: Выводит ошибку и останавливает программу. Выделяет блок с ошибкой.
        2. soft: Выводит ошибку, но программа продолжает работать (например, при
        создании переменной/массива с неправильным названием*/
    }
}

class StartBlock extends BaseBlock{
    //Запускает программу
}

class EndBlock extends BaseBlock{
    //Завершает программу
}

class ArithmeticOperationBlock extends BaseBlock{
    /* Проходит по детям вниз, пока не доходит до самого нижнего ребёнка
       Затем выполняет выражение и передаёт это предку */
    get_value(something){
        /*Определяет, что такое something. Если это переменная, то 
        возвращает значение переменной. Если значение, то возвращает это значение*/
        if (variables.get_variable(var_name)){
            return variables.get_variable(var_name);
        }
        else{
            return something;
        }
    }
}

class EqualsBlock extends ArithmeticOperationBlock{
    //Логический оператор сравнения
    execute(args){
        let [left, right] = [args];
    }
    equals(left, right){
        return (left === right); //Этого хватит?
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

class Plus extends ArithmeticOperationBlock{

}

class VariableBlock extends BaseBlock{
    //Класс блоков с переменными. При наведении отображает значение
    //TODO: сделать отображение значения при наведении.
    
}

class ArrayBlock extends BaseBlock{

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
    
    run_program() {
        for (const block of this.blocks.values()) {
            if (block instanceof StartBlock && block.is_first()) {
                return block.execute();
            }
        }
        //Универсальная ошибка. Текст: "Не найден начальный блок"
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

//Делает то, что в define() тегами типа <div>.
customElements.define('start-block');
customElements.define('if-block');
customElements.define('else-block');
customElements.define('for-block');
customElements.define('while-block');
customElements.define('end-block');


class RootUI{
    constructor(){

    }
    render_blocks(){
        // В начале программы рендерит блоки
        // TODO: По мере добавления блоков обновляйте данные.
        /* Классы блоков: 
            start_block - начальный блок
            end_block - конечный блок
            control_block - блок для проведения разных операций (циклы, условия)
            logic_block - логические блоки
            arithmetic_block - арифметика
            variable_block - блок с переменной
            array_block - блок с массивом*/
        const blocks_data = [
            {class: 'StartBlock', text: 'Начало программы', color: 'FFFB5E'},
            {class: 'IfBlock', text: 'Если', color: 'FF5500'},
            {class: 'ElseBlock', text: 'Иначе', color: 'FF5500'},
            // Я не придумал норм перевода 'for'
            {class: 'ForBlock', text: '', color: '4DFFDC'},
            {class: 'WhileBlock', text: 'Пока', color: '4DFFDC'}, //while
            {class: 'EndBlock', text: "Конец", color: 'FF9A00'},
        ];

        const container = document.getElementById('sidebar');
        blocks_data.forEach(data => {
            let tag_name = data.class.toLowerCase().replace('block', '-block');
            const block = document.createElement(tag_name);
            const text_span = document.createElement('span');
            text_span.className = 'block_text';
            text_span.innerText = 'Начало программы';

            block.appendChild(text_span);
            container.appendChild(block);
        });


    }
    render_block(block_id){
        // При создании нового блока его надо рендерить.
    }

    render_saved_blocks(){
        /* 
        
        Юзер будет создавать переменные, массивы и функции, их также надо сохранять и тут
        распаковывать. */
        //TODO: сделать систему сохранений и эту функцию заодно.
    }
    mainloop(){

    }
}
