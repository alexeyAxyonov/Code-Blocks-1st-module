let variables = {
    data: {},
    metadata: {},

    get_variable(var_name) {
        return this.data[var_name];
    },
    set_variable(var_name, value) {
        this.data[var_name] = value;
    },

    is_variable_name(var_name) {
        return var_name in this.data;
    },
};

window.arrays = {
    data: {},
    metadata: {},

    get_array(arr_name) {
        return this.data[arr_name];
    },

    make_array(arr_name, length, values = []) {
        if (!this.data[arr_name]) {
            this.data[arr_name] = new FixedArray(length, values);
        } else {
            console.error(`Массив ${arr_name} уже существует`);
        }
    },

    set_array(arr_name, values) {
        if (this.data[arr_name]) this.data[arr_name].fill(values);
    },

    is_array_name(arr_name) {
        return arr_name in this.data;
    },
};

class FixedArray {
    constructor(length, elements = []) {
        this._length = length;
        this._data = [...elements];
        Object.defineProperty(this, "length", {
            get: () => this._length,
            enumerable: true,
            configurable: false,
        });
    }
    fill(elements) {
        if (elements.length <= this._length) this._data = [...elements];
        else console.error("Количество значений превышает длину массива");
    }
    get(index) {
        if (index < 0 || index >= this._length) {
            console.error("Индекс вне диапазона");
            return undefined;
        }
        return this._data[index];
    }
    set(index, value) {
        if (index < 0 || index >= this._length) {
            console.error("Индекс вне диапазона");
            return;
        }
        this._data[index] = value;
    }
    [Symbol.iterator]() {
        return this._data[Symbol.iterator]();
    }
    toArray() {
        return [...this._data];
    }
}

function is_valid_variable_name(str_var) {
    const forbidden = [
        "break",
        "case",
        "catch",
        "class",
        "const",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "export",
        "extends",
        "finally",
        "for",
        "function",
        "if",
        "import",
        "in",
        "instanceof",
        "new",
        "return",
        "super",
        "switch",
        "this",
        "throw",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with",
        "yield",
        "let",
        "static",
        "implements",
        "interface",
        "package",
        "private",
        "protected",
        "public",
        "await",
    ];
    if (forbidden.includes(str_var)) return false;
    const regex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
    if (!regex.test(str_var)) return false;
    if (
        variables.is_variable_name(str_var) ||
        window.arrays.is_array_name(str_var)
    )
        return false;
    return true;
}

function VariablePopUp() {
    const varName = prompt("Введите имя переменной:");
    if (varName && varName.trim()) AddVariables(varName.trim());
}

function ArrayPopUp() {
    const arrName = prompt("Введите имя массива:");
    const length = prompt("Введите размер массива:");
    if (arrName && length) AddArray(arrName.trim(), parseInt(length));
}

function AddVariables(vars) {
    let list = vars.split(/\s*,\s*/).filter((item) => item !== "");
    for (let name of list) {
        if (is_valid_variable_name(name)) {
            variables.set_variable(name, 0);
            console.log(`Переменная ${name} создана`);
        } else {
            console.error(`Невозможно создать переменную: ${name}`);
        }
    }
}

function AddArray(arr_name, len) {
    if (is_valid_variable_name(arr_name)) {
        window.arrays.make_array(arr_name, len);
        console.log(`Массив ${arr_name}[${len}] создан`);
    } else {
        console.error(`Невозможно создать массив: ${arr_name}`);
    }
}

