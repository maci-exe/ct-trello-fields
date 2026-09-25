var t = window.TrelloPowerUp.iframe();


// =========================
// ELEMENTE
// =========================

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


// =========================
// DATEN AUS FORMULAR
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


    status.textContent =
        'Speichere...';


    return t.set(

        'card',

        'shared',

        'characterData',

        getFormData()

    ).catch(function (error) {

        console.error(error);

        status.textContent =
            'Fehler beim Speichern';

    });

}


// =========================
// DROPDOWNS
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


// =========================
// DATUM
// =========================

promotion.addEventListener(
    'change',
    saveData
);

testUntil.addEventListener(
    'change',
    saveData
);


// =========================
// ID
// =========================

// Wird gespeichert,
// wenn das Feld verlassen wird.

ctId.addEventListener(
    'change',
    saveData
);


// Enter speichert ebenfalls

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
// DATEN LADEN
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


        // =====================
        // BERECHTIGUNGEN
        // =====================

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


        if (canWrite) {

            status.textContent =
                'Änderungen werden automatisch gespeichert.';

        } else {

            status.textContent =
                'Nur-Lese-Ansicht';

        }


        loaded = true;


        return t.sizeTo(
            '#ctFields'
        );

    });

});
