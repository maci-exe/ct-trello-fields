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

var isDirty = false;

var openState = {};

var saveButtonTimer = null;

var saveOperation = 0;


// =========================
// IDs
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
// LABELS
// =========================

function getTypeLabel(type) {

    if (type === 'select') {
        return 'Auswahl';
    }

    if (type === 'date') {
        return 'Datum';
    }

    return 'Text';

}


function getColorLabel(colorValue) {

    var match =
        CT_COLOR_OPTIONS.find(
            function (item) {

                return (
                    item.value ===
                    colorValue
                );

            }
        );


    return match
        ? match.label
        : colorValue;

}


// =========================
// STATUS
// =========================

function setStatus(
    message,
    type
) {

    status.textContent =
        message;


    status.className =
        'status-pill';


    status.classList.add(
        'status-' +
        (type || 'neutral')
    );

}


// =========================
// SAVE BUTTON STATE
// =========================

function setSaveButtonState(state) {

    clearTimeout(
        saveButtonTimer
    );


    saveButton.disabled =
        false;


    saveButton.classList.add(
        'mod-primary'
    );


    if (state === 'saving') {

        saveButton.textContent =
            'Speichere...';

        saveButton.disabled =
            true;

        return;

    }


    if (state === 'saved') {

        saveButton.textContent =
            'Gespeichert ✓';


        saveButtonTimer =
            setTimeout(
                function () {

                    setSaveButtonState(
                        isDirty
                            ? 'dirty'
                            : 'default'
                    );

                },
                1800
            );

        return;

    }


    if (state === 'dirty') {

        saveButton.textContent =
            'Änderungen speichern';

        return;

    }


    saveButton.textContent =
        'Einstellungen speichern';

}


// =========================
// DIRTY STATE
// =========================

function markDirty(message) {

    isDirty = true;


    setSaveButtonState(
        'dirty'
    );


    setStatus(
        message ||
        'Ungespeicherte Änderungen',
        'warning'
    );


    updateSizeInfo();

}


// =========================
// COLOR SELECT
// =========================

function createColorSelect(
    currentColor,
    callback
) {

    var select =
        document.createElement(
            'select'
        );


    CT_COLOR_OPTIONS.forEach(
        function (color) {

            var option =
                document.createElement(
                    'option'
                );


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

            markDirty();

        }
    );


    return select;

}


// =========================
// ARRAY ELEMENT VERSCHIEBEN
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

        return false;

    }


    var temporary =
        array[index];


    array[index] =
        array[newIndex];


    array[newIndex] =
        temporary;


    return true;

}


// =========================
// BUTTON HELPER
// =========================

function createActionButton(
    text,
    title,
    callback
) {

    var button =
        document.createElement(
            'button'
        );


    button.type =
        'button';


    button.textContent =
        text;


    button.title =
        title || text;


    button.addEventListener(
        'click',
        callback
    );


    return button;

}


// =========================
// GROUP HELPER
// =========================

function createGroup(labelText) {

    var wrapper =
        document.createElement(
            'div'
        );


    wrapper.className =
        'group';


    var label =
        document.createElement(
            'label'
        );


    label.textContent =
        labelText;


    wrapper.appendChild(
        label
    );


    return wrapper;

}


// =========================
// AUSWAHLOPTIONEN RENDERN
// =========================

