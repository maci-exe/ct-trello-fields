var t =
    window.TrelloPowerUp.iframe();


var fieldsGrid =
    document.getElementById('fieldsGrid');

var status =
    document.getElementById('status');


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


    colors.forEach(function (item) {

        control.classList.remove(
            'color-' + item
        );

    });


    control.classList.add(
        'color-' +
        (color || 'light-gray')
    );

}


// =========================
// STATUS
// =========================

function setStatus(text, resetAfter) {

    clearTimeout(statusTimer);

    status.textContent = text;


    if (resetAfter) {

        statusTimer = setTimeout(
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


    setStatus('Speichere...');


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
            'CT Fields Card Save Error:',
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
        document.createElement('select');


    var empty =
        document.createElement('option');

    empty.value = '';

    empty.textContent =
        '-- Keine Auswahl --';

    select.appendChild(empty);


    (field.options || []).forEach(
        function (option) {

            var element =
                document.createElement('option');

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


    // Falls eine Option inzwischen gelöscht wurde,
    // bleibt ein alter Kartenwert trotzdem sichtbar.
    if (
        normalized &&
        !(field.options || []).some(
            function (option) {
                return option.id === normalized;
            }
        )
    ) {

        var legacy =
            document.createElement('option');

        legacy.value =
            normalized;

        legacy.textContent =
            normalized + ' (Altwert)';

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
        document.createElement('input');


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


    if (field.type === 'text') {

        input.addEventListener(
            'keydown',
            function (event) {

                if (event.key === 'Enter') {

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
        document.createElement('div');

    wrapper.className =
        'field';


    var label =
        document.createElement('label');

    label.textContent =
        field.label;

    label.title =
        field.label;


    var currentValue =
        storedValues[field.id] || '';


    var control;


    if (field.type === 'select') {

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


    wrapper.appendChild(label);

    wrapper.appendChild(control);


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


        status.textContent =
            canWrite
                ? 'Änderungen werden automatisch gespeichert.'
                : 'Nur-Lese-Ansicht';


        loaded = true;


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
