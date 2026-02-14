
function Addition(var1, var2){
    return var1 + var2;
}

class StartBlock{
    past_block = null;
    next_block = null;

    add_next_block(id){
        this.next_block = id;
    }
    remove_next_block(){
        //TODO: сделать эту функцию
    }
}
class EndBlock{
    past_block = null;
    next_block = null;
    add_next_block(id){
        this.next_block = id;
    }
    remove_next_block(){
        //TODO: сделать эту функцию
    }
}

class TestBlock{
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