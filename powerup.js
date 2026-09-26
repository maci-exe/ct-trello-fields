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


            // =========================
            // NORMALE CT-FIELDS
            // =========================

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


            // =========================
            // PLAUSIBILITÄTSCHECK
            // =========================

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


    // Kompatibilität mit alten Testdaten
    return data || {};

}


// =========================
// PLAUSIBILITÄTSCHECK
// =========================

function hasPlausibilityError(
    schema,
    storedValues
) {

    /*
     * NUR DIESE RÄNGE WERDEN GEPRÜFT.
     *
     * Alle anderen Ränge werden
     * vollständig ignoriert.
     */

    var rules = {


        // =========================
        // MANNSCHAFTSEBENE
        // =========================

        'private-first-class':
            'mannschaft',

        'lance-corporal':
            'mannschaft',

        'corporal':
            'mannschaft',


        // =========================
        // UNTEROFFIZIERSEBENE
        // =========================

        'sergeant':
            'unteroffizierebene',

        'staff-sergeant':
            'unteroffizierebene',

        'sergeant-major':
            'unteroffizierebene',


        // =========================
        // FÜHRUNGSEBENE
        // =========================

        'lieutenant':
            'fuehrungsebene',

        'first-lieutenant':
            'fuehrungsebene',


        // =========================
        // HOHE FÜHRUNGSEBENE
        // =========================

        'captain':
            'hohe-fuehrungsebene',

        'major':
            'hohe-fuehrungsebene',

        'commander':
            'hohe-fuehrungsebene'

    };


    // =========================
    // RANG-FIELD FINDEN
    // =========================

    var rankField =
        schema.fields.find(
            function (field) {

                return (
                    field.id === 'rank'
                );

            }
        );


    // =========================
    // POSITION-FIELD FINDEN
    // =========================

    var positionField =
        schema.fields.find(
            function (field) {

                return (
                    field.id === 'position'
                );

            }
        );


    /*
     * Falls eine der Kategorien
     * nicht mehr existiert,
     * kein Check.
     */

    if (
        !rankField ||
        !positionField
    ) {

        return false;

    }


    // =========================
    // WERTE NORMALISIEREN
    // =========================

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


    /*
     * Kein Rang gesetzt.
     */

    if (!rank) {

        return false;

    }


    /*
     * Rang ist NICHT Bestandteil
     * unserer Regeln.
     *
     * Beispiel:
     * High General
     * General
     * Marshal
     * usw.
     *
     * -> komplett ignorieren.
     */

    if (!rules[rank]) {

        return false;

    }


    /*
     * Erwartete Position
     * anhand des Rangs.
     */

    var expectedPosition =
        rules[rank];


    /*
     * Position stimmt nicht
     * oder wurde gar nicht gesetzt.
     */

    if (
        position !==
        expectedPosition
    ) {

        return true;

    }


    return false;

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