function renderOptions(
    field,
    container
) {

    var panel =
        document.createElement(
            'div'
        );


    panel.className =
        'options-panel';


    var head =
        document.createElement(
            'div'
        );


    head.className =
        'options-head';


    var headText =
        document.createElement(
            'div'
        );


    var headline =
        document.createElement(
            'h3'
        );


    headline.textContent =
        'Auswahloptionen';


    var description =
        document.createElement(
            'p'
        );


    description.textContent =
        'Diese Optionen gehören zu "' +
        (field.label || 'Neue Kategorie') +
        '".';


    headText.appendChild(
        headline
    );


    headText.appendChild(
        description
    );


    var addOptionButton =
        createActionButton(
            '+ Auswahloption',
            'Neue Auswahloption hinzufügen',
            function () {

                field.options.push({

                    id:
                        createId(
                            'option'
                        ),

                    label:
                        'Neue Option',

                    color:
                        'light-gray'

                });


                openState[field.id] =
                    true;


                render();


                markDirty(
                    'Auswahloption hinzugefügt'
                );

            }
        );


    head.appendChild(
        headText
    );


    head.appendChild(
        addOptionButton
    );


    panel.appendChild(
        head
    );


    var list =
        document.createElement(
            'div'
        );


    list.className =
        'option-list';


    (field.options || []).forEach(
        function (
            option,
            index
        ) {

            var row =
                document.createElement(
                    'div'
                );


            row.className =
                'option-row';


            var nameInput =
                document.createElement(
                    'input'
                );


            nameInput.type =
                'text';


            nameInput.value =
                option.label;


            nameInput.addEventListener(
                'input',
                function () {

                    option.label =
                        nameInput.value;


                    markDirty();

                }
            );


            var colorSelect =
                createColorSelect(

                    option.color,

                    function (value) {

                        option.color =
                            value;

                    }

                );


            var actions =
                document.createElement(
                    'div'
                );


            actions.className =
                'actions';


            var upButton =
                createActionButton(

                    '↑',

                    'Nach oben',

                    function () {

                        if (
                            moveItem(
                                field.options,
                                index,
                                -1
                            )
                        ) {

                            openState[field.id] =
                                true;


                            render();


                            markDirty(
                                'Auswahloption verschoben'
                            );

                        }

                    }

                );


            var downButton =
                createActionButton(

                    '↓',

                    'Nach unten',

                    function () {

                        if (
                            moveItem(
                                field.options,
                                index,
                                1
                            )
                        ) {

                            openState[field.id] =
                                true;


                            render();


                            markDirty(
                                'Auswahloption verschoben'
                            );

                        }

                    }

                );


            var removeButton =
                createActionButton(

                    '✕',

                    'Auswahloption entfernen',

                    function () {

                        field.options.splice(
                            index,
                            1
                        );


                        openState[field.id] =
                            true;


                        render();


                        markDirty(
                            'Auswahloption entfernt'
                        );

                    }

                );


            actions.appendChild(
                upButton
            );


            actions.appendChild(
                downButton
            );


            actions.appendChild(
                removeButton
            );


            row.appendChild(
                nameInput
            );


            row.appendChild(
                colorSelect
            );


            row.appendChild(
                actions
            );


            list.appendChild(
                row
            );

        }
    );


    panel.appendChild(
        list
    );


    container.appendChild(
        panel
    );

}


// =========================
// KATEGORIE RENDERN
// =========================

