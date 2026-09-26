var t =
    window.TrelloPowerUp.iframe();


// =========================
// ELEMENTE
// =========================

var fieldsGrid =
    document.getElementById(
        'fieldsGrid'
    );

var plausibilityWarning =
    document.getElementById(
        'plausibilityWarning'
    );

var status =
    document.getElementById(
        'status'
    );


// =========================
// STATE
// =========================

var schema = null;

var storedValues = {};

var canWrite = false;

var loaded = false;

var statusTimer = null;


// =========================
// KARTENDATEN AUSLESEN
// =========================

function extractValues(data) {

    if (
        data &&
        data.v === 2 &&
        data.values
    ) {

        return Object.assign(
            {},
            data.values
        );
    }


    // Kompatibilität mit alten Testdaten
    return Object.assign(
        {},
        data || {}
    );
}


// =========================
// FIELD AUS SCHEMA HOLEN
// =========================

function getField(fieldId) {

    if (
        !schema ||
        !Array.isArray(schema.fields)
    ) {

        return null;
    }


    return schema.fields.find(
        function (field) {

            return (
                field.id === fieldId
            );

        }
    ) || null;
}


// =========================
// PLAUSIBILITÄTSCHECK
// =========================

function checkPlausibility() {

    /*
     * Es werden AUSSCHLIESSLICH
     * diese Ränge geprüft.
     *
     * Alle anderen Ränge werden
     * komplett ignoriert.
     */

    var rules = {

        // Mannschaftsebene
        'private-first-class':
            'mannschaft',

        'lance-corporal':
            'mannschaft',

        'corporal':
            'mannschaft',


        // Unteroffiziersebene
        'sergeant':
            'unteroffizierebene',

        'staff-sergeant':
            'unteroffizierebene',

        'sergeant-major':
            'unteroffizierebene',


        // Führungsebene
        'lieutenant':
            'fuehrungsebene',

        'first-lieutenant':
            'fuehrungsebene',


        // Hohe Führungsebene
        'captain':
            'hohe-fuehrungsebene',

        'major':
            'hohe-fuehrungsebene',

        'commander':
            'hohe-fuehrungsebene'

    };


    var rankField =
        getField('rank');

    var positionField =
        getField('position');


    /*
     * Falls Rang oder Position als
     * Kategorie irgendwann gelöscht
     * wurde, gibt es keinen Check.
     */

    if (
        !rankField ||
        !positionField
    ) {

        plausibilityWarning.style.display =
            'none';

        return;
    }


    /*
     * Alte gespeicherte Namen werden
     * ebenfalls auf die internen IDs
     * normalisiert.
     */

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
     * Kein Rang gewählt
     */

    if (!rank) {

        plausibilityWarning.style.display =
            'none';

        return;
    }


    /*
     * Rang ist nicht Bestandteil
     * unserer Regeln:
     *
     * z.B. High General oder
     * irgendein später angelegter Rang.
     *
     * -> komplett ignorieren.
     */

    if (!rules[rank]) {

        plausibilityWarning.style.display =
            'none';

        return;
    }


    var expectedPosition =
        rules[rank];


    /*
     * KORREKT
     */

    if (
        position ===
        expectedPosition
    ) {

        plausibilityWarning.style.display =
            'none';

        return;
    }


    /*
     * FALSCH
     */

    plausibilityWarning.style.display =
        'block';
}


// =========================
// FARBE SETZEN
// =========================

function setControlColor(
    control,
    color
) {

    var colors = [
        'light-gray',
        'red',
        'blue',
        'green',
        'purple',
        'orange',
        'yellow',
        'sky',
        'lime'
    ];


    colors.forEach(
        function (item) {

            control.classList.remove(
                'color-' + item
            );

        }
    );


    control.classList.add(
        'color-' +
        (
            color ||
            'light-gray'
        )
    );
}


// =========================
// STATUS
// =========================

function setStatus(
    text,
    resetAfter
) {

    clearTimeout(
        statusTimer
    );


    status.textContent =
        text;


    if (resetAfter) {

        statusTimer =
            setTimeout(
                function () {

                    status.textContent =
                        canWrite
                            ? 'Änderungen werden automatisch gespeichert.'
                            : 'Nur-Lese-Ansicht';

                },
                resetAfter
            );

    }
}


// =========================
// SPEICHERN
// =========================

