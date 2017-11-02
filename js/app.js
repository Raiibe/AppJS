let t1 = new Task('Test', 'Ceci est une tache test igfdskfb sysf sdfuh sfgu scxbcb fgfisqg isgugs dqgsufdsfoi y oyfyosyfudhfuhufhiusfhfsiugh', 1500);
let t2 = new Task('Vaisselle', 'Faire la vaisselle', 2, [new Tag('matériel'), new Tag('test'), new Tag('nourriture'), new Tag('tsss')]);
let t3 = new Task('Poubelles', 'Sortir les poubelles', 5, [new Tag('déchets')]);

$('.tasks_list').append(t1.getTask()).append(t2.getTask()).append(t3.getTask());

$('.tasks_list').append(
    $(document.createElement('li')).attr('class', 'list-group-item')
        .append($(document.createElement('button')).attr('class', 'btn btn-primary').text('Add new task'))
);

console.log($('.tasks_list'));

function closeModal() {
   $('.modal').remove();
}

$('.btn_tags').click(event => $(event.target.nextElementSibling).toggle('slow'));

$('.btn_details').click(event => $(event.target.nextElementSibling).toggle('slow'));

$('.btn_add').click(function () {

    // MODAL HEADER ///////////////////////////
    let title_h5 = document.createElement('h5');
    $(title_h5).attr('class', 'modal-title').text('Add tag');

    let btn_close = document.createElement('button');
    $(btn_close).attr('class', 'close fa fa-times').attr('data-dismiss', 'modal').attr('aria-label', 'Close')
        .append($(document.createElement('span')).attr('aria-hidden', 'true'));

    let div_modal_header = document.createElement('div');
    $(div_modal_header).attr('class', 'modal-header')
        .append(title_h5).append(btn_close);


    // MODAL BODY /////////////////////////////
    let span = document.createElement('span');
    $(span).attr('class', 'input-group-addon').attr('id', 'basic-addon-name').text('Name');

    let input = document.createElement('input');
    $(input).attr('type', 'text').attr('class', 'form-control').attr('placeholder', 'Name')
        .attr('aria-label', 'Name').attr('aria-describedby', 'basic-addon-name');

    let div_input = document.createElement('div');
    $(div_input).attr('class', 'input-group')
        .append(span).append(input);

    let div_modal_body = document.createElement('div');
    $(div_modal_body).attr('class', 'modal-body')
        .append(div_input);


    // MODAL FOOTER ///////////////////////////
    let btn_close2 = document.createElement('button');
    $(btn_close2).attr('class', 'cancel btn btn-secondary').attr('data-dismiss', 'modal').text('Cancel');

    let btn_save = document.createElement('button');
    $(btn_save).attr('class', 'btn btn-primary').text('Submit');

    let div_modal_footer = document.createElement('div');
    $(div_modal_footer).attr('class', 'modal-footer')
        .append(btn_close2).append(btn_save);


    // MODAL CONTENT //////////////////////////
    let div_modal_content = document.createElement('div');
    $(div_modal_content).attr('class', 'modal-content')
        .append(div_modal_header).append(div_modal_body).append(div_modal_footer);


    // MODAL DIALOG ///////////////////////////
    let div_modal_dialog = document.createElement('div');
    $(div_modal_dialog).attr('class', 'modal-dialog').attr('role', 'document')
        .append(div_modal_content);


    // MODAL //////////////////////////////////
    let div_modal = document.createElement('div');
    $(div_modal).attr('class', 'modal').attr('tabindex', '-1').attr('role', 'dialog').attr('style', 'display: block; background-color: rgba(0, 0, 0, 0.7)')
        .append(div_modal_dialog);


    $('.container').append(div_modal);

    $('.close').click(closeModal);
    $('.cancel').click(closeModal);
});

$(window).resize(function () {
    $('.details_hidden').hide();
});
