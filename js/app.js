let t1 = new Task('Test', 'Ceci est une tache test', '15 minutes');
let t2 = new Task('Vaisselle', 'Faire la vaisselle', '2 jours', 'tag');
let t3 = new Task('Poubelles', 'Sortir les poubelles', '5 jours', 'tag');

$('.tasks_list').append(t1.getTask()).append(t2.getTask()).append(t3.getTask());

console.log($('.tasks_list'));
