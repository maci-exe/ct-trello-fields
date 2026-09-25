window.TrelloPowerUp.initialize({

    'card-badges': function (t) {

        return Promise.all([
            t.get('card', 'shared', 'characterData', {}),
            t.get('card', 'shared', 'rank', '')
        ]).then(function (values) {

            var data = values[0] || {};
            var oldRank = values[1];

            // Übergang von unserer alten Testversion
            if (!data.rank && oldRank) {
                data.rank = oldRank;
            }

            var badges = [];

            if (data.unit) {
                badges.push({
                    text: 'Untereinheit: ' + data.unit,
                    color: 'light-gray'
                });
            }

            if (data.rank) {
                badges.push({
                    text: 'Rang: ' + data.rank,
                    color: 'green'
                });
            }

            if (data.position) {
                badges.push({
                    text: 'Position: ' + data.position,
                    color: 'light-gray'
                });
            }

            if (data.adjutant) {
                badges.push({
                    text: 'Adjutant: ' + data.adjutant,
                    color: 'light-gray'
                });
            }

            if (data.promotion) {
                badges.push({
                    text: 'Letzte Beförderung: ' + formatDate(data.promotion),
                    color: 'light-gray'
                });
            }

            if (data.testUntil) {
                badges.push({
                    text: 'Testzeit: ' + formatDate(data.testUntil),
                    color: 'light-gray'
                });
            }

            if (data.ctId) {
                badges.push({
                    text: 'ID: ' + data.ctId,
                    color: 'light-gray'
                });
            }

            return badges;
        });
    },


    'card-buttons': function () {

        return [{
            icon: './icon.svg',
            text: 'CT-Daten bearbeiten',
            condition: 'edit',

            callback: function (t) {

                return t.modal({
                    title: 'CT-Daten bearbeiten',
                    url: './edit.html',
                    height: 650,
                    fullscreen: false
                });

            }
        }];
    }

});


function formatDate(dateString) {

    if (!dateString) {
        return '';
    }

    var parts = dateString.split('-');

    if (parts.length !== 3) {
        return dateString;
    }

    return parts[2] + '.' + parts[1] + '.' + parts[0];
}