function saveData() {

    if (
        !loaded ||
        !canWrite
    ) {

        return;
    }


    /*
     * Sofort prüfen.
     *
     * Dadurch erscheint die Warnung
     * direkt nach Änderung des Rangs
     * oder der Position.
     */

    checkPlausibility();


    setStatus(
        'Speichere...'
    );


    return t.set(

        'card',
        'shared',

        'characterData',

        {
            v: 2,
            values: storedValues
        }

    ).then(function () {

        setStatus(
            'Gespeichert ✓',
            1200
        );

    }).catch(function (error) {

        console.error(
            'CT Fields Save Error:',
            error
        );


        setStatus(
            'Fehler beim Speichern',
            2500
        );

    });
}


// =========================
// SELECT ERSTELLEN
// =========================

function createSelect(
    field,
    currentValue
) {

    var select =
        document.createElement(
            'select'
        );


    var empty =
        document.createElement(
            'option'
        );


    empty.value =
        '';


    empty.textContent =
        '-- Keine Auswahl --';


    select.appendChild(
        empty
    );


    (field.options || []).forEach(
        function (option) {

            var element =
                document.createElement(
                    'option'
                );


            element.value =
                option.id;


            element.textContent =
                option.label;


            select.appendChild(
                element
            );

        }
    );


    var normalized =
        ctNormalizeValue(
            field,
            currentValue
        );


    /*
     * Falls ein gespeicherter Wert
     * existiert, dessen Option später
     * gelöscht wurde.
     */

    if (
        normalized &&
        !(field.options || []).some(
            function (option) {

                return (
                    option.id ===
                    normalized
                );

            }
        )
    ) {

        var legacy =
            document.createElement(
                'option'
            );


        legacy.value =
            normalized;


        legacy.textContent =
            normalized +
            ' (Altwert)';


        select.appendChild(
            legacy
        );
    }


    select.value =
        normalized || '';


    setControlColor(

        select,

        select.value
            ? ctGetValueColor(
                field,
                select.value
            )
            : 'light-gray'

    );


    select.addEventListener(
        'change',
        function () {

            storedValues[field.id] =
                select.value;


            setControlColor(

                select,

                select.value
                    ? ctGetValueColor(
                        field,
                        select.value
                    )
                    : 'light-gray'

            );


            /*
             * Direkt neu prüfen.
             */

            checkPlausibility();


            saveData();

        }
    );


    return select;
}


// =========================
// TEXT / DATUM ERSTELLEN
// =========================

function createInput(
    field,
    currentValue
) {

    var input =
        document.createElement(
            'input'
        );


    input.type =
        field.type === 'date'
            ? 'date'
            : 'text';


    input.value =
        currentValue || '';


    setControlColor(

        input,

        input.value
            ? field.color
            : 'light-gray'

    );


    input.addEventListener(
        'input',
        function () {

            setControlColor(

                input,

                input.value
                    ? field.color
                    : 'light-gray'

            );

        }
    );


    input.addEventListener(
        'change',
        function () {

            storedValues[field.id] =
                input.value.trim();


            saveData();

        }
    );


    if (
        field.type === 'text'
    ) {

        input.addEventListener(
            'keydown',
            function (event) {

                if (
                    event.key ===
                    'Enter'
                ) {

                    event.preventDefault();

                    input.blur();
                }

            }
        );
    }


    return input;
}


// =========================
// FELD RENDERN
// =========================

function renderField(field) {

    var wrapper =
        document.createElement(
            'div'
        );


    wrapper.className =
        'field';


    var label =
        document.createElement(
            'label'
        );


    label.textContent =
        field.label;


    label.title =
        field.label;


    var currentValue =
        storedValues[field.id] || '';


    var control;


    if (
        field.type ===
        'select'
    ) {

        control =
            createSelect(
                field,
                currentValue
            );

    } else {

        control =
            createInput(
                field,
                currentValue
            );

    }


    control.disabled =
        !canWrite;


    wrapper.appendChild(
        label
    );


    wrapper.appendChild(
        control
    );


    fieldsGrid.appendChild(
        wrapper
    );
}


// =========================
// LADEN
// =========================

t.render(function () {

    loaded = false;


    canWrite =
        t.memberCanWriteToModel(
            'card'
        );


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

        schema =
            ctDecodeSchema(
                values[0]
            );


        storedValues =
            extractValues(
                values[1]
            );


        fieldsGrid.innerHTML =
            '';


        schema.fields.forEach(
            renderField
        );


        /*
         * Direkt beim Öffnen der Karte
         * überprüfen.
         */

        checkPlausibility();


        status.textContent =
            canWrite
                ? 'Änderungen werden automatisch gespeichert.'
                : 'Nur-Lese-Ansicht';


        loaded =
            true;


        return t.sizeTo(
            '#ctFields'
        );

    }).catch(function (error) {

        console.error(
            'CT Fields Load Error:',
            error
        );


        status.textContent =
            'CT Fields konnten nicht geladen werden.';

    });
});
