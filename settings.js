var t =
    window.TrelloPowerUp.iframe();

var fieldsContainer =
    document.getElementById('fieldsContainer');

var addFieldButton =
    document.getElementById('addFieldButton');

var defaultsButton =
    document.getElementById('defaultsButton');

var saveButton =
    document.getElementById('saveButton');

var status =
    document.getElementById('status');

var sizeInfo =
    document.getElementById('sizeInfo');

var schema =
    ctGetDefaultSchema();

var counter = 0;
var isDirty = false;
var openState = {};
var saveButtonTimer = null;


// =========================
// HILFSFUNKTIONEN
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


function getTypeLabel(type) {

    if (type === 'select') return 'Auswahl';
    if (type === 'date') return 'Datum';
    return 'Text';
}


function getColorLabel(colorValue) {

    var match =
        CT_COLOR_OPTIONS.find(function (item) {
            return item.value === colorValue;
        });

    return match ? match.label : colorValue;
}


function setStatus(message, type) {

    status.textContent = message;

    status.className = 'status-pill';

    if (!type) {
        status.classList.add('status-neutral');
        return;
    }

    status.classList.add('status-' + type);
}


function setSaveButtonState(state) {

    clearTimeout(saveButtonTimer);

    saveButton.disabled = false;
    saveButton.classList.remove('mod-primary');

    if (state === 'saving') {
        saveButton.textContent = 'Speichere...';
        saveButton.disabled = true;
        saveButton.classList.add('mod-primary');
        return;
    }

    if (state === 'saved') {
        saveButton.textContent = 'Gespeichert ✓';
        saveButton.classList.add('mod-primary');

        saveButtonTimer = setTimeout(function () {
            setSaveButtonState(isDirty ? 'dirty' : 'default');
        }, 1800);

        return;
    }

    if (state === 'dirty') {
        saveButton.textContent = 'Änderungen speichern';
        saveButton.classList.add('mod-primary');
        return;
    }

    saveButton.textContent = 'Einstellungen speichern';
    saveButton.classList.add('mod-primary');
}


function markDirty(message) {

    isDirty = true;

    setSaveButtonState('dirty');

    setStatus(
        message || 'Ungespeicherte Änderungen',
        'warning'
    );

    updateSizeInfo();
}


