class Task {
    constructor(name, descr, time, tags=undefined) {
        this.name = name;
        this.description = descr;
        this.duration = time; // en minutes
        this.tags = tags;
    }

    getTask() {
        // span affichant le nom de la tache
        let span = document.createElement('span');
        $(span).attr('class', 'h5').attr('style', 'color: ' + this.getImportance() + ';').text(this.name);


        // div contenant la description et la duree de la tache
        let div = document.createElement('div');
        $(div).attr('class', 'details col-12 mb-2')
            .append($(document.createElement('span')).attr('class', 'descr').text(this.description))
            .append($(document.createElement('span')).attr('class', 'badge badge-primary float-right')
                .attr('style', 'background-color: ' + this.getImportance() + ';')
                .text(this.convertTime()));


        // button cache permettant d'afficher les details sur un viewport tablette ou mobile
        let button_details = document.createElement('button');
        $(button_details).attr('class', 'btn btn-primary btn-sm btn_details mt-2 mb-2').text('Description');


        // div cachee contenant la description et la duree de la tache pour viewport tablette ou mobile
        let div_hidden = document.createElement('div');
        $(div_hidden).attr('class', 'details_hidden col-12')
            .append($(document.createElement('span')).attr('class', 'descr').text(this.description))
            .append($(document.createElement('span')).attr('class', 'badge badge-primary float-right').text(this.convertTime()));


        // button permettant d'afficher les differents tags de la tache
        let button_tags = document.createElement('button');
        $(button_tags).attr('class', 'btn btn-primary btn-sm btn_tags mb-2').text('Tags');


        // li contenant les tags de la tache s'il y en a
        let li_tags = '';


        // s'il y en a pas affiche 'No tags'
        if (this.tags === undefined) {
            let li = document.createElement('li');
            $(li).attr('id', 'tag-undefined').attr('class', 'badge badge-secondary mr-2')
                .append($(document.createElement('span')).attr('class', 'text-warning fa fa-exclamation-triangle'))
                .append($(document.createElement('span')).text(' No tags'));
            li_tags += li.outerHTML;
        }
        // sinon on les affiche
        else {
            for (let i = 0; i < this.tags.length; i++) {
                let li = document.createElement('li');
                $(li).attr('id', 'tag-' + (i+1)).attr('class', 'badge badge-secondary mr-2')
                    .append($(document.createElement('span')).attr('class', 'mr-3').text(this.tags[i].getName()))
                    .append($(document.createElement('span')).attr('class', 'cross fa fa-times'));
                li_tags += li.outerHTML;
            }
        }


        // button permettant d'ajouter un tag a une tache
        let button_add_tag = document.createElement('button');
        $(button_add_tag).attr('class', 'btn btn-outline-secondary fa fa-plus btn_add');
        $('.btn_add').on('click', Task.addTag);


        // ajoute le bouton permettant d'ajouter des tags en fin de zone de tags
        li_tags += button_add_tag.outerHTML;


        // ul contenant la zone des tags de la tache
        let ul = document.createElement('ul');
        $(ul).attr('class', 'tag_area list-group col-12')
            .append(li_tags);


        // li contenant la tache avec toutes ses caracteristiques
        let li = document.createElement('li');
        $(li).attr('class', 'list-group-item')
            .append(span)
            .append(div)
            .append(button_details)
            .append(div_hidden)
            .append(button_tags)
            .append(ul);

        return li.outerHTML;
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
    }
}
