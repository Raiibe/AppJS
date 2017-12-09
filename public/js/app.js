window.TaskManager = (() => {
    let module = {};

    module.Task = class Task {
        constructor(id, name, descr, duration, tags) {
            this.id = id;
            this.name = name;
            this.description = descr;
            this.duration = duration;
            this.tags = tags;
        }

        // genere le code HTML affichant une tache
        getTask() {
            // span affichant le nom de la tache
            let span = $('<span>')
                .attr('class', 'h5').css('color', this.getPriority()).text(this.name);


            // div contenant la description et la duree de la tache
            let div = $('<div>')
                .attr('class', 'details col-12 mb-2')
                .append($('<span>').attr('class', 'descr').text(this.description))
                .append($('<span>').attr('class', 'badge badge-primary float-right')
                    .css('background-color', this.getPriority())
                    .text(this.convertTime()));


            // button cache permettant d'afficher les details sur un viewport tablette et mobile
            let button_details = $('<button>')
                .attr('class', 'btn btn-primary btn-sm btn_details mt-2 mb-2').text('Description')
                .click(event => $(event.target.nextElementSibling).toggle('slow'));


            // div cachee contenant la description et la duree de la tache pour viewport tablette et mobile
            let div_hidden = $('<div>')
                .attr('class', 'details_hidden col-12')
                .append($('<span>').attr('class', 'descr').text(this.description))
                .append($('<span>').attr('class', 'badge badge-primary float-right')
                    .css('background-color', this.getPriority())
                    .text(this.convertTime()));


            // button permettant d'afficher les differents tags de la tache
            let button_tags = $('<button>')
                .attr('class', 'btn btn-primary btn-sm btn_tags mb-2').text('Tags')
                .click(event => $(event.target.nextElementSibling).toggle('slow'));


            // ul contenant la zone des tags de la tache
            let ul_tags = TaskManager.Tag.displayTags(this);

            // button permettant de supprimer la tache
            let button_delete_task = $('<span>')
                .attr('class', 'cross_task float-right').html('&times;')
                .on('click', { 'id_task': this.id }, TaskManager.Task.deleteTask);


            // li contenant la tache avec toutes ses caracteristiques
            return $('<li>')
                .attr('id', 'task-' + this.id)
                .attr('class', 'list-group-item')
                .append(button_delete_task)
                .append(span)
                .append(div)
                .append(button_details)
                .append(div_hidden)
                .append(button_tags)
                .append(ul_tags);
        }

        convertTime() {
            // convertit la duree (en minutes) en heures et minutes et l'affiche
            let minutes = this.duration % 60;
            let hours = (this.duration - minutes) / 60;
            let string = '';

            if (hours !== 0 && minutes !== 0) {
                string += hours + 'h';
                if (minutes.toString().length === 1)
                    string += '0' + minutes;
                else
                    string += minutes;
            }
            else if (hours === 0)
                string += minutes + 'min';
            else if (minutes === 0)
                string += hours + 'h';

            return string;
        }

        getPriority() {
            if (this.duration <= 180) { // correspond à 3 heures en minutes
                return 'red';
            }
            else if (this.duration <= 360) { // correspond à 6 heures en minutes
                return 'orange';
            }
            else {
                return 'green';
            }
        }

        static addTask() {
            // recupere la totalite des taches pour recuperer l'id de la derniere tache
            let tasks = $('[id^="task-"]');
            let last_task_id = 0;

            if (tasks.length > 0) {
                last_task_id = tasks[tasks.length - 1].id.split('-')[1];
            }

            // contiendra les tags a ajouter a la tache
            let tags = null;

            // correspond au tag ecrit dans le champ
            let newTag = $('#task_tag').val();

            // correspond aux tags selectionne dans la fenetre modal
            let elements = $('.tag_selected');

            if (elements.length > 0) {
                tags = {};

                for (let i = 0; i < elements.length; i++) {
                    tags[i + 1] = new TaskManager.Tag((i + 1).toString(), elements[i].innerText);
                }

                if (newTag !== '') {
                    tags[elements.length + 1] = new TaskManager.Tag((elements.length + 1).toString(), $('#task_tag').val());
                }
            } else {
                if (newTag !== '') {
                    tags = {};
                    tags[elements.length + 1] = new TaskManager.Tag((elements.length + 1).toString(), $('#task_tag').val());
                }
            }

            TaskManager.checkValue($('#duration_hour'));
            let duration_hour = $('#duration_hour').val();

            TaskManager.checkValue($('#duration_min'));
            let duration_min = $('#duration_min').val();

            let duration = parseInt(duration_hour) * 60 + parseInt(duration_min);

            let t = new TaskManager.Task((parseInt(last_task_id) + 1).toString(), $('#task_name').val(), $('#task_descr').val(), duration.toString(), tags);

            // ajoute la nouvelle tache au tableau de taches
            TaskManager.allTasks.push(t);

            // ajoute les tags de la nouvelle tache dans le tableau des tags
            $.map(t.tags, (tag) => {
                TaskManager.allTags.push(tag);
            });

            // ajoute la nouvelle tache dans le tableau de sauvegarde locale
            localStorage.setItem((t.id - 1), JSON.stringify(t));

            // ajoute la nouvelle tache dans le code HTML
            $('#tasks_list').append(t.getTask());

            // ajoute la nouvelle tache dans le fichier json
            TaskManager.addNewTask(location.href + 'api/server/tasks/addtask', JSON.stringify(t)).done((data) => {
                //console.log(data);
            });

            TaskManager.closeModal();
        }

        static deleteTask(task_id) {
            // supprime la tache du tableau des taches
            delete TaskManager.allTasks[task_id.data['id_task'] - 1];

            // supprime la tache du tableau de sauvegarde locale
            localStorage.removeItem(task_id.data['id_task'] - 1);

            // supprime la tache du code HTML
            $('#task-' + task_id.data['id_task']).remove();

            // supprime la tache dans le fichier json
            TaskManager.deleteData(location.href + 'api/server/tasks/' + task_id.data['id_task']).done((data) => {
                //console.log(data);
            });
        }

        static addTag(task_id) {
            // recupere la tache auquelle on veut ajouter les nouveaux tags
            let task = JSON.parse(localStorage[task_id.data['id_task'] - 1]);

            // recupere les tags de la tache pour y ajouter les nouveaux apres
            let tags = task.tags;

            // correspond aux tags selectionne dans la fenetre modal
            let elements = $('.tag_selected');

            // ajoute les tags selectionnes aux tags deja existants
            for (let i = 0; i < elements.length; i++) {
                let tag_id = 0;

                if (tags !== null) {
                    tag_id = Object.values(tags).length;
                } else {
                    tags = {};
                }

                tags[tag_id + 1] = new TaskManager.Tag((tag_id + 1), elements[i].innerText);

                // ajoute les tags dans le tableau des tags
                TaskManager.allTags.push(tags[tag_id + 1]);

                // ajoute les tags dans le code HTML
                let li = $('<li>')
                    .attr('id', 'tag-' + (tag_id + 1)).attr('class', 'tag btn btn-outline-secondary mr-2 mb-2')
                    .append($('<span>').attr('class', 'mr-2').text(tags[tag_id + 1].name))
                    .append($('<span>').attr('class', 'cross_tag').html('&times;').on('click', { 'id_task': task_id.data['id_task'], 'id_tag': (tag_id + 1) }, TaskManager.Task.deleteTag));

                // supprime le tag null affichant "No tags" s'il existe
                $('#task-' + task_id.data['id_task'] + ' #tag-null').remove();

                // ajoute les tags avant le "+" permettant d'ajouter un nouveau tag
                $('#task-' + task_id.data['id_task'] + ' ul.tag_area .btn_add').before(li);
            }

            // idem qu'au dessus mais avec le nouveau tag ecrit dans le champ de la fenetre modal
            let new_tag = $('#task_tag').val();
            if (new_tag !== '') {
                let tag_id = 0;

                if (tags !== null) {
                    tag_id = Object.values(tags).length;
                } else {
                    tags = {};
                }

                tags[tag_id + 1] = new TaskManager.Tag((tag_id + 1), new_tag);
                TaskManager.allTags.push(tags[tag_id + 1]);

                let li = $('<li>')
                    .attr('id', 'tag-' + (tag_id + 1)).attr('class', 'tag btn btn-outline-secondary mr-2 mb-2')
                    .append($('<span>').attr('class', 'mr-2').text(tags[tag_id + 1].name))
                    .append($('<span>').attr('class', 'cross_tag').html('&times;').on('click', { 'id_task': task_id.data['id_task'], 'id_tag': (tag_id + 1) }, TaskManager.Task.deleteTag));

                $('#task-' + task_id.data['id_task'] + ' #tag-null').remove();
                $('#task-' + task_id.data['id_task'] + ' ul.tag_area .btn_add').before(li);
            }

            // cree une nouvelle tache avec les nouveaux tags
            let t = new TaskManager.Task(task.id, task.name, task.description, task.duration, tags);

            // pour remplacer celle auquelle on veut ajouter des tags
            // dans le tableau des taches
            TaskManager.allTasks[t.id - 1] = t;

            // et dans le tableau de la sauvegarde locale
            localStorage.setItem((t.id - 1), JSON.stringify(t));

            TaskManager.closeModal();

            // ajoute les nouveaux a la tache dans le fichier json
            TaskManager.addTagToTask(location.href + 'api/server/tasks/' + task_id.data['id_task'] + '/addtag', t).done((data) => {
                //console.log(data);
            });
        }

        static deleteTag(object_ids) {
            // supprime le tag de la tache dans le tableau des taches
            delete TaskManager.allTasks[object_ids.data['id_task'] - 1].tags[object_ids.data['id_tag'] - 1];

            // remplace dans le tableau de sauvegarde locale
            // la tache par la meme mais avec le tag en moins
            localStorage.setItem((object_ids.data['id_task'] - 1), JSON.stringify(TaskManager.allTasks[object_ids.data['id_task'] - 1]));

            // supprime le tag du code HTML
            $('#task-' + object_ids.data['id_task'] + ' #tag-' + object_ids.data['id_tag']).remove();

            // recupere tous les autres tags de la tache afin d'ajouter dans le code HTML
            // le tag null affichant "No tags" s'il n'y a plus de tags
            let tags = $('#task-' + object_ids.data['id_task'] + ' [id^="tag-"]');
            if (tags.length === 0) {
                let li = $('<li>')
                    .attr('id', 'tag-null').attr('class', 'tag btn btn-outline-secondary mr-2 mb-2')
                    .append($('<span>').attr('class', 'text-warning').html('&#9888;'))
                    .append($('<span>').text(' No tags'));
                $('#task-' + object_ids.data['id_task'] + ' ul.tag_area .btn_add').before(li);
            }

            // supprime le tag de la tache dans le fichier json
            TaskManager.deleteData(location.href + 'api/server/tasks/' + object_ids.data['id_task'] + '/tags/' + object_ids.data['id_tag']).done((data) => {
                //console.log(data);
            });
        }

        static displayAddTask() {
            // MODAL HEADER de l'ajout de tache ///////////////////////////
            let title_h5 = $('<h5>')
                .attr('class', 'modal-title').text('Add task');

            let btn_close = $('<button>')
                .attr('class', 'close').html('&times;').attr('data-dismiss', 'modal').attr('aria-label', 'Close')
                .append($('<span>').attr('aria-hidden', 'true'));

            let div_modal_header = $('<div>')
                .attr('class', 'modal-header')
                .append(title_h5).append(btn_close);


            // MODAL BODY de l'ajout de tache /////////////////////////////
            let tags = $('<p>').append($('<h6>').text('Select tags or enter a new one:'));
            TaskManager.allTags.forEach((element) => {
                tags.append($('<span>').attr('class', 'badge btn badge-secondary mr-2')
                    .text(element.name).on('click', TaskManager.Tag.selectTag));
            });
            tags.append($('<hr>'));


            // zone de construction de tous les span des caracteristiques de la nouvelle tache
            let span_task_name = $('<span>')
                .attr('class', 'input-group-addon col-3').attr('id', 'basic-addon-name').text('Name');

            let span_task_descr = $('<span>')
                .attr('class', 'input-group-addon col-3').attr('id', 'basic-addon-descr').text('Details');

            let span_task_duration = $('<span>')
                .attr('class', 'input-group-addon col-3').attr('id', 'basic-addon-duration').text('Duration');

            let span_task_tags = $('<span>')
                .attr('class', 'input-group-addon col-3').attr('id', 'basic-addon-tag-name').text('New tag');


            // zone de construction de tous les input des caracteristiques de la nouvelle tache
            let input_task_name = $('<input>')
                .attr('type', 'text').attr('class', 'form-control').attr('id', 'task_name').attr('placeholder', 'Name')
                .attr('name','name').attr('aria-label', 'Name').attr('aria-describedby', 'basic-addon-name');

            let input_task_descr = $('<input>')
                .attr('type', 'text').attr('class', 'form-control').attr('id', 'task_descr').attr('placeholder', 'Details')
                .attr('name', 'description').attr('aria-label', 'Description').attr('aria-describedby', 'basic-addon-descr');

            let input_task_duration_hour = $('<input>')
                .attr('type', 'number').attr('class', 'form-control').attr('id', 'duration_hour').attr('placeholder', 'Hours')
                .attr('min', 0);

            let input_task_duration_min = $('<input>')
                .attr('type', 'number').attr('class', 'form-control').attr('id', 'duration_min').attr('placeholder', 'Minutes')
                .attr('min', 0);

            let input_task_tags = $('<input>')
                .attr('type', 'text').attr('class', 'form-control').attr('id', 'task_tag').attr('placeholder', 'Name')
                .attr('aria-label', 'Tag name').attr('aria-describedby', 'basic-addon-tag-name');


            // zone de construction de toutes les div contenant
            // tous les span et input des caracteristiques de la nouvelle tache
            let div_input_task_name = $('<div>')
                .attr('class', 'input-group mb-3')
                .append(span_task_name)
                .append(input_task_name);

            let div_input_task_descr = $('<div>')
                .attr('class', 'input-group mb-3')
                .append(span_task_descr)
                .append(input_task_descr);

            let div_input_task_duration = $('<div>')
                .attr('class', 'input-group mb-3 input-append date form-datetime')
                .append(span_task_duration)
                .append(input_task_duration_hour)
                .append(input_task_duration_min);

            let div_input_task_tags = $('<div>')
                .attr('class', 'input-group mb-3')
                .append(span_task_tags)
                .append(input_task_tags);

            let div_modal_body = $('<div>')
                .attr('class', 'modal-body')
                .append(tags)
                .append(div_input_task_name)
                .append(div_input_task_descr)
                .append(div_input_task_duration)
                .append(div_input_task_tags);


            // MODAL FOOTER de l'ajout de tache ///////////////////////////
            let btn_close2 = $('<button>')
                .attr('class', 'cancel btn btn-secondary').attr('data-dismiss', 'modal').text('Cancel');

            let btn_save = $('<button>')
                .attr('class', 'submit btn btn-primary').text('Submit')
                .on('click', TaskManager.Task.addTask);

            let div_modal_footer = $('<div>')
                .attr('class', 'modal-footer')
                .append(btn_close2).append(btn_save);


            // MODAL CONTENT de l'ajout de tache //////////////////////////
            let div_modal_content = $('<div>')
                .attr('class', 'modal-content')
                .append(div_modal_header).append(div_modal_body).append(div_modal_footer);


            // MODAL DIALOG de l'ajout de tache ///////////////////////////
            let div_modal_dialog = $('<div>')
                .attr('class', 'modal-dialog').attr('role', 'document')
                .append(div_modal_content);


            // MODAL de l'ajout de tache //////////////////////////////////
            let div_modal = $('<div>')
                .attr('class', 'modal').attr('tabindex', '-1').attr('role', 'dialog').css('display', 'block').css('background-color', 'rgba(0, 0, 0, 0.7)')
                .append(div_modal_dialog);


            $('.container').append(div_modal);

            $('.close').on('click', TaskManager.closeModal);
            $('.cancel').on('click', TaskManager.closeModal);
        }
    };

    module.Tag = class Tag {
        constructor(id, name) {
            this.id = id;
            this.name = name;
        }

        // permet de changer le background des tags s'ils sont selectionnes ou non
        static selectTag() {
            $(this).toggleClass('tag_selected');
        }

        static displayTags(task) {
            let ul = $('<ul>')
                .attr('class', 'tag_area list-group col-12');

            // s'il y en a pas affiche le tag null "No tags"
            if (task.tags === null) {
                let li = $('<li>')
                    .attr('id', 'tag-null').attr('class', 'tag btn btn-outline-secondary mr-2 mb-2')
                    .append($('<span>').attr('class', 'text-warning').html('&#9888;'))
                    .append($('<span>').text(' No tags'));
                ul.append(li);
            }
            // sinon on les affiche
            else {
                $.map(task.tags, (tag) => {
                    let li = $('<li>')
                        .attr('id', 'tag-' + tag.id).attr('class', 'tag btn btn-outline-secondary mr-2 mb-2')
                        .append($('<span>').attr('class', 'mr-2').text(tag.name))
                        .append($('<span>').attr('class', 'cross_tag').html('&times;').on('click', { 'id_task': task.id, 'id_tag': tag.id }, TaskManager.Task.deleteTag));
                    ul.append(li);
                });
            }


            // button permettant d'ajouter un tag a une tache
            let button_add_tag = $('<button>')
                .attr('class', 'btn btn-secondary btn_add mb-2').html('&#10010;')
                .on('click', { 'id_task': task.id }, TaskManager.Tag.displayAddTag);


            // ajoute le bouton permettant d'ajouter des tags en fin de zone de tags
            ul.append(button_add_tag);

            return ul;
        }

        static displayAddTag(task_id) {
            // MODAL HEADER de l'ajout de tag ///////////////////////////
            let title_h5 = $('<h5>')
                .attr('class', 'modal-title').text('Add tag');

            let btn_close = $('<button>')
                .attr('class', 'close').html('&times;').attr('data-dismiss', 'modal').attr('aria-label', 'Close')
                .append($('<span>').attr('aria-hidden', 'true'));

            let div_modal_header = $('<div>')
                .attr('class', 'modal-header')
                .append(title_h5).append(btn_close);


            // MODAL BODY de l'ajout de tag /////////////////////////////
            let tags = $('<p>').append($('<h6>').text('Select tags or enter a new one:'));
            TaskManager.allTags.forEach((element) => {
                tags.append($('<span>').attr('class', 'badge btn badge-secondary mr-2')
                    .text(element.name).on('click', TaskManager.Tag.selectTag));
            });
            tags.append($('<hr>'));

            let span = $('<span>')
                .attr('class', 'input-group-addon').attr('id', 'basic-addon-name').text('Name');

            let input = $('<input>')
                .attr('type', 'text').attr('id', 'task_tag').attr('class', 'form-control').attr('placeholder', 'Name')
                .attr('aria-label', 'Name').attr('aria-describedby', 'basic-addon-name');

            let div_input = $('<div>')
                .attr('class', 'input-group')
                .append(span).append(input);

            let div_modal_body = $('<div>')
                .attr('class', 'modal-body')
                .append(tags)
                .append(div_input);


            // MODAL FOOTER de l'ajout de tag ///////////////////////////
            let btn_close2 = $('<button>')
                .attr('class', 'cancel btn btn-secondary').attr('data-dismiss', 'modal').text('Cancel');

            let btn_save = $('<button>')
                .attr('class', 'submit btn btn-primary').text('Submit')
                .on('click', { 'id_task': task_id.data['id_task'] }, TaskManager.Task.addTag);

            let div_modal_footer = $('<div>')
                .attr('class', 'modal-footer')
                .append(btn_close2).append(btn_save);


            // MODAL CONTENT de l'ajout de tag //////////////////////////
            let div_modal_content = $('<div>')
                .attr('class', 'modal-content')
                .append(div_modal_header).append(div_modal_body).append(div_modal_footer);


            // MODAL DIALOG de l'ajout de tag ///////////////////////////
            let div_modal_dialog = $('<div>')
                .attr('class', 'modal-dialog').attr('role', 'document')
                .append(div_modal_content);


            // MODAL de l'ajout de tag //////////////////////////////////
            let div_modal = $('<div>')
                .attr('class', 'modal').attr('tabindex', '-1').attr('role', 'dialog').css('display', 'block').css('background-color', 'rgba(0, 0, 0, 0.7)')
                .append(div_modal_dialog);


            $('.container').append(div_modal);

            $('.close').on('click', TaskManager.closeModal);
            $('.cancel').on('click', TaskManager.closeModal);
        }
    };

    // tableau qui contiendra toutes les taches
    module.allTasks = [];
    // tableau qui contiendra tous les tags
    module.allTags = [];

    module.displayTasks = (ul_id) => {
        // ul_id correspond a l'id de la liste qui contiendra toutes les taches dans le fichier HTML
        $.map(localStorage, (task) => {
            task = JSON.parse(task);
            let t = new TaskManager.Task(task['id'], task['name'], task['description'], task['duration'], task['tags']);
            TaskManager.addNewTask(location.href + 'api/server/tasks/addtask', JSON.stringify(t)).done((data) => {
                //console.log(data);
            });
        });

        // charge les donnees si la requete Ajax peut etre executee
        TaskManager.loadTasks(location.href + 'api/server/tasks').done((data) => {
            $.map(data, (task) => {
                let t = new TaskManager.Task(task['id'], task['name'], task['description'], task['duration'], task['tags']);
                TaskManager.allTasks.push(t);
                $.map(t.tags, (tag) => {
                    TaskManager.allTags.push(tag);
                });
                localStorage.setItem((t.id - 1), JSON.stringify(t));
                $(ul_id).append(t.getTask());
            });
        })
            // sinon charge les donnees depuis le tableau de sauvegarde locale
            .fail(() => {
                $.map(localStorage, (task) => {
                    task = JSON.parse(task);
                    let t = new TaskManager.Task(task['id'], task['name'], task['description'], task['duration'], task['tags']);
                    TaskManager.allTasks.push(t);
                    $.map(t.tags, (tag) => {
                        TaskManager.allTags.push(tag);
                    });
                    $(ul_id).append(t.getTask());
                });
            });

        $(ul_id).prepend(
            $('<li>').attr('class', 'list-group-item')
                .append($('<button>')
                    .attr('class', 'btn btn-primary btn-sm')
                    .text('Add new task')
                    .on('click', TaskManager.Task.displayAddTask))
        );
    };

    module.closeModal = () => {
        // supprime la fenetre modal d'ajout de tache ou de tag
        $('.modal').remove();
    };

    module.checkValue = (input) => {
        // methode qui remplace les tirets des champs des heures et des minutes
        // pour empecher d'avoir des nombres negatifs
        // et leur donne la valeur 1 s'ils sont vides
        input.val(input.val().replace('-', ''));
        if (input.val() === '') {
            input.val(1);
        }
    };

    // requete Ajax permettant de charger les donnees
    module.loadTasks = (uri) => {
        let pr = $.get(uri);
        pr.done();
        pr.fail((jqXHR, status, error) => {
            console.log('Call to Ajax failed : ' + status + ' ' + error);
        });

        return pr;
    };

    // requete Ajax permettant d'ajouter une nouvelle tache
    module.addNewTask = (uri, newTask) => {
        let pr = $.post(uri, JSON.parse(newTask));
        pr.done();
        pr.fail((jqXHR, status, error) => {
            console.log('Call to Ajax failed : ' + status + ' ' + error);
        });

        return pr;
    };

    // requete Ajax permettant d'ajouter un ou des tags a une tache
    module.addTagToTask = (uri, task) => {
        let pr = $.post(uri, task);
        pr.done();
        pr.fail((jqXHR, status, error) => {
            console.log('Call to Ajax failed : ' + status + ' ' + error);
        });

        return pr;
    };

    // requete Ajax permettant de supprimer une tache ou un tag
    module.deleteData = (uri) => {
        let pr = $.ajax(uri, {
            type: 'DELETE',
            context: this,
            xhrFields: { withCredentials: true }
        });
        pr.done();
        pr.fail((jqXHR, status, error) => {
            console.log('Call to Ajax failed : ' + status + ' ' + error);
        });

        return pr;
    };

    return module;
})();


// document ready
$(() => {
    TaskManager.displayTasks('#tasks_list');
});

$(window).resize(() => {
    $('.details_hidden').hide();
});