function createColorSelect(currentColor, callback) {

    var select =
        document.createElement('select');

    CT_COLOR_OPTIONS.forEach(function (color) {

        var option =
            document.createElement('option');

        option.value = color.value;
        option.textContent = color.label;

        if (color.value === currentColor) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    select.addEventListener('change', function () {
        callback(select.value);
    });

    return select;
}


function moveItem(array, index, direction) {

    var newIndex =
        index + direction;

    if (newIndex < 0 || newIndex >= array.length) {
        return;
    }

    var temp = array[index];
    array[index] = array[newIndex];
    array[newIndex] = temp;
}


// =========================
// OPTIONEN
// =========================

function renderOptions(field, container) {

    var panel =
        document.createElement('div');

    panel.className =
        'options-panel';


    var head =
        document.createElement('div');

    head.className =
        'options-head';

    head.innerHTML =
        '<div>' +
            '<h3>Auswahloptionen</h3>' +
            '<p>Diese Optionen gehören zu "' + escapeHtml(field.label || 'Neue Kategorie') + '".</p>' +
        '</div>';

    var addOptionButton =
        document.createElement('button');

    addOptionButton.type = 'button';
    addOptionButton.textContent = '+ Auswahloption';

    addOptionButton.addEventListener('click', function () {

        field.options.push({
            id: createId('option'),
            label: 'Neue Option',
            color: 'light-gray'
        });

        openState[field.id] = true;
        render();
        markDirty('Auswahloption hinzugefügt');
    });

    head.appendChild(addOptionButton);
    panel.appendChild(head);


    var list =
        document.createElement('div');

    list.className =
        'option-list';


    field.options.forEach(function (option, index) {

        var row =
            document.createElement('div');

        row.className =
            'option-row';


        var nameInput =
            document.createElement('input');

        nameInput.type = 'text';
        nameInput.value = option.label;

        nameInput.addEventListener('input', function () {
            option.label = nameInput.value;
            markDirty();
        });


        var colorSelect =
            createColorSelect(option.color, function (value) {
                option.color = value;
                markDirty();
            });


        var actions =
            document.createElement('div');

        actions.className =
            'actions';


        var up =
            document.createElement('button');

        up.type = 'button';
        up.textContent = '↑';

        up.addEventListener('click', function () {
            moveItem(field.options, index, -1);
            openState[field.id] = true;
            render();
            markDirty('Auswahloption verschoben');
        });


        var down =
            document.createElement('button');

        down.type = 'button';
        down.textContent = '↓';

        down.addEventListener('click', function () {
            moveItem(field.options, index, 1);
            openState[field.id] = true;
            render();
            markDirty('Auswahloption verschoben');
        });


        var remove =
            document.createElement('button');

        remove.type = 'button';
        remove.textContent = '✕';

        remove.addEventListener('click', function () {
            field.options.splice(index, 1);
            openState[field.id] = true;
            render();
            markDirty('Auswahloption entfernt');
        });


        actions.appendChild(up);
        actions.appendChild(down);
        actions.appendChild(remove);

        row.appendChild(nameInput);
        row.appendChild(colorSelect);
        row.appendChild(actions);

        list.appendChild(row);
    });

    panel.appendChild(list);
    container.appendChild(panel);
}


// =========================
// KATEGORIE
// =========================

function renderField(field, index) {

    var details =
        document.createElement('details');

    details.className =
        'field-card';

    details.open =
        openState[field.id] !== undefined
            ? openState[field.id]
            : index === 0;


    details.addEventListener('toggle', function () {
        openState[field.id] = details.open;
    });


    var summary =
        document.createElement('summary');

    summary.className =
        'field-summary';


    var summaryLeft =
        document.createElement('div');

    summaryLeft.className =
        'summary-left';


    var summaryTitle =
        document.createElement('div');

    summaryTitle.className =
        'summary-title';

    summaryTitle.textContent =
        field.label || 'Neue Kategorie';


    var summaryMeta =
        document.createElement('div');

    summaryMeta.className =
        'summary-meta';


    var typePill =
        document.createElement('span');

    typePill.className =
        'meta-pill';

    typePill.textContent =
        getTypeLabel(field.type);

    summaryMeta.appendChild(typePill);


    if (field.type === 'select') {

        var countPill =
            document.createElement('span');

        countPill.className =
            'meta-pill';

        countPill.textContent =
            (field.options || []).length + ' Optionen';

        summaryMeta.appendChild(countPill);
    }


    summaryLeft.appendChild(summaryTitle);
    summaryLeft.appendChild(summaryMeta);


    var summaryRight =
        document.createElement('div');

    summaryRight.className =
        'summary-right';


    var colorDot =
        document.createElement('span');

    colorDot.className =
        'summary-color color-' + (field.color || 'light-gray');

    colorDot.title =
        'Feldfarbe: ' + getColorLabel(field.color || 'light-gray');


    var chevron =
        document.createElement('span');

    chevron.className =
        'summary-chevron';

    chevron.textContent =
        '›';

    summaryRight.appendChild(colorDot);
    summaryRight.appendChild(chevron);


    summary.appendChild(summaryLeft);
    summary.appendChild(summaryRight);

    details.appendChild(summary);


    var body =
        document.createElement('div');

    body.className =
        'field-body';


    var grid =
        document.createElement('div');

    grid.className =
        'field-grid';


    // Bezeichnung
    var nameGroup =
        createGroup('Bezeichnung');

    var nameInput =
        document.createElement('input');

    nameInput.type = 'text';
    nameInput.value = field.label;

    nameInput.addEventListener('input', function () {
        field.label = nameInput.value;
        summaryTitle.textContent = field.label || 'Neue Kategorie';
        markDirty();
    });

    nameGroup.appendChild(nameInput);
    grid.appendChild(nameGroup);


    // Typ
    var typeGroup =
        createGroup('Feldtyp');

    var typeSelect =
        document.createElement('select');

    [
        ['select', 'Auswahl'],
        ['text', 'Text'],
        ['date', 'Datum']
    ].forEach(function (entry) {

        var option =
            document.createElement('option');

        option.value = entry[0];
        option.textContent = entry[1];

        if (entry[0] === field.type) {
            option.selected = true;
        }

        typeSelect.appendChild(option);
    });

    typeSelect.addEventListener('change', function () {

        field.type = typeSelect.value;

        if (!Array.isArray(field.options)) {
            field.options = [];
        }

        openState[field.id] = true;
        render();
        markDirty('Feldtyp geändert');
    });

    typeGroup.appendChild(typeSelect);
    grid.appendChild(typeGroup);


    // Farbe
    var colorGroup =
        createGroup(field.type === 'select' ? 'Fallbackfarbe' : 'Feldfarbe');

    var colorSelect =
        createColorSelect(field.color, function (value) {
            field.color = value;
            colorDot.className = 'summary-color color-' + value;
            colorDot.title = 'Feldfarbe: ' + getColorLabel(value);
            markDirty();
        });

    colorGroup.appendChild(colorSelect);
    grid.appendChild(colorGroup);


    body.appendChild(grid);


    // Aktionen
    var fieldActions =
        document.createElement('div');

    fieldActions.className =
        'field-actions';


    var up =
        document.createElement('button');

    up.type = 'button';
    up.textContent = '↑ Nach oben';

    up.addEventListener('click', function () {
        moveItem(schema.fields, index, -1);
        openState[field.id] = true;
        render();
        markDirty('Kategorie verschoben');
    });


    var down =
        document.createElement('button');

    down.type = 'button';
    down.textContent = '↓ Nach unten';

    down.addEventListener('click', function () {
        moveItem(schema.fields, index, 1);
        openState[field.id] = true;
        render();
        markDirty('Kategorie verschoben');
    });


    var remove =
        document.createElement('button');

    remove.type = 'button';
    remove.textContent = 'Kategorie entfernen';

    remove.addEventListener('click', function () {

        var confirmed =
            window.confirm(
                'Kategorie "' +
                (field.label || 'Neue Kategorie') +
                '" wirklich entfernen?\n\n' +
                'Bereits gespeicherte Kartenwerte bleiben erhalten.'
            );

        if (!confirmed) {
            return;
        }

        delete openState[field.id];
        schema.fields.splice(index, 1);
        render();
        markDirty('Kategorie entfernt');
    });

    fieldActions.appendChild(up);
    fieldActions.appendChild(down);
    fieldActions.appendChild(remove);

    body.appendChild(fieldActions);


    if (field.type === 'select') {
        renderOptions(field, body);
    }

    details.appendChild(body);

    fieldsContainer.appendChild(details);
}


// =========================
// UI HILFSFUNKTIONEN
// =========================

function createGroup(labelText) {

    var wrapper =
        document.createElement('div');

    wrapper.className =
        'group';

    var label =
        document.createElement('label');

    label.textContent =
        labelText;

    wrapper.appendChild(label);

    return wrapper;
}


function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}


// =========================
// RENDER
// =========================

function render() {

    fieldsContainer.innerHTML = '';

    schema.fields.forEach(renderField);

    updateSizeInfo();
}


// =========================
// VALIDIERUNG
// =========================

function validateSchema() {

    var fieldNames = {};

    for (var i = 0; i < schema.fields.length; i++) {

        var field = schema.fields[i];

        field.label = field.label.trim();

        if (!field.label) {
            return {
                valid: false,
                message: 'Eine Kategorie hat keinen Namen.'
            };
        }

        var normalizedField =
            field.label.toLowerCase();

        if (fieldNames[normalizedField]) {
            return {
                valid: false,
                message: 'Doppelte Kategorie: ' + field.label
            };
        }

        fieldNames[normalizedField] = true;

        if (field.type === 'select') {

            var optionNames = {};

            for (var x = 0; x < field.options.length; x++) {

                var option = field.options[x];

                option.label = option.label.trim();

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

                if (optionNames[normalizedOption]) {
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

                optionNames[normalizedOption] = true;
            }
        }
    }

    return { valid: true };
}


// =========================
// SPEICHERGRÖSSE
// =========================

function getStorageSize() {

    var encoded =
        ctEncodeSchema(schema);

    return JSON.stringify({
        ctSchema: encoded
    }).length;
}


function updateSizeInfo() {

    var size =
        getStorageSize();

    sizeInfo.textContent =
        'Konfigurationsgröße: ' +
        size +
        ' / ca. 4096 Zeichen';

    sizeInfo.className = 'size-info';

    if (size > 3600) {
        sizeInfo.classList.add('warning-size');
    }

    if (size > 3900) {
        sizeInfo.classList.remove('warning-size');
        sizeInfo.classList.add('error-size');
    }
}


// =========================
// EVENTS
// =========================

addFieldButton.addEventListener('click', function () {

    var newField = {
        id: createId('field'),
        label: 'Neue Kategorie',
        type: 'text',
        color: 'light-gray',
        options: []
    };

    schema.fields.push(newField);
    openState[newField.id] = true;

    render();
    markDirty('Kategorie hinzugefügt');
});


defaultsButton.addEventListener('click', function () {

    var confirmed =
        window.confirm(
            'Standardwerte laden?\n\n' +
            'Sie werden erst übernommen, wenn du anschließend speicherst.'
        );

    if (!confirmed) {
        return;
    }

    schema = ctGetDefaultSchema();
    openState = {};

    render();
    markDirty('Standardwerte geladen – noch nicht gespeichert');
});


function waitWithTimeout(promise, milliseconds) {

    return Promise.race([
        promise,

        new Promise(function (_, reject) {

            setTimeout(function () {
                reject(new Error('timeout'));
            }, milliseconds);

        })
    ]);
}


function finishSaveSuccess() {

    isDirty = false;

    setStatus(
        'Einstellungen gespeichert ✓',
        'success'
    );

    setSaveButtonState('saved');

    updateSizeInfo();
}


saveButton.addEventListener('click', async function () {

    if (!t.memberCanWriteToModel('board')) {

        setStatus(
            'Keine Schreibberechtigung.',
            'error'
        );

        return;
    }


    var validation =
        validateSchema();


    if (!validation.valid) {

        setStatus(
            validation.message,
            'error'
        );

        return;
    }


    var encoded =
        ctEncodeSchema(schema);


    var size =
        JSON.stringify({
            ctSchema: encoded
        }).length;


    if (size > 3900) {

        setStatus(
            'Die Konfiguration ist zu groß.',
            'error'
        );

        return;
    }


    setSaveButtonState('saving');

    setStatus(
        'Speichere Einstellungen...',
        'info'
    );


    try {

        try {

            // Normal speichern.
            // Maximal 3 Sekunden auf Promise warten.

            await waitWithTimeout(

                t.set(
                    'board',
                    'shared',
                    'ctSchema',
                    encoded
                ),

                3000

            );


            finishSaveSuccess();

        } catch (error) {

            if (error.message !== 'timeout') {
                throw error;
            }


            // Falls Trello die Daten gespeichert hat,
            // aber das Promise nicht sauber zurückkommt:
            // Wert erneut lesen und vergleichen.

            setStatus(
                'Prüfe Speicherung...',
                'info'
            );


            var savedSchema =
                await waitWithTimeout(

                    t.get(
                        'board',
                        'shared',
                        'ctSchema',
                        null
                    ),

                    3000

                );


            if (
                JSON.stringify(savedSchema) ===
                JSON.stringify(encoded)
            ) {

                finishSaveSuccess();

            } else {

                throw new Error(
                    'Speicherung konnte nicht bestätigt werden.'
                );
            }

        }

    } catch (error) {

        console.error(error);

        setStatus(
            'Fehler beim Speichern.',
            'error'
        );

        setSaveButtonState(
            isDirty ? 'dirty' : 'default'
        );
    }

});


// =========================
// INITIAL LADEN
// =========================

t.get(
    'board',
    'shared',
    'ctSchema',
    null
).then(function (rawSchema) {

    schema =
        ctDecodeSchema(rawSchema);

    render();
    updateSizeInfo();
    setStatus('Bereit', 'neutral');
    setSaveButtonState('default');
});
