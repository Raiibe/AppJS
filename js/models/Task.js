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
            .append($(document.createElement('span')).attr('class', 'badge badge-primary float-right').text(this.convertTime()));

        // button cache permettant d'afficher les details sur un viewport tablette ou mobile
        let button_details = document.createElement('button');
        $(button_details).attr('class', 'btn btn-primary btn_details mt-2 mb-2').text('Details');

        // div cachee contenant la description et la duree de la tache pour viewport tablette ou mobile
        let div_hidden = document.createElement('div');
        $(div_hidden).attr('class', 'details_hidden col-12')
            .append($(document.createElement('span')).attr('class', 'descr').text(this.description))
            .append($(document.createElement('span')).attr('class', 'badge badge-primary float-right').text(this.convertTime()));

        // button permettant d'afficher les differents tags de la tache
        let button_tags = document.createElement('button');
        $(button_tags).attr('class', 'btn btn-primary btn_tags mb-2').text('Tags');

        // li contenant les tags de la tache s'il y en a
        let li_tags = '';

        // s'il y en a pas affiche 'No tags'
        if (this.tags === undefined) {
            let li = document.createElement('li');
            $(li).attr('id', 'tag-undefined').attr('class', 'list-group-item')
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

        // ul contenant la zone des tags de la tache
        let ul = document.createElement('ul');
        $(ul).attr('class', 'tag_area list-group col-12')
            .append(li_tags);

        // li conteant la tache avec toutes ses caracteristiques
        let li = document.createElement('li');
        $(li).attr('class', 'list-group-item')
            .append(span)
            .append(div)
            .append(button_details)
            .append(div_hidden)
            .append(button_tags)
            .append(ul);

        /*html += '<div class="list-group-item">' +
            '<input class="form-control col-12" type="text" placeholder="Add a tag...">' +
            '<input class="btn btn-primary add col-2" value="Add"> ' +
            '</div>';*/

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
}