class BaseBlock {
    constructor(id, type, element = null) {
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
    add_next_block(block) {
        if (this.next_block) this.remove_next_block();
        this.next_block = block;
        if (block) block.past_block = this;
    }
    remove_next_block() {
        if (this.next_block) {
            this.next_block.past_block = undefined;
            this.next_block = undefined;
        }
    }
    add_past_block(block) {
        if (this.past_block) this.remove_past_block();
        this.past_block = block;
        if (block) block.next_block = this;
    }
    remove_past_block() {
        if (this.past_block) {
            this.past_block.next_block = undefined;
            this.past_block = undefined;
        }
    }
    insert_after(block) {
        if (!block) return;
        const oldNext = this.next_block;
        this.add_next_block(block);
        if (oldNext) block.add_next_block(oldNext);
    }
    insert_before(block) {
        if (!block) return;
        if (this.past_block) this.past_block.insert_after(block);
        else block.add_next_block(this);
    }
    get_first_block() {
        let c = this;
        while (c.past_block) c = c.past_block;
        return c;
    }
    get_last_block() {
        let c = this;
        while (c.next_block) c = c.next_block;
        return c;
    }
    is_first() {
        return !this.past_block;
    }
    is_last() {
        return !this.next_block;
    }
    execute(args) { }
    raise_error(text, type = "force_stop") {
        console.error(`[${type}] ${text}`);
        printError(text);
    }
}

class StartBlock extends BaseBlock { }
class EndBlock extends BaseBlock { }

class ArithmeticOperationBlock extends BaseBlock {
    constructor(id) {
        super(id, "arithmetic");
        this.left = null;
        this.right = null;
    }
    add_left(v) {
        this.left = v;
    }
    add_right(v) {
        this.right = v;
    }
    execute() {
        const l = this.get_value(this.left),
            r = this.get_value(this.right);
        const res = this.operate(l, r);
        console.log(`${l} ${this.operator} ${r} = ${res}`);
        return res;
    }
    get_value(something) {
        if (something instanceof ArithmeticOperationBlock)
            return something.execute();
        if (something instanceof VariableBlock) return something.get_var_value();
        return something;
    }
    operate(l, r) { }
}

class EqualsBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, "==");
    }
    operate(l, r) {
        return l === r;
    }
}
class Plus extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, "+");
    }
    operate(l, r) {
        return typeof l === "string" || typeof r === "string"
            ? String(l) + String(r)
            : l + r;
    }
}
class Minus extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, "-");
    }
    operate(l, r) {
        return l - r;
    }
}
class Multiply extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, "*");
    }
    operate(l, r) {
        return l * r;
    }
}
class Divide extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, "/");
    }
    operate(l, r) {
        if (r === 0) {
            console.error("Деление на 0");
            return 0;
        }
        return l / r;
    }
}
class Modulo extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, "%");
    }
    operate(l, r) {
        if (r === 0) {
            console.error("Модуль по нулю");
            return 0;
        }
        return l % r;
    }
}
class Power extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, "^");
    }
    operate(l, r) {
        return Math.pow(l, r);
    }
}
class GreaterThanBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, ">");
    }
    operate(l, r) {
        return l > r;
    }
}
class LessThanBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, "<");
    }
    operate(l, r) {
        return l < r;
    }
}
class GreaterThanOrEqualBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, ">=");
    }
    operate(l, r) {
        return l >= r;
    }
}
class LessThanOrEqualBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, "<=");
    }
    operate(l, r) {
        return l <= r;
    }
}
class NotEqualsBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, "!=");
    }
    operate(l, r) {
        return l !== r;
    }
}
class AndBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, "&&");
    }
    operate(l, r) {
        return Boolean(l) && Boolean(r);
    }
}
class OrBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, "||");
    }
    operate(l, r) {
        return Boolean(l) || Boolean(r);
    }
}
class NotBlock extends ArithmeticOperationBlock {
    constructor(id) {
        super(id, "!");
    }
    execute() {
        const v = this.get_value(this.left);
        const r = !Boolean(v);
        console.log(`Not: ${v} -> ${r}`);
        return r;
    }
    operate(l) {
        return !Boolean(l);
    }
}

class AssignmentOperator extends ArithmeticOperationBlock {
    constructor(id, var_name = "", expression = "0") {
        super(id);
        this.type = "assign";
        this.var_name = var_name;
        this.expression = expression;
    }
    execute() {
        const value = evaluateExpression(this.expression);
        this.assign(this.var_name, value);
        updateVarsDisplay();
    }
    assign(var_name, value) {
        if (variables.is_variable_name(var_name)) {
            variables.set_variable(var_name, value);
        } else if (window.arrays.get_array(var_name)) {
            window.arrays.set_array(var_name, value);
        } else {
            console.error(`Переменной/массива ${var_name} не существует`);
            printError(
                `Переменной "${var_name}" не существует. Сначала объявите её.`
            );
        }
    }
}

