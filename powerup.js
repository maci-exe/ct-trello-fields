window.TrelloPowerUp.initialize({


    // =========================
    // BOARD EINSTELLUNGEN
    // =========================

    'board-buttons': function (t) {

        return [{
            text: 'CT Fields',
            condition: 'admin',

            callback: function (t) {

                return t.modal({
                    title: 'CT Fields – Einstellungen',
                    url: t.signUrl('./settings.html'),
                    height: 720,
                    fullscreen: false
                });

            }
        }];

    },


    // =========================
    // FELDER AUF KARTENRÜCKSEITE
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

        return Promise.all([

            t.get(
                'card',
                'shared',
                'characterData',
                {}
            ),

            t.get(
                'board',
                'shared',
                'ctConfig',
                null
            )

        ]).then(function (values) {

            var data =
                values[0] || {};

            var config =
                ctNormalizeConfig(values[1]);

            var badges = [];


            addChoiceBadge(
                badges,
                config,
                'units',
                data.unit,
                'Untereinheit'
            );


            addChoiceBadge(
                badges,
                config,
                'ranks',
                data.rank,
                '🏅 Rang'
            );


            addChoiceBadge(
                badges,
                config,
                'positions',
                data.position,
                'Position'
            );


            addChoiceBadge(
                badges,
                config,
                'adjutants',
                data.adjutant,
                'Adjutant'
            );


            if (data.promotion) {

                badges.push({
                    text:
                        'Letzte Beförderung: ' +
                        formatDate(data.promotion),

                    color:
                        config.fixedColors.promotion
                });

            }


            if (data.testUntil) {

                badges.push({
                    text:
                        'Testzeit: ' +
                        formatDate(data.testUntil),

                    color:
                        config.fixedColors.testUntil
                });

            }


            if (data.ctId) {

                badges.push({
                    text:
                        'ID: ' + data.ctId,

                    color:
                        config.fixedColors.ctId
                });

            }


            return badges;

        });

    }

});


// =========================
// AUSWAHL-BADGE
// =========================

function addChoiceBadge(
    badges,
    config,
    section,
    storedValue,
    title
) {

    if (!storedValue) {
        return;
    }

    var item =
        ctFindItem(
            config,
            section,
            storedValue
        );


    // Falls später einmal eine Option
    // gelöscht wird, bleibt der alte Wert
    // wenigstens sichtbar.

    var label =
        item
            ? item.label
            : storedValue;

    var color =
        item
            ? item.color
            : 'light-gray';


    badges.push({
        text: title + ': ' + label,
        color: color
    });

}


// =========================
// DATUM
// =========================

function formatDate(dateString) {

    if (!dateString) {
        return '';
    }

    var parts =
        dateString.split('-');

    if (parts.length !== 3) {
        return dateString;
    }

    return (
        parts[2] +
        '.' +
        parts[1] +
        '.' +
        parts[0]
    );
}
