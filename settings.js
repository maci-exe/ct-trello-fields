var t =
    window.TrelloPowerUp.iframe();


var fieldsContainer =
    document.getElementById(
        'fieldsContainer'
    );


var addFieldButton =
    document.getElementById(
        'addFieldButton'
    );


var defaultsButton =
    document.getElementById(
        'defaultsButton'
    );


var saveButton =
    document.getElementById(
        'saveButton'
    );


var status =
    document.getElementById(
        'status'
    );


var sizeInfo =
    document.getElementById(
        'sizeInfo'
    );


var schema =
    ctGetDefaultSchema();


var counter = 0;


// =========================
// ID GENERIEREN
// =========================

function createId(prefix) {

    counter++;

    return (
        prefix +
        '-' +
        Date.now().toString(36) +
        '-' +
        counter
    );

}


// =========================
// COLOR SELECT
// =========================

function createColorSelect(
    currentColor,
    callback
) {

    var select =
        document.createElement('select');


    CT_COLOR_OPTIONS.forEach(
        function (color) {

            var option =
                document.createElement('option');

            option.value =
                color.value;

            option.textContent =
                color.label;


            if (
                color.value ===
                currentColor
            ) {

                option.selected =
                    true;

            }


            select.appendChild(
                option
            );

        }
    );


    select.addEventListener(
        'change',
        function () {

            callback(
                select.value
            );

            updateSizeInfo();

        }
    );


    return select;

}


// =========================
// MOVE
// =========================

function moveItem(
    array,
    index,
    direction
) {

    var newIndex =
        index + direction;


    if (
        newIndex < 0 ||
        newIndex >= array.length
    ) {
        return;
    }


    var tmp =
        array[index];


    array[index] =
        array[newIndex];


    array[newIndex] =
        tmp;


    render();

}


// =========================
// OPTION RENDERN
// =========================

function renderOptions(
    field,
    container
) {

    var title =
        document.createElement('div');

    title.className =
        'option-title';

    title.textContent =
        'Auswahloptionen';

    container.appendChild(title);


    field.options.forEach(
        function (option, index) {

            var row =
                document.createElement('div');

            row.className =
                'option-row';


            var name =
                document.createElement('input');

            name.type =
                'text';

            name.value =
                option.label;


            name.addEventListener(
                'input',
                function () {

                    option.label =
                        name.value;

                    updateSizeInfo();

                }
            );


            var color =
                createColorSelect(

                    option.color,

                    function (value) {

                        option.color =
                            value;

                    }

                );


            var actions =
                document.createElement('div');

            actions.className =
                'actions';


            var up =
                document.createElement('button');

            up.type = 'button';
            up.textContent = '↑';

            up.addEventListener(
                'click',
                function () {

                    moveItem(
                        field.options,
                        index,
                        -1
                    );

                }
            );


            var down =
                document.createElement('button');

            down.type = 'button';
            down.textContent = '↓';

            down.addEventListener(
                'click',
                function () {

                    moveItem(
                        field.options,
                        index,
                        1
                    );

                }
            );


            var remove =
                document.createElement('button');

            remove.type = 'button';
            remove.textContent = '✕';


            remove.addEventListener(
                'click',
                function () {

                    field.options.splice(
                        index,
                        1
                    );

                    render();

                }
            );


            actions.appendChild(up);
            actions.appendChild(down);
            actions.appendChild(remove);


            row.appendChild(name);
            row.appendChild(color);
            row.appendChild(actions);


            container.appendChild(row);

        }
    );


    var add =
        document.createElement('button');

    add.type =
        'button';

    add.className =
        'add-option';

    add.textContent =
        '+ Auswahloption';


    add.addEventListener(
        'click',
        function () {

            field.options.push({

                id:
                    createId('option'),

                label:
                    'Neue Option',

                color:
                    'light-gray'

            });


            render();

        }
    );


    container.appendChild(add);

}


// =========================
// FIELD RENDERN
// =========================

function renderField(
    field,
    index
) {

    var card =
        document.createElement('div');

    card.className =
        'field-card';


    var header =
        document.createElement('div');

    header.className =
        'field-header';


    // NAME

    var name =
        document.createElement('input');

    name.type =
        'text';

    name.value =
        field.label;


    name.addEventListener(
        'input',
        function () {

            field.label =
                name.value;

            updateSizeInfo();

        }
    );


    // TYP

    var type =
        document.createElement('select');


    [
        ['select', 'Auswahl'],
        ['text', 'Text'],
        ['date', 'Datum']

    ].forEach(
        function (entry) {

            var option =
                document.createElement('option');

            option.value =
                entry[0];

            option.textContent =
                entry[1];


            if (
                entry[0] === field.type
            ) {

                option.selected =
                    true;

            }


            type.appendChild(option);

        }
    );


    type.addEventListener(
        'change',
        function () {

            field.type =
                type.value;


            if (
                !Array.isArray(
                    field.options
                )
            ) {

                field.options = [];

            }


            render();

        }
    );


    // FARBE

    var color =
        createColorSelect(

            field.color,

            function (value) {

                field.color =
                    value;

            }

        );


    // ACTIONS

    var actions =
        document.createElement('div');

    actions.className =
        'actions';


    var up =
        document.createElement('button');

    up.type = 'button';
    up.textContent = '↑';


    up.addEventListener(
        'click',
        function () {

            moveItem(
                schema.fields,
                index,
                -1
            );

        }
    );


    var down =
        document.createElement('button');

    down.type = 'button';
    down.textContent = '↓';


    down.addEventListener(
        'click',
        function () {

            moveItem(
                schema.fields,
                index,
                1
            );

        }
    );


    var remove =
        document.createElement('button');

    remove.type = 'button';
    remove.textContent = '✕';


    remove.addEventListener(
        'click',
        function () {

            var confirmed =
                window.confirm(
                    'Kategorie "' +
                    field.label +
                    '" wirklich entfernen?\n\n' +
                    'Bereits gespeicherte Kartenwerte bleiben erhalten.'
                );


            if (!confirmed) {
                return;
            }


            schema.fields.splice(
                index,
                1
            );


            render();

        }
    );


    actions.appendChild(up);
    actions.appendChild(down);
    actions.appendChild(remove);


    header.appendChild(name);
    header.appendChild(type);


    // Bei Auswahlfeldern ist die
    // Optionsfarbe wichtiger als die Feldfarbe.
    // Wir lassen sie trotzdem gespeichert,
    // falls der Typ später geändert wird.

    header.appendChild(color);

    header.appendChild(actions);


    card.appendChild(header);


    if (
        field.type === 'select'
    ) {

        var options =
            document.createElement('div');

        options.className =
            'options';


        renderOptions(
            field,
            options
        );


        card.appendChild(options);

    }


    fieldsContainer.appendChild(card);

}


