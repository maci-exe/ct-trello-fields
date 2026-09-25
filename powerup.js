window.TrelloPowerUp.initialize({

    'card-badges': function (t) {

        return t.get('card', 'shared', 'characterData', {})
            .then(function (data) {

                data = data || {};
                var badges = [];

                if (data.unit) {
                    badges.push({
                        text: 'Untereinheit: ' + data.unit,
                        color: getUnitColor(data.unit)
                    });
                }

                if (data.rank) {
                    badges.push({
                        text: 'Rang: ' + data.rank,
                        color: getRankColor(data.rank)
                    });
                }

                if (data.position) {
                    badges.push({
                        text: 'Position: ' + data.position,
                        color: getPositionColor(data.position)
                    });
                }

                if (data.adjutant) {
                    badges.push({
                        text: 'Adjutant: ' + data.adjutant,
                        color: 'green'
                    });
                }

                if (data.promotion) {
                    badges.push({
                        text: 'Letzte Beförderung: ' + formatDate(data.promotion),
                        color: 'red'
                    });
                }

                if (data.testUntil) {
                    badges.push({
                        text: 'Testzeit: ' + formatDate(data.testUntil),
                        color: 'yellow'
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


// =========================
// RANGFARBEN
// =========================

function getRankColor(rank) {

    var colors = {
        'Private First Class': 'light-gray',
        'Lance Corporal': 'purple',
        'Corporal': 'purple',

        'Sergeant': 'green',
        'Staff Sergeant': 'green',
        'Sergeant Major': 'green',

        'Lieutenant': 'blue',
        'First Lieutenant': 'blue',

        'Captain': 'orange'
    };

    return colors[rank] || 'light-gray';
}


// =========================
// POSITIONSFARBEN
// =========================

function getPositionColor(position) {

    var colors = {
        'Mannschaft': 'purple',
        'Unteroffizierebene': 'green',
        'Führungsebene': 'blue',
        'Hohe Führungsebene': 'orange'
    };

    return colors[position] || 'light-gray';
}


// =========================
// UNTEREINHEITEN
// =========================

function getUnitColor(unit) {

    var colors = {
        'Rancor Battalion': 'red',
        'Tactical Combat Instructor': 'green',
        'Munilist 10': 'blue'
    };

    return colors[unit] || 'light-gray';
}


// =========================
// DATUM FORMATIEREN
// =========================

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
