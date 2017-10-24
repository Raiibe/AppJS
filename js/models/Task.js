class Task {
  constructor(name, descr, time, tags=undefined) {
    this.name = name;
    this.description = descr;
    this.time = time; // en minutes
    this.tags = tags;
  }

  getTask() {
    let html = '<li class="list-group-item">' +
        '<span class="h5" style="color: ' + this.getImportance() + ';">' + this.name + '</span>' +
        '<div class="details col-12 mb-2">' +
        '<span class="descr">' + this.description + '</span>' +
        '<span class="badge badge-secondary float-right">' + this.convertTime() + '</span>' +
        '</div>' +
        '<button class="btn btn-primary btn_details mt-2 mb-2">Details</button>' +
        '<div class="details_hidden col-12">' +
        '<span class="descr">' + this.description + '</span>' +
        '<span class="badge badge-secondary float-right">' + this.convertTime() + '</span>' +
        '</div>';

      if (this.tags === undefined) {
          html += '<button class="btn btn-primary btn_tags mb-2">Tags</span></button>' +
              '<div class="tag_area col-12">' +
              '<span class="ml-2">Unavailable tags</span>';
      }
      else {
          html += '<button class="btn btn-primary btn_tags mb-2">Tags</button>' +
              '<div class="tag_area col-12">' +
              '<span class="h5">Tags :</span>';

          for (let i = 0; i < this.tags.length; i++) {
            html += '<span class="ml-2">' + this.tags[i].getName() + '</span>';
          }

          html += '</div>';
      }

    html += '</li>';

    return html;
  }

  convertTime() {
    let minutes = this.time % 60;
    let hours = (this.time - minutes) / 60;
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
    if (this.time <= 1440) { // correspond à 1 jour en minutes
      return 'red';
    }
    else if (this.time <= 2880) { // correspond à 2 jours en minutes
      return 'orange';
    }
    else {
      return 'green';
    }
  }
}
