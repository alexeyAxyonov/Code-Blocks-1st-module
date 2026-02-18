
let variables_and_arrays = {};

class BaseBlock{
    //Если хотите изменить поведение всех блоков в целом, то изменяйте этот класс. От него будут наследоваться все остальные блоки
    past_block = null;
    next_block = null
    id = null;
    constructor(id){
        this.id = id;
    }
    add_next_block(id){
        this.next_block = id;
    }
    remove_next_block(){
        this.next_block = null;
    }
    add_past_block(id){
        this.past_block = id;
    }
    remove_past_block(){
        this.past_block = null;
    }
    //TODO: реализовать drag-and-drop
}

class ArithmeticOperationBlock{

}

class StartBlock extends BaseBlock{
}

class EndBlock extends BaseBlock{
}

class Equals extends ArithmeticOperationBlock{

}

class VariableBlock extends BaseBlock{
    /*Класс блоков с переменными. При наведении отображает значение.*/
}

function AddVariables(variables){
    //Получает список переменных из variables
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
        const regex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
        return regex.test(str_var)
    }
    let intermediate_value = variables.split(/\s*,\s*/).filter(item => item !== '');
    for (let i = 0; i < intermediate_value.length; i++){
        if (is_valid_variable_name(intermediate_value[i])){
            variables_and_arrays[intermediate_value[i]] = 0;
            //TODO: добавить объекты VariableBlock.
        }
        else{
            //TODO: возможно вывести ошибку? или просто проигнорить и записать только
            //валидные названия.
        }
    }
}


function StartProgram(start_id){
    start_id.next_block = id
    //TODO: if start_id = true:
    alert("start_program")
    while (true){
        /* TODO: цикл взятия id из объектов-блоков.
        TODO: реализовать case/switch.
        */
        print(id)
        switch (id){
            case "end":
                alert("program ended")
                break;
            case "if_cycle":

            case "":
        }
        id = id.next_block
    }
}
