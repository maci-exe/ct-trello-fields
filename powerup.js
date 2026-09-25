window.TrelloPowerUp.initialize({


    // =========================
    // BOARD SETTINGS BUTTON
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
    // FELDER DIREKT IN DER KARTE
    // =========================

    'card-back-section': function (t) {

        return {

            title: 'CT Fields',

            icon:
                t.signUrl('./icon.svg'),

            content: {

                type: 'iframe',

                url:
                    t.signUrl('./fields.html'),

                height: 350

            }

        };

    },


    // =========================
    // KARTENVORDERSEITE
    // =========================

    'card-badges': function (t) {

        return Promise.all([

            t.get(
                'board',
                'shared',
                'ctSchema',
                null
            ),

            t.get(
                'card',
                'shared',
                'characterData',
                {}
            )

        ]).then(function (values) {

            var schema =
                ctDecodeSchema(
                    values[0]
                );


            var data =
                values[1] || {};


            var storedValues =
                getStoredValues(data);


            var badges = [];


            schema.fields.forEach(
                function (field) {

                    var value =
                        storedValues[field.id];


                    if (!value) {
                        return;
                    }


                    var displayValue =
                        ctGetDisplayValue(
                            field,
                            value
                        );


                    if (
                        field.type === 'date'
                    ) {

                        displayValue =
                            formatDate(
                                displayValue
                            );

                    }


                    badges.push({

                        text:
                            field.label +
                            ': ' +
                            displayValue,

                        color:
                            ctGetValueColor(
                                field,
                                value
                            )

                    });

                }
            );


            return badges;

        });

    }

});


// =========================
// ALTE + NEUE KARTENDATEN
// =========================

function getStoredValues(data) {

    if (
        data &&
        data.v === 2 &&
        data.values
    ) {

        return data.values;

    }


    // Kompatibilität mit unserem bisherigen Teststand.
    return data || {};

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
