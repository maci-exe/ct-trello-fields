window.TrelloPowerUp.initialize({

    // =========================
    // FELDER DIREKT IN DER KARTE
    // =========================

    'card-back-section': function (t) {

        return {
            title: 'CT Fields',

            icon: t.signUrl('./icon.svg'),

            content: {
                type: 'iframe',
                url: t.signUrl('./fields.html'),
                height: 330
                    }
        };
    },


    // =========================
    // BADGES AUF KARTENVORDERSEITE
    // =========================

    'card-badges': function (t) {

        return t.get(
            'card',
            'shared',
            'characterData',
            {}
        ).then(function (data) {

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
                    color: getAdjutantColor(data.adjutant)
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

        'Captain': 'red',
        'Major': 'orange',
        'Commander': 'yellow',
        'High General': 'purple'
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
        'Hohe Führungsebene': 'red'
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
        'Muunilinst 10': 'blue'
    };

    return colors[unit] || 'light-gray';
}


// =========================
// ADJUTANTEN
// =========================

function getAdjutantColor(adjutant) {

    var colors = {

        '5th': 'sky',
        '41st': 'green',
        '104th': 'light-gray',
        '187th': 'purple',
        '212th': 'orange',
        '501st': 'blue',

        'CTP': 'lime',
        'GMC': 'purple',
        'RMC': 'red',
        'SO': 'sky',
        'ST': 'red'
    };

    return colors[adjutant] || 'light-gray';
}


// =========================
// DATUM
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
