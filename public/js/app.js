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


            // button cache permettant d'afficher les details sur un viewport tablette ou mobile
            let button_details = $('<button>')
                .attr('class', 'btn btn-primary btn-sm btn_details mt-2 mb-2').text('Description')
                .click(event => $(event.target.nextElementSibling).toggle('slow'));


            // div cachee contenant la description et la duree de la tache pour viewport tablette ou mobile
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
            if (this.duration <= (60*3)) { // correspond à 3 heures en minutes
                return 'red';
            }
            else if (this.duration <= (60*6)) { // correspond à 6 heures en minutes
                return 'orange';
            }
            else {
                return 'green';
            }
        }

        static addTask() {
            let tasks = $('[id^="task-"]');
            let last_task_id = 0;

            if (tasks.length > 0) {
                last_task_id = tasks[tasks.length - 1].id.split('-')[1];
            }

            let tags = null;
            let newTag = $('#task_tag').val();
            let elements = $('.tag_selected');

            if (elements.length > 0) {
                tags = '{';

                for (let i = 0; i < elements.length; i++) {
                    tags += '"' + (i + 1) + '":{"id":"' + (i + 1) + '","name":"' + elements[i].innerText + '"}';
                    if (i !== elements.length - 1) {
                        tags += ',';
                    }
                }

                if (newTag !== '') {
                    tags += ',"' + (elements.length + 1) + '":{"id":"' + (elements.length + 1) + '","name":"' + $('#task_tag').val() + '"}';
                }
                tags += '}';
            } else {
                if (newTag !== '') {
                    tags = '{"' + (elements.length + 1) + '":{"id":"' + (elements.length + 1) + '","name":"' + $('#task_tag').val() + '"}}';
                }
            }

            TaskManager.checkValue($('#duration_hour'));
            let duration_hour = $('#duration_hour').val();

            TaskManager.checkValue($('#duration_min'));
            let duration_min = $('#duration_min').val();

            let duration = parseInt(duration_hour) * 60 + parseInt(duration_min);
            if (duration === 0) {
                duration = 1;
            }
            let t = new TaskManager.Task((parseInt(last_task_id) + 1).toString(), $('#task_name').val(), $('#task_descr').val(), duration.toString(), JSON.parse(tags));
            TaskManager.tasks.push(t);
            $.map(t.tags, (tag) => {
                TaskManager.allTags.push(tag);
            });
            localStorage.setItem((t.id - 1), JSON.stringify(t));
            $('#tasks_list').append(t.getTask());

            TaskManager.addNewTask(location.href + 'api/server/tasks/addtask', JSON.stringify(t)).done((data) => {
                //console.log(data);
            });

            TaskManager.closeModal();
        }

        static deleteTask(task_id) {
            let task = $('#task-' + task_id.data['id_task']);
            delete TaskManager.tasks[task_id.data['id_task']];
            localStorage.removeItem(task_id.data['id_task']);
            task.remove();
            TaskManager.deleteDataT(location.href + 'api/server/tasks/' + task_id.data['id_task']).done((data) => {
                $('#task-' + data['id_task']).remove();
                let tasks = $('#tasks_list');
                if (tasks.length === 0) {
                    // message si pas de tache
                }
            });
        }

        static addTag(task_id) {
            let task = JSON.parse(localStorage[task_id.data['id_task'] - 1]);
            let tags = task.tags;

            let elements = $('.tag_selected');
            for (let i = 0; i < elements.length; i++) {
                let tag_id = 0;
                if (tags !== null) {
                    tag_id = Object.values(tags).length;
                } else {
                    tags = {};
                }

                tags[tag_id + 1] = { 'id': "" + (tag_id + 1) + "", 'name': elements[i].innerText };
                TaskManager.allTags.push(tags[tag_id + 1]);

                let li = $('<li>')
                    .attr('id', 'tag-' + (tag_id + 1)).attr('class', 'tag btn btn-outline-secondary mr-2 mb-2')
                    .append($('<span>').attr('class', 'mr-2').text(tags[tag_id + 1].name))
                    .append($('<span>').attr('class', 'cross_tag').html('&times;').on('click', { 'id_task': task_id.data['id_task'], 'id_tag': (tag_id + 1) }, TaskManager.Task.deleteTag));

                $('#task-' + task_id.data['id_task'] + ' #tag-null').remove();
                $('#task-' + task_id.data['id_task'] + ' ul.tag_area .btn_add').before(li);
            }
            let new_tag = $('#task_tag').val();
            if (new_tag !== '') {
                let tag_id = 0;
                if (tags !== null) {
                    tag_id = Object.values(tags).length;
                } else {
                    tags = {};
                }

                tags[tag_id + 1] = {'id': "" + (tag_id + 1) + "", 'name': new_tag };
                TaskManager.allTags.push(tags[tag_id + 1]);

                let li = $('<li>')
                    .attr('id', 'tag-' + (tag_id + 1)).attr('class', 'tag btn btn-outline-secondary mr-2 mb-2')
                    .append($('<span>').attr('class', 'mr-2').text(tags[tag_id + 1].name))
                    .append($('<span>').attr('class', 'cross_tag').html('&times;').on('click', { 'id_task': task_id.data['id_task'], 'id_tag': (tag_id + 1) }, TaskManager.Task.deleteTag));

                $('#task-' + task_id.data['id_task'] + ' #tag-null').remove();
                $('#task-' + task_id.data['id_task'] + ' ul.tag_area .btn_add').before(li);
            }

            let t = new TaskManager.Task(task.id, task.name, task.description, task.duration, tags);
            localStorage.setItem((t.id - 1), JSON.stringify(t));

            TaskManager.closeModal();

            TaskManager.addTagToTask(location.href + 'api/server/tasks/' + task_id.data['id_task'] + '/addtag', t).done((data) => {
                //console.log(data);
            });
        }

        static deleteTag(object_ids) {
            let tag = $('#task-' + object_ids.data['id_task'] + ' #tag-' + object_ids.data['id_tag']);
            delete TaskManager.tasks[object_ids.data['id_task'] - 1].tags[object_ids.data['id_tag'] - 1];
            localStorage.setItem((object_ids.data['id_task'] - 1), JSON.stringify(TaskManager.tasks[object_ids.data['id_task'] - 1]));
            tag.remove();
            let tags = $('#task-' + object_ids.data['id_task'] + ' [id^="tag-"]');
            if (tags.length === 0) {
                let li = $('<li>')
                    .attr('id', 'tag-null').attr('class', 'tag btn btn-outline-secondary mr-2 mb-2')
                    .append($('<span>').attr('class', 'text-warning').html('&#9888;'))
                    .append($('<span>').text(' No tags'));
                $('#task-' + object_ids.data['id_task'] + ' ul.tag_area .btn_add').before(li);
            }
            TaskManager.deleteDataT(location.href + 'api/server/tasks/' + object_ids.data['id_task'] + '/tags/' + object_ids.data['id_tag']).done((data) => {
                //console.log(data);
            });
        }

        static displayAddTask() {
            // MODAL HEADER ///////////////////////////
            let title_h5 = $('<h5>')
                .attr('class', 'modal-title').text('Add task');

            let btn_close = $('<button>')
                .attr('class', 'close').html('&times;').attr('data-dismiss', 'modal').attr('aria-label', 'Close')
                .append($('<span>').attr('aria-hidden', 'true'));

            let div_modal_header = $('<div>')
                .attr('class', 'modal-header')
                .append(title_h5).append(btn_close);


            // MODAL BODY /////////////////////////////
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


            // MODAL FOOTER ///////////////////////////
            let btn_close2 = $('<button>')
                .attr('class', 'cancel btn btn-secondary').attr('data-dismiss', 'modal').text('Cancel');

            let btn_save = $('<button>')
                .attr('class', 'submit btn btn-primary').text('Submit')
                .on('click', TaskManager.Task.addTask);

            let div_modal_footer = $('<div>')
                .attr('class', 'modal-footer')
                .append(btn_close2).append(btn_save);


            // MODAL CONTENT //////////////////////////
            let div_modal_content = $('<div>')
                .attr('class', 'modal-content')
                .append(div_modal_header).append(div_modal_body).append(div_modal_footer);


            // MODAL DIALOG ///////////////////////////
            let div_modal_dialog = $('<div>')
                .attr('class', 'modal-dialog').attr('role', 'document')
                .append(div_modal_content);


            // MODAL //////////////////////////////////
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

        getName() {
            return this.name;
        }

        static selectTag() {
            $(this).toggleClass('tag_selected');
        }

        static displayTags(task) {
            let ul = $('<ul>')
                .attr('class', 'tag_area list-group col-12');

            // s'il y en a pas affiche 'No tags'
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
            // MODAL HEADER ///////////////////////////
            let title_h5 = $('<h5>')
                .attr('class', 'modal-title').text('Add tag');

            let btn_close = $('<button>')
                .attr('class', 'close').html('&times;').attr('data-dismiss', 'modal').attr('aria-label', 'Close')
                .append($('<span>').attr('aria-hidden', 'true'));

            let div_modal_header = $('<div>')
                .attr('class', 'modal-header')
                .append(title_h5).append(btn_close);


            // MODAL BODY /////////////////////////////
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


            // MODAL FOOTER ///////////////////////////
            let btn_close2 = $('<button>')
                .attr('class', 'cancel btn btn-secondary').attr('data-dismiss', 'modal').text('Cancel');

            let btn_save = $('<button>')
                .attr('class', 'submit btn btn-primary').text('Submit')
                .on('click', { 'id_task': task_id.data['id_task'] }, TaskManager.Task.addTag);

            let div_modal_footer = $('<div>')
                .attr('class', 'modal-footer')
                .append(btn_close2).append(btn_save);


            // MODAL CONTENT //////////////////////////
            let div_modal_content = $('<div>')
                .attr('class', 'modal-content')
                .append(div_modal_header).append(div_modal_body).append(div_modal_footer);


            // MODAL DIALOG ///////////////////////////
            let div_modal_dialog = $('<div>')
                .attr('class', 'modal-dialog').attr('role', 'document')
                .append(div_modal_content);


            // MODAL //////////////////////////////////
            let div_modal = $('<div>')
                .attr('class', 'modal').attr('tabindex', '-1').attr('role', 'dialog').css('display', 'block').css('background-color', 'rgba(0, 0, 0, 0.7)')
                .append(div_modal_dialog);


            $('.container').append(div_modal);

            $('.close').on('click', TaskManager.closeModal);
            $('.cancel').on('click', TaskManager.closeModal);
        }
    };

    module.tasks = [];
    module.allTags = [];

    module.displayTasks = (ul_id) => {
        $.map(localStorage, (task) => {
            task = JSON.parse(task);
            let t = new TaskManager.Task(task['id'], task['name'], task['description'], task['duration'], task['tags']);
            TaskManager.addNewTask(location.href + 'api/server/tasks/addtask', JSON.stringify(t)).done((data) => {
                //console.log(data);
            });
        });

        TaskManager.loadTasks(location.href + 'api/server/tasks').done((data) => {
            $.map(data, (task) => {
                let t = new TaskManager.Task(task['id'], task['name'], task['description'], task['duration'], task['tags']);
                TaskManager.tasks.push(t);
                $.map(t.tags, (tag) => {
                    TaskManager.allTags.push(tag);
                });
                localStorage.setItem((t.id - 1), JSON.stringify(t));
                $(ul_id).append(t.getTask());
            });
        })
            .fail(() => {
                $.map(localStorage, (task) => {
                    task = JSON.parse(task);
                    let t = new TaskManager.Task(task['id'], task['name'], task['description'], task['duration'], task['tags']);
                    TaskManager.tasks.push(t);
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
        $('.modal').remove();
    };

    module.checkValue = (input) => {
        input.val(input.val().replace('-', ''));
        if (input.val() === '') {
            input.val(0);
        }
    };

    module.loadTasks = (uri) => {
        let pr = $.get(uri);
        pr.done();
        pr.fail((jqXHR, status, error) => {
            console.log('Call to Ajax failed : ' + status + ' ' + error);
        });

        return pr;
    };

    module.addNewTask = (uri, newTask) => {
        let pr = $.post(uri, JSON.parse(newTask));
        /*let pr = $.ajax(uri,{
            type: 'POST',
            context: this,
            dataType: 'html',
            xhrFields: { withCredentials: true },
            data: 'last_task_id=' + last_task_id + '&name=' + $('#task_name').val() + '&description=' + $('#task_descr').val() + '&duration=' + duration + '&tags=' + tags
        });*/
        pr.done();
        pr.fail((jqXHR, status, error) => {
            console.log('Call to Ajax failed : ' + status + ' ' + error);
        });

        return pr;
    };

    module.addTagToTask = (uri, task) => {
        let pr = $.post(uri, task);
        pr.done();
        pr.fail((jqXHR, status, error) => {
            console.log('Call to Ajax failed : ' + status + ' ' + error);
        });

        return pr;
    };

    module.deleteDataT = (uri) => {
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