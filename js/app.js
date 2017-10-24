let t1 = new Task('Test', 'Ceci est une tache test igfdskfb sysf sdfuh sfgu scxbcb fgfisqg isgugs dqgsufdsfoi y oyfyosyfudhfuhufhiusfhfsiugh', 1500);
let t2 = new Task('Vaisselle', 'Faire la vaisselle', 2, [new Tag('matériel'), new Tag('test')]);
let t3 = new Task('Poubelles', 'Sortir les poubelles', 5, [new Tag('déchets')]);

$('.tasks_list').append(t1.getTask()).append(t2.getTask()).append(t3.getTask());

console.log($('.tasks_list'));

$('.btn_tags').click(event => $(event.target.nextElementSibling).toggle('slow'));

$('.btn_details').click(event => $(event.target.nextElementSibling).toggle('slow'));

$(window).resize(function () {
    $('.details_hidden').hide();
});
