let t1 = new Task('Test', 'Ceci est une tache test igfdskfb sysf sdfuh sfgu scxbcb fgfisqg isgugs dqgsufdsfoi y oyfyosyfudhfuhufhiusfhfsiugh', 1500);
let t2 = new Task('Vaisselle', 'Faire la vaisselle', 2, [new Tag('matériel'), new Tag('test'), new Tag('nourriture'), new Tag('tsss')]);
let t3 = new Task('Poubelles', 'Sortir les poubelles', 5, [new Tag('déchets')]);

$('.tasks_list').append(t1.getTask()).append(t2.getTask()).append(t3.getTask());

$('.tasks_list').append(
    $(document.createElement('li')).attr('class', 'list-group-item')
        .append($(document.createElement('button')).attr('class', 'btn btn-primary btn-sm').text('Add new task'))
);

console.log($('.tasks_list'));

function closeModal() {
   $('.modal').remove();
}

$('.btn_tags').click(event => $(event.target.nextElementSibling).toggle('slow'));

$('.btn_details').click(event => $(event.target.nextElementSibling).toggle('slow'));

$(window).resize(function () {
    $('.details_hidden').hide();
});
