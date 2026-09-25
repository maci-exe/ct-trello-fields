var t = window.TrelloPowerUp.iframe();

var form = document.getElementById('ctForm');
var rankSelect = document.getElementById('rank');


// Speichern
form.addEventListener('submit', function (event) {

    event.preventDefault();

    return t.set(
        'card',
        'shared',
        'rank',
        rankSelect.value
    ).then(function () {

        return t.closePopup();

    });

});


// Bereits gespeicherten Rang laden
t.render(function () {

    return t.get(
        'card',
        'shared',
        'rank',
        ''
    ).then(function (rank) {

        if (rank) {
            rankSelect.value = rank;
        }

        return t.sizeTo('#ctForm');

    });

});