// =========================
// RENDER
// =========================

function render() {

    fieldsContainer.innerHTML =
        '';


    schema.fields.forEach(
        renderField
    );


    updateSizeInfo();

}


// =========================
// NEUE KATEGORIE
// =========================

addFieldButton.addEventListener(
    'click',
    function () {

        schema.fields.push({

            id:
                createId('field'),

            label:
                'Neue Kategorie',

            type:
                'text',

            color:
                'light-gray',

            options:
                []

        });


        render();

    }
);


// =========================
// VALIDIERUNG
// =========================

function validateSchema() {

    var fieldNames = {};


    for (
        var i = 0;
        i < schema.fields.length;
        i++
    ) {

        var field =
            schema.fields[i];


        field.label =
            field.label.trim();


        if (!field.label) {

            return {
                valid: false,
                message:
                    'Eine Kategorie hat keinen Namen.'
            };

        }


        var normalizedField =
            field.label.toLowerCase();


        if (
            fieldNames[
                normalizedField
            ]
        ) {

            return {
                valid: false,
                message:
                    'Doppelte Kategorie: ' +
                    field.label
            };

        }


        fieldNames[
            normalizedField
        ] = true;


        if (
            field.type === 'select'
        ) {

            var optionNames = {};


            for (
                var x = 0;
                x < field.options.length;
                x++
            ) {

                var option =
                    field.options[x];


                option.label =
                    option.label.trim();


                if (!option.label) {

                    return {
                        valid: false,
                        message:
                            'Eine Auswahloption in "' +
                            field.label +
                            '" hat keinen Namen.'
                    };

                }


                var normalizedOption =
                    option.label.toLowerCase();


                if (
                    optionNames[
                        normalizedOption
                    ]
                ) {

                    return {
                        valid: false,
                        message:
                            'Doppelte Option "' +
                            option.label +
                            '" in "' +
                            field.label +
                            '".'
                    };

                }


                optionNames[
                    normalizedOption
                ] = true;

            }

        }

    }


    return {
        valid: true
    };

}


// =========================
// SPEICHERGRÖSSE
// =========================

function getStorageSize() {

    var encoded =
        ctEncodeSchema(
            schema
        );


    return JSON.stringify({

        ctSchema:
            encoded

    }).length;

}


function updateSizeInfo() {

    var size =
        getStorageSize();


    sizeInfo.textContent =
        'Konfigurationsgröße: ' +
        size +
        ' / ca. 4096 Zeichen';

}


// =========================
// SPEICHERN
// =========================

saveButton.addEventListener(
    'click',
    function () {

        if (
            !t.memberCanWriteToModel(
                'board'
            )
        ) {

            status.className =
                'error';

            status.textContent =
                'Keine Schreibberechtigung.';

            return;

        }


        var validation =
            validateSchema();


        if (!validation.valid) {

            status.className =
                'error';

            status.textContent =
                validation.message;

            return;

        }


        var encoded =
            ctEncodeSchema(
                schema
            );


        var size =
            JSON.stringify({

                ctSchema:
                    encoded

            }).length;


        // Etwas Reserve lassen,
        // statt exakt bis 4096 zu gehen.

        if (size > 3900) {

            status.className =
                'error';

            status.textContent =
                'Die Konfiguration ist zu groß. Bitte einige Kategorien oder Optionen entfernen.';

            return;

        }


        status.className = '';

        status.textContent =
            'Speichere...';


        return t.set(

            'board',

            'shared',

            'ctSchema',

            encoded

        ).then(function () {

            status.className =
                'success';

            status.textContent =
                'Einstellungen gespeichert.';

            updateSizeInfo();

        }).catch(function (error) {

            console.error(error);


            status.className =
                'error';

            status.textContent =
                'Fehler beim Speichern.';

        });

    }
);


// =========================
// DEFAULTS
// =========================

defaultsButton.addEventListener(
    'click',
    function () {

        var confirmed =
            window.confirm(
                'Standardwerte laden?\n\n' +
                'Sie werden erst übernommen, wenn du anschließend speicherst.'
            );


        if (!confirmed) {
            return;
        }


        schema =
            ctGetDefaultSchema();


        render();


        status.className = '';

        status.textContent =
            'Standardwerte geladen – noch nicht gespeichert.';

    }
);


// =========================
// LADEN
// =========================

t.get(

    'board',

    'shared',

    'ctSchema',

    null

).then(function (rawSchema) {

    schema =
        ctDecodeSchema(
            rawSchema
        );


    render();

});
