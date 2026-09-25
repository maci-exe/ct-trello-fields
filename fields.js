var t = window.TrelloPowerUp.iframe();


// =========================
// ELEMENTE
// =========================

var unit = document.getElementById('unit');
var rank = document.getElementById('rank');
var position = document.getElementById('position');
var adjutant = document.getElementById('adjutant');

var promotion = document.getElementById('promotion');
var testUntil = document.getElementById('testUntil');
var ctId = document.getElementById('ctId');

var status = document.getElementById('status');

var loaded = false;
var canWrite = false;


// =========================
// FARBFUNKTION
// =========================

function setColor(element, color) {

    var classes = [
        'color-neutral',
        'color-red',
        'color-blue',
        'color-green',
        'color-purple',
        'color-orange',
        'color-yellow',
        'color-sky',
        'color-lime',
        'color-gray'
    ];

    classes.forEach(function (className) {
        element.classList.remove(className);
    });

    element.classList.add(
        color ? 'color-' + color : 'color-neutral'
    );
}


// =========================
// UNTEREINHEIT
// =========================

function getUnitColor(value) {

    var colors = {

        'Muunilinst 10': 'blue',

        'Rancor Battalion': 'red',

        'Tactical Combat Instructor': 'green'

    };

    return colors[value] || 'neutral';
}


// =========================
// RANG
// =========================

function getRankColor(value) {

    var colors = {

        'Private First Class': 'gray',

        'Lance Corporal': 'purple',
        'Corporal': 'purple',

        'Sergeant': 'green',
        'Staff Sergeant': 'green',
        'Sergeant Major': 'green',

        'Lieutenant': 'blue',
        'First Lieutenant': 'blue',

        'Captain': 'red',

        'Major': 'orange',

        'Commander': 'yellow',

        'High General': 'purple'

    };

    return colors[value] || 'neutral';
}


// =========================
// POSITION
// =========================

function getPositionColor(value) {

    var colors = {

        'Mannschaft': 'purple',

        'Unteroffizierebene': 'green',

        'Führungsebene': 'blue',

        'Hohe Führungsebene': 'red'

    };

    return colors[value] || 'neutral';
}


// =========================
// ADJUTANT
// =========================

function getAdjutantColor(value) {

    var colors = {

        '5th': 'sky',

        '41st': 'green',

        '104th': 'gray',

        '187th': 'purple',

        '212th': 'orange',

        '501st': 'blue',

        'CTP': 'lime',

        'GMC': 'purple',

        'RMC': 'red',

        'SO': 'sky',

        'ST': 'red'

    };

    return colors[value] || 'neutral';
}


// =========================
// ALLE FARBEN AKTUALISIEREN
// =========================

function updateColors() {

    setColor(
        unit,
        getUnitColor(unit.value)
    );

    setColor(
        rank,
        getRankColor(rank.value)
    );

    setColor(
        position,
        getPositionColor(position.value)
    );

    setColor(
        adjutant,
        getAdjutantColor(adjutant.value)
    );


    // feste Farben

    setColor(
        promotion,
        promotion.value ? 'red' : 'neutral'
    );

    setColor(
        testUntil,
        testUntil.value ? 'yellow' : 'neutral'
    );

    setColor(
        ctId,
        ctId.value ? 'gray' : 'neutral'
    );
}


// =========================
// FORMULARDATEN
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

    if (!loaded || !canWrite) {
        return;
    }

    updateColors();

    status.textContent = 'Speichere...';

    return t.set(

        'card',

        'shared',

        'characterData',

        getFormData()

    ).then(function () {

        status.textContent = 'Gespeichert';

    }).catch(function (error) {

        console.error(error);

        status.textContent =
            'Fehler beim Speichern';

    });

}


// =========================
// EVENTS
// =========================

unit.addEventListener('change', saveData);

rank.addEventListener('change', saveData);

position.addEventListener('change', saveData);

adjutant.addEventListener('change', saveData);

promotion.addEventListener('change', saveData);

testUntil.addEventListener('change', saveData);

ctId.addEventListener('change', saveData);


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


    var context =
        t.getContext();


    canWrite = !!(

        context.permissions &&

        (
            context.permissions.card === 'write' ||
            context.permissions.board === 'write'
        )

    );


    return t.get(

        'card',

        'shared',

        'characterData',

        {}

    ).then(function (data) {

        data = data || {};


        unit.value =
            data.unit || '';

        rank.value =
            data.rank || '';

        position.value =
            data.position || '';

        adjutant.value =
            data.adjutant || '';

        promotion.value =
            data.promotion || '';

        testUntil.value =
            data.testUntil || '';

        ctId.value =
            data.ctId || '';


        updateColors();


        var controls =
            document.querySelectorAll(
                'select, input'
            );


        controls.forEach(
            function (control) {

                control.disabled =
                    !canWrite;

            }
        );


        status.textContent =
            canWrite
                ? 'Änderungen werden automatisch gespeichert.'
                : 'Nur-Lese-Ansicht';


        loaded = true;

    });

});
