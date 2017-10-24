class Task {
  constructor(name, descr, time, tags=undefined) {
    this.name = name;
    this.description = descr;
    this.duree = time;
    this.tags = tags;
  }

  getTask() {
    let html = ' <li class="list-group-item">'
      + '<h3>' + this.name + '</h3>'
      + '<p>' + this.description + '</p>'
      + '<p>Durée: ' + this.duree + '</p>';

    if (this.tags === undefined) {
      html += '<p class="card-text"><i>Tags indisponibles</i></p>'
    }
    else {
      html += '<p class="card-text">' + this.tags + '</p>';
    }
    html += '</li>';

    html = '<li class="list-group-item">' +
        '<span class="h5">' + this.name + '</span>' +
        '<span class="ml-5">' + this.description + '</span>' +
        '<span class="ml-5">' + this.duree + '</span>';

      if (this.tags === undefined) {
          html += '<span class="float-right"><i>Tags indisponibles</i></span>'
      }
      else {
          html += '<span class="float-right">' + this.tags + '</span>';
      }

    html += '</li>';

    return html;
  }
}
