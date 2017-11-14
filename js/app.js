window.TaskManager = (() => {
    let module = {};

    module.Task = class Task {
        constructor(name, descr, time, tags=undefined) {
            this.name = name;
            this.description = descr;
            this.duration = time; // en minutes
            this.tags = tags;
        }

        getTask() {
            // span affichant le nom de la tache
            let span = $('<span>')
                .attr('class', 'h5').attr('style', 'color: ' + this.getImportance() + ';').text(this.name);


            // div contenant la description et la duree de la tache
            let div = $('<div>')
                .attr('class', 'details col-12 mb-2')
                .append($('<span>').attr('class', 'descr').text(this.description))
                .append($('<span>').attr('class', 'badge badge-primary float-right')
                    .attr('style', 'background-color: ' + this.getImportance() + ';')
                    .text(this.convertTime()));


            // button cache permettant d'afficher les details sur un viewport tablette ou mobile
            let button_details = $('<button>')
                .attr('class', 'btn btn-primary btn-sm btn_details mt-2 mb-2').text('Description');


            // div cachee contenant la description et la duree de la tache pour viewport tablette ou mobile
            let div_hidden = $('<div>')
                .attr('class', 'details_hidden col-12')
                .append($('<span>').attr('class', 'descr').text(this.description))
                .append($('<span>').attr('class', 'badge badge-primary float-right').text(this.convertTime()));


            // button permettant d'afficher les differents tags de la tache
            let button_tags = $('<button>')
                .attr('class', 'btn btn-primary btn-sm btn_tags mb-2').text('Tags');


            // ul contenant la zone des tags de la tache
            let ul = $('<ul>')
                .attr('class', 'tag_area list-group col-12');

            // s'il y en a pas affiche 'No tags'
            if (this.tags === undefined) {
                let li = $('<li>')
                    .attr('id', 'tag-undefined').attr('class', 'btn btn-outline-secondary mr-2')
                    .append($('<span>').attr('class', 'text-warning fa fa-exclamation-triangle'))
                    .append($('<span>').text(' No tags'));
                ul.append(li);
            }
            // sinon on les affiche
            else {
                for (let i = 0; i < this.tags.length; i++) {
                    let li = $('<li>')
                        .attr('id', 'tag-' + (i+1)).attr('class', 'btn btn-outline-secondary mr-2')
                        .append($('<span>').attr('class', 'mr-3').text(this.tags[i].getName()))
                        .append($('<span>').attr('class', 'cross fa fa-times'));
                    ul.append(li);
                }
            }


            // button permettant d'ajouter un tag a une tache
            let button_add_tag = $('<button>')
                .attr('class', 'btn btn-secondary fa fa-plus btn_add')
                .on('click', Task.addTag);


            // ajoute le bouton permettant d'ajouter des tags en fin de zone de tags
            ul.append(button_add_tag);


            // li contenant la tache avec toutes ses caracteristiques
            return $('<li>')
                .attr('class', 'list-group-item')
                .append(span)
                .append(div)
                .append(button_details)
                .append(div_hidden)
                .append(button_tags)
                .append(ul);
        }

        convertTime() {
            let minutes = this.duration % 60;
            let hours = (this.duration - minutes) / 60;
            let string = '';

            if (hours !== 0 && minutes !== 0)
                string += hours + ' hours et ' + minutes + ' minutes';
            else if (hours === 0)
                string += minutes + ' minutes';
            else if (minutes === 0)
                string += hours + ' hours';

            return string;
        }

        getImportance() {
            if (this.duration <= 1440) { // correspond à 1 jour en minutes
                return 'red';
            }
            else if (this.duration <= 2880) { // correspond à 2 jours en minutes
                return 'orange';
            }
            else {
                return 'green';
            }
        }

        static addTag() {
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
            let span = $('<span>')
                .attr('class', 'input-group-addon').attr('id', 'basic-addon-name').text('Name');

            let input = $('<input>')
                .attr('type', 'text').attr('class', 'form-control').attr('placeholder', 'Name')
                .attr('aria-label', 'Name').attr('aria-describedby', 'basic-addon-name');

            let div_input = $('<div>')
                .attr('class', 'input-group')
                .append(span).append(input);

            let div_modal_body = $('<div>')
                .attr('class', 'modal-body')
                .append(div_input);


            // MODAL FOOTER ///////////////////////////
            let btn_close2 = $('<button>')
                .attr('class', 'cancel btn btn-secondary').attr('data-dismiss', 'modal').text('Cancel');

            let btn_save = $('<button>')
                .attr('class', 'btn btn-primary').text('Submit');

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
    };

    module.display_tasks = (ul_id) => {
        let t1 = new TaskManager.Task('Test', 'Ceci est une tache test igfdskfb sysf sdfuh sfgu scxbcb fgfisqg isgugs dqgsufdsfoi y oyfyosyfudhfuhufhiusfhfsiugh', 1500);
        let t2 = new TaskManager.Task('Vaisselle', 'Faire la vaisselle', 2, [new TaskManager.Tag('matériel'), new TaskManager.Tag('test'), new TaskManager.Tag('nourriture'), new TaskManager.Tag('tsss')]);
        let t3 = new TaskManager.Task('Poubelles', 'Sortir les poubelles', 5, [new TaskManager.Tag('déchets')]);

        $(ul_id).append(t1.getTask()).append(t2.getTask()).append(t3.getTask());
        $(ul_id).append(
            $('<li>').attr('class', 'list-group-item')
                .append($('<button>').attr('class', 'btn btn-primary btn-sm').text('Add new task'))
        );

        $('.btn_tags').click(event => $(event.target.nextElementSibling).toggle('slow'));
        $('.btn_details').click(event => $(event.target.nextElementSibling).toggle('slow'));
    };

    module.closeModal = () => {
        $('.modal').remove();
    };

    return module;
})();


// document ready
$(() => {
   TaskManager.display_tasks('#tasks_list');
});

$(window).resize(() => {
    $('.details_hidden').hide();
});