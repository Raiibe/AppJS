window.TaskManager = (() => {
    let module = {};

    module.Task = class Task {
        constructor(obj) {
            this.object = obj;
        }

        getTask(task_id) {
            // span affichant le nom de la tache
            let span = $('<span>')
                .attr('class', 'h5').attr('style', 'color: ' + this.getPriority() + ';').text(this.object['name']);


            // div contenant la description et la duree de la tache
            let div = $('<div>')
                .attr('class', 'details col-12 mb-2')
                .append($('<span>').attr('class', 'descr').text(this.object['description']))
                .append($('<span>').attr('class', 'badge badge-primary float-right')
                    .attr('style', 'background-color: ' + this.getPriority() + ';')
                    .text(this.convertTime()));


            // button cache permettant d'afficher les details sur un viewport tablette ou mobile
            let button_details = $('<button>')
                .attr('class', 'btn btn-primary btn-sm btn_details mt-2 mb-2').text('Description')
                .click(event => $(event.target.nextElementSibling).toggle('slow'));


            // div cachee contenant la description et la duree de la tache pour viewport tablette ou mobile
            let div_hidden = $('<div>')
                .attr('class', 'details_hidden col-12')
                .append($('<span>').attr('class', 'descr').text(this.object['description']))
                .append($('<span>').attr('class', 'badge badge-primary float-right')
                    .css('background-color', this.getPriority())
                    .text(this.convertTime()));


            // button permettant d'afficher les differents tags de la tache
            let button_tags = $('<button>')
                .attr('class', 'btn btn-primary btn-sm btn_tags mb-2').text('Tags')
                .click(event => $(event.target.nextElementSibling).toggle('slow'));


            // ul contenant la zone des tags de la tache
            let ul_tags = TaskManager.Tag.displayTags(this.object, task_id);

            // button permettant de supprimer la tache
            let button_delete_task = $('<span>')
                .attr('class', 'cross float-right fa fa-times')
                .css('color', 'red')
                .on('click', { 'id_task': task_id }, TaskManager.Task.deleteTask);


            // li contenant la tache avec toutes ses caracteristiques
            return $('<li>')
                .attr('id', 'task-' + task_id)
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
            let minutes = this.object['duration'] % 60;
            let hours = (this.object['duration'] - minutes) / 60;
            let string = '';

            if (hours !== 0 && minutes !== 0)
                string += hours + ' hours et ' + minutes + ' minutes';
            else if (hours === 0)
                string += minutes + ' minutes';
            else if (minutes === 0)
                string += hours + ' hours';

            return string;
        }

        getPriority() {
            if (this.object['duration'] <= 1440) { // correspond à 1 jour en minutes
                return 'red';
            }
            else if (this.object['duration'] <= 2880) { // correspond à 2 jours en minutes
                return 'orange';
            }
            else {
                return 'green';
            }
        }

        static addTask() {
            TaskManager.addNewTask(location.href + 'api/server/tasks/addtask').done((data) => {
                $.map(JSON.parse(data), (task, task_id) => {
                    TaskManager.closeModal();
                    let t = new TaskManager.Task(task);
                    $('#tasks_list').append(t.getTask(task_id));
                });
            });
        }

        static deleteTask(task_id) {
            TaskManager.deleteDataT(location.href + 'api/server/tasks/' + task_id.data['id_task']).done((data) => {
                $('#task-' + data['id_task']).remove();
                let tasks = $('#tasks_list');
                if (tasks.length === 0) {
                    // message si pas de tache
                }
            });
        }

        static addTag(task_id) {
            TaskManager.addTagToTask(task_id.data['id_task'], location.href + 'api/server/tasks/' + task_id.data['id_task'] + '/addtag').done((data) => {
                $.map(JSON.parse(data), (task, task_id) => {
                    TaskManager.closeModal();
                    let tags = Object.values(task['Tags']);
                    let tag = new TaskManager.Tag(tags[tags.length - 1]['name']);
                    if (!TaskManager.tags.includes(tag.getName())) {
                        TaskManager.tags.push(tag.getName());
                    }

                    let li = $('<li>')
                        .attr('id', 'tag-' + tags.length).attr('class', 'tag btn btn-outline-secondary mr-2 mb-2')
                        .append($('<span>').attr('class', 'mr-2').text(tag.getName()))
                        .append($('<span>').attr('class', 'cross fa fa-times').on('click', { 'id_task': task_id, 'id_tag': tags.length }, TaskManager.Task.deleteTag));

                    $('#task-' + task_id + ' #tag-null').remove();
                    $('#task-' + task_id + ' ul.tag_area .btn_add').before(li);
                });
            });
        }

        static deleteTag(object_ids) {
            TaskManager.deleteDataT(location.href + 'api/server/tasks/' + object_ids.data['id_task'] + '/tags/' + object_ids.data['id_tag']).done((data) => {
                $('#task-' + data['id_task'] + ' #tag-' + data['id_tag']).remove();
                let tags = $('#task-' + data['id_task'] + ' [id^="tag-"]');
                if (tags.length === 0) {
                    let li = $('<li>')
                        .attr('id', 'tag-null').attr('class', 'tag btn btn-outline-secondary mr-2 mb-2')
                        .append($('<span>').attr('class', 'text-warning fa fa-exclamation-triangle'))
                        .append($('<span>').text(' No tags'));
                    $('#task-' + data['id_task'] + ' ul.tag_area .btn_add').before(li);
                }
            });
        }

        static displayAddTask() {
            // MODAL HEADER ///////////////////////////
            let title_h5 = $('<h5>')
                .attr('class', 'modal-title').text('Add task');

            let btn_close = $('<button>')
                .attr('class', 'close fa fa-times').attr('data-dismiss', 'modal').attr('aria-label', 'Close')
                .append($('<span>').attr('aria-hidden', 'true'));

            let div_modal_header = $('<div>')
                .attr('class', 'modal-header')
                .append(title_h5).append(btn_close);


            // MODAL BODY /////////////////////////////
            let tags = $('<p>').append($('<h6>').text('Select tags or enter a new one:'));
            TaskManager.tags.forEach((element) => {
                tags.append($('<span>').attr('class', 'badge btn badge-secondary mr-2')
                    .text(element).on('click', TaskManager.Tag.selectTag));
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

            let input_task_duration = $('<input>')
                .attr('size', '16').attr('id', 'task_duration').attr('class', 'form-control').attr('type', 'text').attr('value', '')
                .attr('name', 'duration').attr('placeholder', 'Duration').attr('readonly', true).attr('style', 'background-color: white;')
                .datetimepicker({
                    format: "dd MM yyyy - hh:ii",
                    pickerPosition: "bottom-left",
                    zIndex: "5000"
                });

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
                .append(input_task_duration);

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
                .attr('class', 'modal').attr('tabindex', '-1').attr('role', 'dialog').attr('style', 'display: block; background-color: rgba(0, 0, 0, 0.7)')
                .append(div_modal_dialog);


            $('.container').append(div_modal);

            $('.close').on('click', TaskManager.closeModal);
            $('.cancel').on('click', TaskManager.closeModal);
        }
    };

    module.Tag = class Tag {
        constructor(name) {
            this.name = name;
        }

        getName() {
            return this.name;
        }

        static selectTag() {
            $(this).toggleClass('tag_selected');
        }

        static displayTags(task, task_id) {
            let ul = $('<ul>')
                .attr('class', 'tag_area list-group col-12');

            // s'il y en a pas affiche 'No tags'
            if (task['Tags'] === null) {
                let li = $('<li>')
                    .attr('id', 'tag-null').attr('class', 'tag btn btn-outline-secondary mr-2 mb-2')
                    .append($('<span>').attr('class', 'text-warning fa fa-exclamation-triangle'))
                    .append($('<span>').text(' No tags'));
                ul.append(li);
            }
            // sinon on les affiche
            else {
                $.map(task['Tags'], (tag, key) => {
                    let t = new TaskManager.Tag(tag['name']);
                    if (!TaskManager.tags.includes(t.getName())) {
                        TaskManager.tags.push(t.getName());
                    }

                    let li = $('<li>')
                        .attr('id', 'tag-' + key).attr('class', 'tag btn btn-outline-secondary mr-2 mb-2')
                        .append($('<span>').attr('class', 'mr-2').text(tag['name']))
                        .append($('<span>').attr('class', 'cross fa fa-times').on('click', { 'id_task': task_id, 'id_tag': key }, TaskManager.Task.deleteTag));
                    ul.append(li);
                });
            }


            // button permettant d'ajouter un tag a une tache
            let button_add_tag = $('<button>')
                .attr('class', 'btn btn-secondary fa fa-plus btn_add mb-2')
                .on('click', { 'id_task': task_id }, TaskManager.Tag.displayAddTag);


            // ajoute le bouton permettant d'ajouter des tags en fin de zone de tags
            ul.append(button_add_tag);

            return ul;
        }

        static displayAddTag(task_id) {
            // MODAL HEADER ///////////////////////////
            let title_h5 = $('<h5>')
                .attr('class', 'modal-title').text('Add tag');

            let btn_close = $('<button>')
                .attr('class', 'close fa fa-times').attr('data-dismiss', 'modal').attr('aria-label', 'Close')
                .append($('<span>').attr('aria-hidden', 'true'));

            let div_modal_header = $('<div>')
                .attr('class', 'modal-header')
                .append(title_h5).append(btn_close);


            // MODAL BODY /////////////////////////////
            let tags = $('<p>').append($('<h6>').text('Select tags or enter a new one:'));
            TaskManager.tags.forEach((element) => {
                tags.append($('<span>').attr('class', 'badge btn badge-secondary mr-2')
                    .text(element).on('click', TaskManager.Tag.selectTag));
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
                .attr('class', 'modal').attr('tabindex', '-1').attr('role', 'dialog').attr('style', 'display: block; background-color: rgba(0, 0, 0, 0.7)')
                .append(div_modal_dialog);


            $('.container').append(div_modal);

            $('.close').on('click', TaskManager.closeModal);
            $('.cancel').on('click', TaskManager.closeModal);
        }
    };

    module.tags = [];

    module.displayTasks = (ul_id) => {
        TaskManager.loadTasks(location.href + 'api/server/tasks').done((data) => {
            $.map(data, (task, id) => {
                let t = new TaskManager.Task(task);
                $(ul_id).append(t.getTask(id));
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

    module.loadTasks = (uri) => {
        let pr = $.get(uri);
        pr.done();
        pr.fail((jqXHR, status, error) => {
            alert('Call to Ajax failed : ' + status + ' ' + error);
        });

        return pr;
    };

    module.addNewTask = (uri) => {
        let tasks = $('[id^="task-"]');
        let last_task_id = 0;

        if (tasks.length > 0) {
            last_task_id = tasks[tasks.length - 1].id.split('-')[1];
        }

        let tags = '';

        let elements = $('.tag_selected');
        for (let i = 0; i < elements.length; i++) {
            tags += elements[i].innerText + '/';
        }
        tags += $('#task_tag').val();

        let pr = $.ajax(uri,{
            type: 'POST',
            context: this,
            dataType: 'html',
            xhrFields: { withCredentials: true },
            data: 'last_task_id=' + last_task_id + '&name=' + $('#task_name').val() + '&description=' + $('#task_descr').val() + '&duration=' + $('#task_duration') + '&tags=' + tags
        });
        pr.done();
        pr.fail((jqXHR, status, error) => {
            alert('Call to Ajax failed : ' + status + ' ' + error);
        });

        return pr;
    };

    module.addTagToTask = (task_id, uri) => {
        let tagsExits = $('#task-' + task_id + ' [id^="tag-"]');
        let last_tag_id = 0;

        if (tagsExits.length > 0) {
            last_tag_id = tagsExits[tagsExits.length - 1].id.split('-')[1];
        }

        let tags = '';

        let elements = $('.tag_selected');
        for (let i = 0; i < elements.length; i++) {
            tags += elements[i].innerText + '/';
        }
        tags += $('#task_tag').val();

        let pr = $.ajax(uri,{
            type: 'POST',
            context: this,
            dataType: 'html',
            xhrFields: { withCredentials: true },
            data: 'last_tag_id=' + last_tag_id + '&tags=' + tags
        });
        pr.done();
        pr.fail((jqXHR, status, error) => {
            alert('Call to Ajax failed : ' + status + ' ' + error);
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
            alert('Call to Ajax failed : ' + status + ' ' + error);
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