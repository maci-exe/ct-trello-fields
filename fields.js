var t =
    window.TrelloPowerUp.iframe();


var unit =
    document.getElementById('unit');

var rank =
    document.getElementById('rank');

var position =
    document.getElementById('position');

var adjutant =
    document.getElementById('adjutant');

var promotion =
    document.getElementById('promotion');

var testUntil =
    document.getElementById('testUntil');

var ctId =
    document.getElementById('ctId');

var status =
    document.getElementById('status');


var loaded = false;
var canWrite = false;

var config =
    ctGetDefaultConfig();


// =========================
// DROPDOWN BAUEN
// =========================

function buildSelect(
    element,
    items,
    emptyText
) {

    element.innerHTML = '';


    var empty =
        document.createElement('option');

    empty.value = '';
    empty.textContent = emptyText;

    element.appendChild(empty);


    items.forEach(function (item) {

        var option =
            document.createElement('option');

        option.value =
            item.id;

        option.textContent =
            item.label;

        element.appendChild(option);

    });

}


// =========================
// ALTEN / NEUEN WERT SETZEN
// =========================

function setStoredValue(
    element,
    section,
    storedValue
) {

    if (!storedValue) {

        element.value = '';
        return;

    }


    var item =
        ctFindItem(
            config,
            section,
            storedValue
        );


    if (item) {

        element.value =
            item.id;

        return;

    }


    // Falls eine Option später gelöscht wurde,
    // verlieren wir den gespeicherten Wert nicht.

    var legacy =
        document.createElement('option');

    legacy.value =
        storedValue;

    legacy.textContent =
        storedValue + ' (Altwert)';

    element.appendChild(legacy);

    element.value =
        storedValue;
}


// =========================
// FARBE
// =========================

function setColor(
    element,
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


    colors.forEach(function (value) {

        element.classList.remove(
            'color-' + value
        );

    });


    element.classList.add(
        'color-' +
        (color || 'light-gray')
    );

}


// =========================
// FARBEN AKTUALISIEREN
// =========================

function updateColors() {

    setColor(
        unit,
        ctGetChoiceColor(
            config,
            'units',
            unit.value
        )
    );


    setColor(
        rank,
        ctGetChoiceColor(
            config,
            'ranks',
            rank.value
        )
    );


    setColor(
        position,
        ctGetChoiceColor(
            config,
            'positions',
            position.value
        )
    );


    setColor(
        adjutant,
        ctGetChoiceColor(
            config,
            'adjutants',
            adjutant.value
        )
    );


    setColor(
        promotion,
        promotion.value
            ? config.fixedColors.promotion
            : 'light-gray'
    );


    setColor(
        testUntil,
        testUntil.value
            ? config.fixedColors.testUntil
            : 'light-gray'
    );


    setColor(
        ctId,
        ctId.value
            ? config.fixedColors.ctId
            : 'light-gray'
    );

}


// =========================
// DATEN HOLEN
// =========================

function getFormData() {

    return {

        unit:
            unit.value,

        rank:
            rank.value,

        position:
            position.value,

        adjutant:
            adjutant.value,

        promotion:
            promotion.value,

        testUntil:
            testUntil.value,

        ctId:
            ctId.value.trim()

    };

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


    updateColors();

    status.textContent =
        'Speichere...';


    return t.set(

        'card',

        'shared',

        'characterData',

        getFormData()

    ).then(function () {

        status.textContent =
            'Gespeichert';

    }).catch(function (error) {

        console.error(error);

        status.textContent =
            'Fehler beim Speichern';

    });

}


// =========================
// EVENTS
// =========================

unit.addEventListener(
    'change',
    saveData
);

rank.addEventListener(
    'change',
    saveData
);

position.addEventListener(
    'change',
    saveData
);

adjutant.addEventListener(
    'change',
    saveData
);

promotion.addEventListener(
    'change',
    saveData
);

testUntil.addEventListener(
    'change',
    saveData
);

ctId.addEventListener(
    'change',
    saveData
);

ctId.addEventListener(
    'input',
    updateColors
);


ctId.addEventListener(
    'keydown',
    function (event) {

        if (event.key === 'Enter') {

            event.preventDefault();
            ctId.blur();

        }

    }
);


// =========================
// LADEN
// =========================

t.render(function () {

    loaded = false;

    canWrite =
        t.memberCanWriteToModel('card');


    return Promise.all([

        t.get(
            'board',
            'shared',
            'ctConfig',
            null
        ),

        t.get(
            'card',
            'shared',
            'characterData',
            {}
        )

    ]).then(function (values) {

        config =
            ctNormalizeConfig(
                values[0]
            );


        var data =
            values[1] || {};


        // Dropdowns dynamisch bauen

        buildSelect(
            unit,
            config.units,
            '-- Keine Untereinheit --'
        );

        buildSelect(
            rank,
            config.ranks,
            '-- Kein Rang --'
        );

        buildSelect(
            position,
            config.positions,
            '-- Keine Position --'
        );

        buildSelect(
            adjutant,
            config.adjutants,
            '-- Kein Adjutant --'
        );


        // gespeicherte Daten laden

        setStoredValue(
            unit,
            'units',
            data.unit
        );

        setStoredValue(
            rank,
            'ranks',
            data.rank
        );

        setStoredValue(
            position,
            'positions',
            data.position
        );

        setStoredValue(
            adjutant,
            'adjutants',
            data.adjutant
        );


        promotion.value =
            data.promotion || '';

        testUntil.value =
            data.testUntil || '';

        ctId.value =
            data.ctId || '';


        updateColors();


        document
            .querySelectorAll(
                'select, input'
            )
            .forEach(function (control) {

                control.disabled =
                    !canWrite;

            });


        status.textContent =
            canWrite
                ? 'Änderungen werden automatisch gespeichert.'
                : 'Nur-Lese-Ansicht';


        loaded = true;


        return t.sizeTo(
            '#ctFields'
        );

    });

});
