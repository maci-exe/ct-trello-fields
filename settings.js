var t =
    window.TrelloPowerUp.iframe();


var settingsContainer =
    document.getElementById('settings');

var fixedColorsContainer =
    document.getElementById('fixedColors');

var saveButton =
    document.getElementById('saveButton');

var defaultsButton =
    document.getElementById('defaultsButton');

var status =
    document.getElementById('status');


var config =
    ctGetDefaultConfig();

var counter = 0;


var sections = [

    {
        key: 'units',
        title: 'Untereinheiten'
    },

    {
        key: 'ranks',
        title: 'Ränge'
    },

    {
        key: 'positions',
        title: 'Positionen'
    },

    {
        key: 'adjutants',
        title: 'Adjutanten'
    }

];


var fixedFields = [

    {
        key: 'promotion',
        title: 'Letzte Beförderung'
    },

    {
        key: 'testUntil',
        title: 'Testzeit'
    },

    {
        key: 'ctId',
        title: 'ID'
    }

];


// =========================
// COLOR SELECT
// =========================

function createColorSelect(
    selectedColor,
    onChange
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
                selectedColor
            ) {
                option.selected = true;
            }

            select.appendChild(option);

        }
    );


    select.addEventListener(
        'change',
        function () {

            onChange(
                select.value
            );

        }
    );


    return select;
}


// =========================
// NEUE STABILE ID
// =========================

function createId(section) {

    counter++;

    return (
        'custom-' +
        section +
        '-' +
        Date.now().toString(36) +
        '-' +
        counter
    );

}


// =========================
// VERSCHIEBEN
// =========================

function moveItem(
    section,
    index,
    direction
) {

    var items =
        config[section];

    var newIndex =
        index + direction;


    if (
        newIndex < 0 ||
        newIndex >= items.length
    ) {
        return;
    }


    var temp =
        items[index];

    items[index] =
        items[newIndex];

    items[newIndex] =
        temp;


    render();

}


// =========================
// SECTION RENDERN
// =========================

function renderSection(definition) {

    var title =
        document.createElement('h2');

    title.textContent =
        definition.title;

    settingsContainer.appendChild(title);


    config[definition.key].forEach(
        function (item, index) {

            var row =
                document.createElement('div');

            row.className =
                'config-row';


            // Name

            var nameInput =
                document.createElement('input');

            nameInput.type =
                'text';

            nameInput.value =
                item.label;

            nameInput.addEventListener(
                'input',
                function () {

                    item.label =
                        nameInput.value;

                }
            );


            // Farbe

            var colorSelect =
                createColorSelect(
                    item.color,
                    function (value) {

                        item.color =
                            value;

                    }
                );


            // Buttons

            var buttons =
                document.createElement('div');

            buttons.className =
                'row-buttons';


            var up =
                document.createElement('button');

            up.type =
                'button';

            up.textContent =
                '↑';

            up.title =
                'Nach oben';

            up.addEventListener(
                'click',
                function () {

                    moveItem(
                        definition.key,
                        index,
                        -1
                    );

                }
            );


            var down =
                document.createElement('button');

            down.type =
                'button';

            down.textContent =
                '↓';

            down.title =
                'Nach unten';

            down.addEventListener(
                'click',
                function () {

                    moveItem(
                        definition.key,
                        index,
                        1
                    );

                }
            );


            var remove =
                document.createElement('button');

            remove.type =
                'button';

            remove.textContent =
                '✕';

            remove.title =
                'Löschen';

            remove.addEventListener(
                'click',
                function () {

                    config[
                        definition.key
                    ].splice(
                        index,
                        1
                    );

                    render();

                }
            );


            buttons.appendChild(up);
            buttons.appendChild(down);
            buttons.appendChild(remove);


            row.appendChild(nameInput);
            row.appendChild(colorSelect);
            row.appendChild(buttons);

            settingsContainer.appendChild(row);

        }
    );


    var add =
        document.createElement('button');

    add.type =
        'button';

    add.className =
        'add-button';

    add.textContent =
        '+ Eintrag hinzufügen';


    add.addEventListener(
        'click',
        function () {

            config[
                definition.key
            ].push({

                id:
                    createId(
                        definition.key
                    ),

                label:
                    'Neuer Eintrag',

                color:
                    'light-gray'

            });


            render();

        }
    );


    settingsContainer.appendChild(add);

}


// =========================
// FESTE FARBEN
// =========================

function renderFixedColors() {

    fixedColorsContainer.innerHTML =
        '';


    fixedFields.forEach(
        function (field) {

            var row =
                document.createElement('div');

            row.className =
                'fixed-row';


            var label =
                document.createElement('strong');

            label.textContent =
                field.title;


            var color =
                createColorSelect(

                    config.fixedColors[
                        field.key
                    ],

                    function (value) {

                        config.fixedColors[
                            field.key
                        ] = value;

                    }

                );


            row.appendChild(label);
            row.appendChild(color);

            fixedColorsContainer.appendChild(row);

        }
    );

}


// =========================
// ALLES RENDERN
// =========================

function render() {

    settingsContainer.innerHTML =
        '';


    sections.forEach(
        renderSection
    );


    renderFixedColors();

}


// =========================
// VALIDIERUNG
// =========================

function validateConfig() {

    var valid = true;
    var message = '';


    sections.some(
        function (definition) {

            var labels = {};


            return config[
                definition.key
            ].some(
                function (item) {

                    item.label =
                        item.label.trim();


                    if (!item.label) {

                        valid = false;

                        message =
                            'Ein Eintrag hat keinen Namen.';

                        return true;
                    }


                    var normalized =
                        item.label.toLowerCase();


                    if (labels[normalized]) {

                        valid = false;

                        message =
                            'Doppelte Bezeichnung: ' +
                            item.label;

                        return true;
                    }


                    labels[normalized] =
                        true;


                    return false;

                }
            );

        }
    );


    return {
        valid: valid,
        message: message
    };

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
                'Keine Schreibberechtigung für dieses Board.';

            return;
        }


        var validation =
            validateConfig();


        if (!validation.valid) {

            status.className =
                'error';

            status.textContent =
                validation.message;

            return;
        }


        status.className = '';

        status.textContent =
            'Speichere...';


        return t.set(

            'board',

            'shared',

            'ctConfig',

            config

        ).then(function () {

            status.className =
                'success';

            status.textContent =
                'Einstellungen gespeichert.';

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
// STANDARDWERTE
// =========================

defaultsButton.addEventListener(
    'click',
    function () {

        config =
            ctGetDefaultConfig();

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

    'ctConfig',

    null

).then(function (savedConfig) {

    config =
        ctNormalizeConfig(
            savedConfig
        );

    render();

});
