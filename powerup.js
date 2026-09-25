window.TrelloPowerUp.initialize({

    // Rang auf der Vorderseite der Karte anzeigen
    'card-badges': function (t, opts) {

        return t.get('card', 'shared', 'rank', '')
            .then(function (rank) {

                if (!rank) {
                    return [];
                }

                return [{
                    text: 'Rang: ' + rank,
                    color: 'green'
                }];
            });
    },

    // Bearbeiten-Button auf der geöffneten Karte
    'card-buttons': function (t, opts) {

        return [{
            icon: './icon.svg',
            text: 'CT-Daten bearbeiten',
            condition: 'edit',

            callback: function (t) {
                return t.popup({
                    title: 'CT-Daten bearbeiten',
                    url: './edit.html',
                    height: 650,
                    fullscreen: false
                });
            }
        }];
    }

});
