window.TrelloPowerUp.initialize({

    // ==================================================
    // BOARD BUTTONS
    // ==================================================

    'board-buttons': function (t) {

        return [

            // Für alle Bearbeiter
            {
                text: 'CT Overview',
                condition: 'edit',

                callback: function (t) {

                    return t.modal({
                        title: 'CT Overview',
                        url: t.signUrl('./dashboard.html'),
                        fullscreen: true
                    });

                }
            },

            // Nur für Board-Admins
            {
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
            }

        ];

    },


    // ==================================================
    // FELDER IN GEÖFFNETER KARTE
    // ==================================================

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


    // ==================================================
    // BADGES AUF KARTENVORDERSEITE
    // ==================================================

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


            var storedValues =
                getStoredValues(
                    values[1] || {}
                );


            var badges = [];


            // ------------------------------------------
            // NORMALE CT FIELDS
            // ------------------------------------------

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


            // ------------------------------------------
            // PLAUSIBILITÄTSFEHLER
            // ------------------------------------------

            if (
                hasPlausibilityError(
                    schema,
                    storedValues
                )
            ) {

                badges.push({

                    text:
                        '⚠ Plausibilitätsfehler',

                    color:
                        'yellow'

                });

            }


            return badges;

        });

    }

});


// ======================================================
// KARTENDATEN
// ======================================================

function getStoredValues(data) {

    if (
        data &&
        data.v === 2 &&
        data.values
    ) {

        return data.values;
    }


    return data || {};
}


// ======================================================
// PLAUSIBILITÄT
// ======================================================

function hasPlausibilityError(
    schema,
    storedValues
) {

    var rules = {

        // Mannschaft
        'private-first-class':
            'mannschaft',

        'lance-corporal':
            'mannschaft',

        'corporal':
            'mannschaft',


        // Unteroffiziere
        'sergeant':
            'unteroffizierebene',

        'staff-sergeant':
            'unteroffizierebene',

        'sergeant-major':
            'unteroffizierebene',


        // Führung
        'lieutenant':
            'fuehrungsebene',

        'first-lieutenant':
            'fuehrungsebene',


        // Hohe Führung
        'captain':
            'hohe-fuehrungsebene',

        'major':
            'hohe-fuehrungsebene',

        'commander':
            'hohe-fuehrungsebene'

    };


    var rankField =
        schema.fields.find(
            function (field) {
                return field.id === 'rank';
            }
        );


    var positionField =
        schema.fields.find(
            function (field) {
                return field.id === 'position';
            }
        );


    if (
        !rankField ||
        !positionField
    ) {

        return false;
    }


    var rank =
        ctNormalizeValue(
            rankField,
            storedValues.rank || ''
        );


    var position =
        ctNormalizeValue(
            positionField,
            storedValues.position || ''
        );


    if (!rank) {
        return false;
    }


    // Andere Ränge ignorieren
    if (!rules[rank]) {
        return false;
    }


    return (
        position !==
        rules[rank]
    );
}


// ======================================================
// DATUM
// ======================================================

function formatDate(dateString) {

    if (!dateString) {
        return '';
    }


    var parts =
        dateString.split('-');


    if (
        parts.length !== 3
    ) {

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