function renderField(
    field,
    index
) {

    var details =
        document.createElement(
            'details'
        );


    details.className =
        'field-card';


    if (
        openState[field.id] !==
        undefined
    ) {

        details.open =
            openState[field.id];

    } else {

        details.open =
            index === 0;

    }


    details.addEventListener(
        'toggle',
        function () {

            openState[field.id] =
                details.open;

        }
    );


    // =====================
    // SUMMARY
    // =====================

    var summary =
        document.createElement(
            'summary'
        );


    summary.className =
        'field-summary';


    var summaryLeft =
        document.createElement(
            'div'
        );


    summaryLeft.className =
        'summary-left';


    var summaryTitle =
        document.createElement(
            'div'
        );


    summaryTitle.className =
        'summary-title';


    summaryTitle.textContent =
        field.label ||
        'Neue Kategorie';


    var summaryMeta =
        document.createElement(
            'div'
        );


    summaryMeta.className =
        'summary-meta';


    var typePill =
        document.createElement(
            'span'
        );


    typePill.className =
        'meta-pill';


    typePill.textContent =
        getTypeLabel(
            field.type
        );


    summaryMeta.appendChild(
        typePill
    );


    if (
        field.type ===
        'select'
    ) {

        var countPill =
            document.createElement(
                'span'
            );


        countPill.className =
            'meta-pill';


        countPill.textContent =
            (field.options || []).length +
            ' Optionen';


        summaryMeta.appendChild(
            countPill
        );

    }


    summaryLeft.appendChild(
        summaryTitle
    );


    summaryLeft.appendChild(
        summaryMeta
    );


    var summaryRight =
        document.createElement(
            'div'
        );


    summaryRight.className =
        'summary-right';


    var colorDot =
        document.createElement(
            'span'
        );


    colorDot.className =
        'summary-color color-' +
        (
            field.color ||
            'light-gray'
        );


    colorDot.title =
        getColorLabel(
            field.color ||
            'light-gray'
        );


    var chevron =
        document.createElement(
            'span'
        );


    chevron.className =
        'summary-chevron';


    chevron.textContent =
        '›';


    summaryRight.appendChild(
        colorDot
    );


    summaryRight.appendChild(
        chevron
    );


    summary.appendChild(
        summaryLeft
    );


    summary.appendChild(
        summaryRight
    );


    details.appendChild(
        summary
    );


    // =====================
    // BODY
    // =====================

    var body =
        document.createElement(
            'div'
        );


    body.className =
        'field-body';


    var grid =
        document.createElement(
            'div'
        );


    grid.className =
        'field-grid';


    // NAME

    var nameGroup =
        createGroup(
            'Bezeichnung'
        );


    var nameInput =
        document.createElement(
            'input'
        );


    nameInput.type =
        'text';


    nameInput.value =
        field.label;


    nameInput.addEventListener(
        'input',
        function () {

            field.label =
                nameInput.value;


            summaryTitle.textContent =
                field.label ||
                'Neue Kategorie';


            markDirty();

        }
    );


    nameGroup.appendChild(
        nameInput
    );


    grid.appendChild(
        nameGroup
    );


    // TYP

    var typeGroup =
        createGroup(
            'Feldtyp'
        );


    var typeSelect =
        document.createElement(
            'select'
        );


    [
        ['select', 'Auswahl'],
        ['text', 'Text'],
        ['date', 'Datum']

    ].forEach(
        function (entry) {

            var option =
                document.createElement(
                    'option'
                );


            option.value =
                entry[0];


            option.textContent =
                entry[1];


            if (
                entry[0] ===
                field.type
            ) {

                option.selected =
                    true;

            }


            typeSelect.appendChild(
                option
            );

        }
    );


    typeSelect.addEventListener(
        'change',
        function () {

            field.type =
                typeSelect.value;


            if (
                !Array.isArray(
                    field.options
                )
            ) {

                field.options =
                    [];

            }


            openState[field.id] =
                true;


            render();


            markDirty(
                'Feldtyp geändert'
            );

        }
    );


    typeGroup.appendChild(
        typeSelect
    );


    grid.appendChild(
        typeGroup
    );


    // FARBE

    var colorGroup =
        createGroup(
            field.type === 'select'
                ? 'Fallbackfarbe'
                : 'Feldfarbe'
        );


    var colorSelect =
        createColorSelect(

            field.color,

            function (value) {

                field.color =
                    value;


                colorDot.className =
                    'summary-color color-' +
                    value;


                colorDot.title =
                    getColorLabel(
                        value
                    );

            }

        );


    colorGroup.appendChild(
        colorSelect
    );


    grid.appendChild(
        colorGroup
    );


    body.appendChild(
        grid
    );


    // =====================
    // KATEGORIE-AKTIONEN
    // =====================

    var fieldActions =
        document.createElement(
            'div'
        );


    fieldActions.className =
        'field-actions';


    var moveUp =
        createActionButton(

            '↑ Nach oben',

            'Kategorie nach oben',

            function () {

                if (
                    moveItem(
                        schema.fields,
                        index,
                        -1
                    )
                ) {

                    openState[field.id] =
                        true;


                    render();


                    markDirty(
                        'Kategorie verschoben'
                    );

                }

            }

        );


    var moveDown =
        createActionButton(

            '↓ Nach unten',

            'Kategorie nach unten',

            function () {

                if (
                    moveItem(
                        schema.fields,
                        index,
                        1
                    )
                ) {

                    openState[field.id] =
                        true;


                    render();


                    markDirty(
                        'Kategorie verschoben'
                    );

                }

            }

        );


    var remove =
        createActionButton(

            'Kategorie entfernen',

            'Kategorie entfernen',

            function () {

                var confirmed =
                    window.confirm(

                        'Kategorie "' +
                        (
                            field.label ||
                            'Neue Kategorie'
                        ) +
                        '" wirklich entfernen?\n\n' +

                        'Bereits gespeicherte Kartenwerte bleiben erhalten.'

                    );


                if (!confirmed) {
                    return;
                }


                delete openState[
                    field.id
                ];


                schema.fields.splice(
                    index,
                    1
                );


                render();


                markDirty(
                    'Kategorie entfernt'
                );

            }

        );


    fieldActions.appendChild(
        moveUp
    );


    fieldActions.appendChild(
        moveDown
    );


    fieldActions.appendChild(
        remove
    );


    body.appendChild(
        fieldActions
    );


    // OPTIONS

    if (
        field.type ===
        'select'
    ) {

        renderOptions(
            field,
            body
        );

    }


    details.appendChild(
        body
    );


    fieldsContainer.appendChild(
        details
    );

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
// VALIDIERUNG
// =========================

function validateSchema() {

    var fieldNames =
        {};


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
            field.type ===
            'select'
        ) {

            var optionNames =
                {};


            for (
                var x = 0;
                x < field.options.length;
                x++
            ) {

                var option =
                    field.options[x];


                option.label =
                    option.label.trim();


                if (
                    !option.label
                ) {

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
// STORAGE SIZE
// =========================

function getEncodedSchema() {

    return ctEncodeSchema(
        schema
    );

}


function getStorageSize() {

    var encoded =
        getEncodedSchema();


    /*
     * Wir setzen beim Speichern gleichzeitig
     * das alte ctConfig auf leer.
     */
    return JSON.stringify({

        ctConfig: '',

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
        ' / 4096 Zeichen';


    sizeInfo.className =
        'size-info';


    if (
        size > 3500
    ) {

        sizeInfo.classList.add(
            'warning-size'
        );

    }


    if (
        size > 3900
    ) {

        sizeInfo.classList.remove(
            'warning-size'
        );


        sizeInfo.classList.add(
            'error-size'
        );

    }

}


// =========================
// NEUE KATEGORIE
// =========================

addFieldButton.addEventListener(
    'click',
    function () {

        var newField = {

            id:
                createId(
                    'field'
                ),

            label:
                'Neue Kategorie',

            type:
                'text',

            color:
                'light-gray',

            options:
                []

        };


        schema.fields.push(
            newField
        );


        openState[
            newField.id
        ] = true;


        render();


        markDirty(
            'Kategorie hinzugefügt'
        );

    }
);


// =========================
// STANDARDWERTE
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


        openState =
            {};


        render();


        markDirty(
            'Standardwerte geladen – noch nicht gespeichert'
        );

    }
);


// =========================
// SAVE SUCCESS
// =========================

function finishSaveSuccess(
    operationId
) {

    if (
        operationId !==
        saveOperation
    ) {

        return;

    }


    isDirty =
        false;


    setStatus(
        'Einstellungen gespeichert ✓',
        'success'
    );


    setSaveButtonState(
        'saved'
    );


    updateSizeInfo();

}


// =========================
// SAVE ERROR
// =========================

function finishSaveError(
    operationId,
    message,
    error
) {

    if (
        operationId !==
        saveOperation
    ) {

        return;

    }


    if (error) {

        console.error(
            'CT Fields Settings Save Error:',
            error
        );

    }


    setStatus(
        message ||
        'Fehler beim Speichern.',
        'error'
    );


    setSaveButtonState(
        isDirty
            ? 'dirty'
            : 'default'
    );

}


// =========================
// SPEICHERN
// =========================

saveButton.addEventListener(
    'click',
    function () {

        // -------------------------
        // Rechte
        // -------------------------

        if (
            !t.memberCanWriteToModel(
                'board'
            )
        ) {

            setStatus(
                'Keine Schreibberechtigung für dieses Board.',
                'error'
            );

            return;

        }


        // -------------------------
        // Validierung
        // -------------------------

        var validation =
            validateSchema();


        if (
            !validation.valid
        ) {

            setStatus(
                validation.message,
                'error'
            );

            return;

        }


        var encoded =
            getEncodedSchema();


        var size =
            JSON.stringify({

                ctConfig: '',

                ctSchema:
                    encoded

            }).length;


        if (
            size > 3900
        ) {

            setStatus(

                'Die Konfiguration ist zu groß (' +
                size +
                ' Zeichen).',

                'error'

            );

            return;

        }


        // -------------------------
        // UI
        // -------------------------

        saveOperation++;


        var operationId =
            saveOperation;


        setSaveButtonState(
            'saving'
        );


        setStatus(
            'Speichere Einstellungen...',
            'info'
        );


        /*
         * Watchdog:
         *
         * Selbst falls ein Trello-Promise aus irgendeinem
         * Grund hängen bleibt, steht der Button nicht
         * für immer auf "Speichere...".
         */

        var watchdog =
            setTimeout(
                function () {

                    if (
                        operationId !==
                        saveOperation
                    ) {

                        return;

                    }


                    /*
                     * Alte Promise-Kette ungültig machen.
                     */
                    saveOperation++;


                    setStatus(
                        'Speichern dauert zu lange. Bitte erneut versuchen.',
                        'error'
                    );


                    setSaveButtonState(
                        'dirty'
                    );

                },
                7000
            );


        /*
         * WICHTIG:
         *
         * Früher hatten wir "ctConfig".
         * Trello speichert board/shared als EINEN
         * gemeinsamen JSON-Blob.
         *
         * Wir setzen deshalb ctConfig und ctSchema
         * in EINEM t.set()-Aufruf.
         *
         * Dadurch wird ein eventuell noch vorhandenes,
         * großes ctConfig sofort auf einen leeren String
         * reduziert, während ctSchema gespeichert wird.
         */

        t.set(
            'board',
            'shared',

            {
                ctConfig: '',

                ctSchema:
                    encoded
            }

        ).then(function () {

            /*
             * Nach dem Setzen direkt wieder aus Trello lesen.
             */
            return t.get(
                'board',
                'shared',
                'ctSchema',
                null
            );

        }).then(function (
            savedSchema
        ) {

            clearTimeout(
                watchdog
            );


            if (
                operationId !==
                saveOperation
            ) {

                return;

            }


            if (
                JSON.stringify(
                    savedSchema
                ) !==
                JSON.stringify(
                    encoded
                )
            ) {

                throw new Error(
                    'Gespeicherte Konfiguration stimmt nicht mit der lokalen Konfiguration überein.'
                );

            }


            finishSaveSuccess(
                operationId
            );


            /*
             * Legacy-Key danach aufräumen.
             * Ist für den eigentlichen Save nicht mehr kritisch.
             */
            t.remove(
                'board',
                'shared',
                'ctConfig'
            ).catch(function (
                error
            ) {

                console.warn(
                    'Legacy ctConfig konnte nicht entfernt werden:',
                    error
                );

            });

        }).catch(function (
            error
        ) {

            clearTimeout(
                watchdog
            );


            finishSaveError(
                operationId,
                'Fehler beim Speichern.',
                error
            );

        });

    }
);


// =========================
// INITIAL LADEN
// =========================

setStatus(
    'Lade Einstellungen...',
    'info'
);


t.get(
    'board',
    'shared',
    'ctSchema',
    null

).then(function (
    rawSchema
) {

    schema =
        ctDecodeSchema(
            rawSchema
        );


    render();


    isDirty =
        false;


    setStatus(
        'Bereit',
        'neutral'
    );


    setSaveButtonState(
        'default'
    );

}).catch(function (
    error
) {

    console.error(
        'CT Fields Settings Load Error:',
        error
    );


    schema =
        ctGetDefaultSchema();


    render();


    setStatus(
        'Gespeicherte Einstellungen konnten nicht geladen werden.',
        'error'
    );

});