class VariableBlock extends BaseBlock {
    constructor(id, name) {
        super(id, "variable");
        this.name = name;
    }
    get_var_value() {
        return variables.get_variable(this.name);
    }
    execute() {
        const v = this.get_var_value();
        console.log(`${this.name} = ${v}`);
        return v;
    }
}

class ArrayBlock extends BaseBlock {
    constructor(id, name) {
        super(id, "array");
        this.name = name;
    }
}

class IfBlock extends BaseBlock {
    constructor(id, condition = "true") {
        super(id, "if");
        this.condition = condition;
        this.body = [];
    }
    execute() {
        const r = !!evaluateExpression(this.condition);
        console.log(`если (${this.condition}) → ${r}`);
        return r;
    }
}
class ElseBlock extends BaseBlock { }
class ForBlock extends BaseBlock {
    constructor(id) {
        super(id, "for");
        this.var_name = null;
        this.from = 0;
        this.to = 0;
        this.body = [];
    }
}
class WhileBlock extends BaseBlock {
    constructor(id) {
        super(id, "while");
        this.condition = null;
        this.body = [];
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
    execute() {
        const v = evaluateExpression(this.expression);
        printOutput(String(v));
        console.log("Вывод:", v);
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
        const b = this.blocks.get(id);
        if (b) {
            if (b.past_block) b.past_block.next_block = b.next_block;
            if (b.next_block) b.next_block.past_block = b.past_block;
            this.blocks.delete(id);
        }
    }
    clear() {
        this.blocks.clear();
    }
    get_chain(startBlock) {
        const chain = [];
        let c = startBlock;
        while (c) {
            chain.push(c);
            c = c.next_block;
        }
        return chain;
    }
    run_program(startBlock) {
        let current = startBlock || this.get_first_block();
        while (current) {
            if (current instanceof IfBlock) {
                const result = current.execute();
                if (!result && current.next_block) {
                    current = current.next_block.next_block;
                    continue;
                }
            } else {
                current.execute();
            }
            current = current.next_block;
        }
    }
    get_first_block() {
        let c = this.blocks.values().next().value;
        if (!c) return null;
        while (c.past_block) c = c.past_block;
        return c;
    }
}

function evaluateExpression(expr) {
    if (expr === null || expr === undefined) return 0;
    expr = String(expr).trim();
    if (expr === "") return 0;
    const substituted = expr.replace(/[a-zA-Z_$][a-zA-Z0-9_$]*/g, (match) => {
        if (variables.is_variable_name(match)) return variables.get_variable(match);
        return match;
    });
    try {
        return Function('"use strict"; return (' + substituted + ")")();
    } catch (e) {
        console.error("Ошибка в выражении:", expr, e);
        printError(`Ошибка в выражении: "${expr}"`);
        return 0;
    }
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

let draggedType = null;
let blockCounter = 0;
const manager = new BlockManager();

function createBlockFromType(type) {
    blockCounter++;
    const id = `block_${blockCounter}`;
    switch (type) {
        case "declare": {
            const name = prompt("Имя переменной (латиница):");
            if (!name || !name.trim()) return null;
            const val = prompt("Начальное значение:", "0");
            const num = parseFloat(val);
            return new DeclareBlock(id, name.trim(), isNaN(num) ? 0 : num);
        }
        case "assign": {
            const name = prompt("Имя переменной для присвоения:");
            if (!name || !name.trim()) return null;
            const expr = prompt("Выражение (например: x + 1 или 42):");
            if (expr === null) return null;
            return new AssignmentOperator(id, name.trim(), expr.trim());
        }
        case "if": {
            const cond = prompt("Условие (например: x > 5):");
            if (cond === null) return null;
            return new IfBlock(id, cond.trim());
        }
        case "print": {
            const expr = prompt("Что вывести (переменная или выражение):");
            if (expr === null) return null;
            return new PrintBlock(id, expr.trim());
        }
        case "variable":
            return new VariableBlock(id, "x");
        case "while":
            return new WhileBlock(id);
        case "for":
            return new ForBlock(id);
        default:
            return new BaseBlock(id, type);
    }
}

class RootUI {
    constructor() {
        this.manager = manager;
        this.drop_zone = document.querySelector(".drop-zone");
        this.init();
    }

    init() {
        const startBtn = document.getElementById("start_button");
        const stopBtn = document.getElementById("stop_button");
        const clearBtn = document.getElementById("clear_button");
        const addVarsBtn = document.getElementById("add_vars");
        const addArrBtn = document.getElementById("add_arr");

        if (startBtn) startBtn.addEventListener("click", () => this.run_program());
        if (stopBtn)
            stopBtn.addEventListener("click", () => console.log("Stopped"));
        if (clearBtn) clearBtn.addEventListener("click", () => this.clear_all());
        if (addVarsBtn) addVarsBtn.addEventListener("click", () => VariablePopUp());
        if (addArrBtn) addArrBtn.addEventListener("click", () => ArrayPopUp());

        this.initDragAndDrop();
    }

    initDragAndDrop() {
        const dropZone = this.drop_zone;
        if (!dropZone) return;

        document.querySelectorAll(".palette-block").forEach((block) => {
            block.addEventListener("dragstart", (e) => {
                draggedType = block.dataset.type;
                block.classList.add("dragging");
                e.dataTransfer.effectAllowed = "copy";
            });
            block.addEventListener("dragend", () =>
                block.classList.remove("dragging")
            );
        });

        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault(); // ОБЯЗАТЕЛЬНО
            dropZone.classList.add("drag-over");
        });
        dropZone.addEventListener("dragleave", () =>
            dropZone.classList.remove("drag-over")
        );

        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("drag-over");
            if (!draggedType) return;

            const block = createBlockFromType(draggedType);
            if (!block) {
                draggedType = null;
                return;
            }

            const div = document.createElement("div");
            div.className = "ws-block--dropped";
            div.dataset.type = draggedType;
            div.dataset.id = block.id;

            const label = document.createElement("span");
            label.textContent = this.getBlockLabel(block);
            div.appendChild(label);

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "×";
            deleteBtn.onclick = () => {
                div.remove();
                this.manager.remove_block(block.id);
            };
            div.appendChild(deleteBtn);

            const hint = dropZone.querySelector(".drop-hint");
            if (hint) hint.remove();

            dropZone.appendChild(div);

            if (this.manager.blocks.size > 0) {
                const last = this.manager.get_first_block().get_last_block();
                last.add_next_block(block);
            }
            this.manager.add_block(block);
            draggedType = null;
        });
    }

    getBlockLabel(block) {
        switch (block.type) {
            case "declare":
                return `📦 ${block.var_name} = ${block.initial_value}`;
            case "assign":
                return `✏️ ${block.var_name} = ${block.expression}`;
            case "if":
                return `🔀 если (${block.condition})`;
            case "print":
                return `🖨️ вывести: ${block.expression}`;
            case "variable":
                return `📌 ${block.name}`;
            default:
                return block.type;
        }
    }

    run_program() {
        const output = document.getElementById("output");
        const errors = document.getElementById("errors");
        if (output) output.innerHTML = "";
        if (errors) errors.innerHTML = "";

        if (this.manager.blocks.size === 0) {
            printError("Нет блоков. Перетащите блоки в рабочую область.");
            return;
        }

        console.log("=== Запуск программы ===");
        try {
            this.manager.run_program();
        } catch (e) {
            printError("Ошибка выполнения: " + e.message);
            console.error(e);
        }
        console.log("=== Программа завершена ===");

        if (output && output.innerHTML === "") {
            output.innerHTML =
                '<p class="empty-text">Нет вывода. Добавьте блок "Вывести"</p>';
        }
    }

    clear_all() {
        this.manager.clear();
        variables.data = {};
        window.arrays.data = {};
        if (this.drop_zone) {
            this.drop_zone.innerHTML =
                '<span class="drop-hint">Блоки перетаскивать сюда</span>';
        }
        updateVarsDisplay();
        const output = document.getElementById("output");
        const errors = document.getElementById("errors");
        if (output)
            output.innerHTML =
                '<p class="empty-text">Нажмите "Начать" для запуска</p>';
        if (errors) errors.innerHTML = '<p class="empty-text">Ошибок нет</p>';
    }

    render_block(block_id) { }
    render_saved_blocks() { }
}

document.addEventListener("DOMContentLoaded", function () {
    window.app = new RootUI();
    console.log("Приложение инициализировано");
});

window.variables = variables;
window.manager = manager;
