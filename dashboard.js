var t =
    window.TrelloPowerUp.iframe();


// ======================================================
// AUSGEWERTETE TRELLO-LISTEN
// ======================================================

var MONITORED_LISTS = [

    'private first class',

    'lance corporal',

    'corporal',

    'sergeant',

    'staff sergeant',

    'sergeant major',

    'lieutenant',

    'first lieutenant',

    'captain',

    'major'

];


// ======================================================
// MITGLIEDER-LISTEN
// ======================================================

/*
 * Private First Class wird überall geprüft,
 * aber NICHT bei "Mitglieder gesamt"
 * mitgezählt.
 */

var MEMBER_LISTS =
    MONITORED_LISTS.filter(
        function (name) {

            return (
                name !==
                'private first class'
            );

        }
    );


// ======================================================
// DOM
// ======================================================

var loading =
    document.getElementById(
        'loading'
    );


var dashboard =
    document.getElementById(
        'dashboard'
    );


var errorBox =
    document.getElementById(
        'error'
    );


var refreshButton =
    document.getElementById(
        'refreshButton'
    );


var memberCount =
    document.getElementById(
        'memberCount'
    );


var testCount =
    document.getElementById(
        'testCount'
    );


var incompleteCount =
    document.getElementById(
        'incompleteCount'
    );


var plausibilityCount =
    document.getElementById(
        'plausibilityCount'
    );


var rankDistribution =
    document.getElementById(
        'rankDistribution'
    );


var testRunningCount =
    document.getElementById(
        'testRunningCount'
    );


var testSoonCount =
    document.getElementById(
        'testSoonCount'
    );


var testExpiredCount =
    document.getElementById(
        'testExpiredCount'
    );


var testRows =
    document.getElementById(
        'testRows'
    );


var issueRows =
    document.getElementById(
        'issueRows'
    );


var duplicateRows =
    document.getElementById(
        'duplicateRows'
    );


// ======================================================
// HELPER
// ======================================================

function normalizeListName(name) {

    return String(name || '')

        .replace(
            /↓/g,
            ''
        )

        .replace(
            /\s+/g,
            ' '
        )

        .trim()

        .toLowerCase();
}


function getStoredValues(data) {

    if (
        data &&
        data.v === 2 &&
        data.values
    ) {

        return data.values;

    }


    return data || {};
}


function getField(
    schema,
    id
) {

    if (
        !schema ||
        !Array.isArray(
            schema.fields
        )
    ) {

        return null;

    }


    return schema.fields.find(
        function (field) {

            return (
                field.id === id
            );

        }
    ) || null;
}


function hasValue(value) {

    return (

        value !== null &&

        value !== undefined &&

        String(value)
            .trim()
            .length > 0

    );
}


// ======================================================
// PLAUSIBILITÄT
// ======================================================

function hasPlausibilityError(
    schema,
    values,
    listName
) {

    /*
     * RANG -> POSITION
     */

    var positionRules = {

        'private-first-class':
            'mannschaft',

        'lance-corporal':
            'mannschaft',

        'corporal':
            'mannschaft',


        'sergeant':
            'unteroffizierebene',

        'staff-sergeant':
            'unteroffizierebene',

        'sergeant-major':
            'unteroffizierebene',


        'lieutenant':
            'fuehrungsebene',

        'first-lieutenant':
            'fuehrungsebene',


        'captain':
            'hohe-fuehrungsebene',

        'major':
            'hohe-fuehrungsebene',

        'commander':
            'hohe-fuehrungsebene'

    };


    /*
     * TRELLO-LISTE -> RANG
     */

    var listRules = {

        'private first class':
            'private-first-class',

        'lance corporal':
            'lance-corporal',

        'corporal':
            'corporal',

        'sergeant':
            'sergeant',

        'staff sergeant':
            'staff-sergeant',

        'sergeant major':
            'sergeant-major',

        'lieutenant':
            'lieutenant',

        'first lieutenant':
            'first-lieutenant',

        'captain':
            'captain',

        'major':
            'major'

    };


    var rankField =
        getField(
            schema,
            'rank'
        );


    var positionField =
        getField(
            schema,
            'position'
        );


    if (!rankField) {
        return false;
    }


    var rank =
        ctNormalizeValue(
            rankField,
            values.rank || ''
        );


    /*
     * Kein Rang:
     * zählt als unvollständig,
     * nicht als Plausibilitätsfehler.
     */

    if (!rank) {
        return false;
    }


    /*
     * Nicht definierte/custom Ränge
     * komplett ignorieren.
     */

    if (!positionRules[rank]) {
        return false;
    }


    // ==================================================
    // 1. RANG <-> POSITION
    // ==================================================

    if (positionField) {

        var position =
            ctNormalizeValue(
                positionField,
                values.position || ''
            );


        if (
            position !==
            positionRules[rank]
        ) {

            return true;

        }

    }


    // ==================================================
    // 2. LISTE <-> RANG
    // ==================================================

    var expectedRank =
        listRules[
            normalizeListName(
                listName
            )
        ];


    if (
        expectedRank &&
        rank !== expectedRank
    ) {

        return true;

    }


    return false;
}


// ======================================================
// PFLICHTFELDER
// ======================================================

function getMissingFields(
    schema,
    values
) {

    var required = [

        {
            id: 'rank',
            fallback: 'Rang'
        },

        {
            id: 'position',
            fallback: 'Position'
        },

        {
            id: 'promotion',
            fallback:
                'Letzte Beförderung'
        },

        {
            id: 'ctId',
            fallback: 'ID'
        }

    ];


    var missing = [];


    required.forEach(
        function (requiredField) {

            if (
                hasValue(
                    values[
                        requiredField.id
                    ]
                )
            ) {

                return;

            }


            var field =
                getField(
                    schema,
                    requiredField.id
                );


            missing.push(

                field
                    ? field.label
                    : requiredField.fallback

            );

        }
    );


    return missing;
}


// ======================================================
// DATUM
// ======================================================

function parseDate(value) {

    if (!value) {
        return null;
    }


    var parts =
        String(value)
            .split('-');


    if (
        parts.length !== 3
    ) {

        return null;

    }


    var date =
        new Date(

            Number(
                parts[0]
            ),

            Number(
                parts[1]
            ) - 1,

            Number(
                parts[2]
            )

        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    date.setHours(
        0,
        0,
        0,
        0
    );


    return date;
}


function getToday() {

    var today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    return today;
}


// ======================================================
// TESTZEIT STATUS
// ======================================================

function getTestStatus(value) {

    var date =
        parseDate(
            value
        );


    if (!date) {
        return null;
    }


    var difference =
        Math.round(

            (
                date.getTime() -
                getToday().getTime()
            )

            /

            86400000

        );


    /*
     * Datum bereits überschritten
     */

    if (
        difference < 0
    ) {

        return {

            id:
                'expired',

            label:
                'Abgelaufen',

            days:
                difference

        };

    }


    /*
     * Heute bis einschließlich
     * 3 Tage Restzeit.
     */

    if (
        difference <= 3
    ) {

        return {

            id:
                'soon',

            label:
                'Läuft bald ab',

            days:
                difference

        };

    }


    return {

        id:
            'running',

        label:
            'Läuft',

        days:
            difference

    };
}


// ======================================================
// DATUM FORMATIEREN
// ======================================================

function formatDate(value) {

    if (!value) {
        return '';
    }


    var parts =
        String(value)
            .split('-');


    if (
        parts.length !== 3
    ) {

        return value;

    }


    return (
        parts[2] +
        '.' +
        parts[1] +
        '.' +
        parts[0]
    );
}


// ======================================================
// HTML ESCAPING
// ======================================================

function escapeHtml(value) {

    return String(value || '')

        .replace(
            /&/g,
            '&amp;'
        )

        .replace(
            /</g,
            '&lt;'
        )

        .replace(
            />/g,
            '&gt;'
        )

        .replace(
            /"/g,
            '&quot;'
        )

        .replace(
            /'/g,
            '&#039;'
        );
}


// ======================================================
// KARTE ÖFFNEN
// ======================================================

function openCard(card) {

    /*
     * Karte zuerst hinter dem Dashboard öffnen.
     * Danach das CT-Overview-Modal schließen.
     *
     * shortLink wurde bereits mit t.cards()
     * geladen. Falls er aus irgendeinem Grund
     * fehlt, verwenden wir die normale Card-ID.
     */

    var cardId =
        card.shortLink ||
        card.id;


    return t.showCard(
        cardId
    ).then(function () {

        return t.closeModal();

    }).catch(function (error) {

        console.error(
            'CT Dashboard Card Open Error:',
            error
        );

    });
}


// ======================================================
// BOARD ANALYSIEREN
// ======================================================

function analyze(
    schema,
    cards,
    lists
) {

    var listMap = {};


    lists.forEach(
        function (list) {

            listMap[
                list.id
            ] = {

                id:
                    list.id,

                name:
                    list.name,

                normalized:
                    normalizeListName(
                        list.name
                    )

            };

        }
    );


    /*
     * Nur Karten aus unseren
     * überwachten Ranglisten.
     */

    var relevantCards =
        cards.filter(
            function (card) {

                var list =
                    listMap[
                        card.idList
                    ];


                return (

                    list &&

                    MONITORED_LISTS.indexOf(
                        list.normalized
                    ) !== -1

                );

            }
        );


    /*
     * CT-Fields jeder Karte laden.
     */

    return Promise.all(

        relevantCards.map(
            function (card) {

                return t.get(

                    card.id,

                    'shared',

                    'characterData',

                    {}

                ).then(
                    function (data) {

                        return {

                            card:
                                card,

                            list:
                                listMap[
                                    card.idList
                                ],

                            values:
                                getStoredValues(
                                    data
                                )

                        };

                    }
                );

            }
        )

    ).then(
        function (items) {

            return buildResult(
                schema,
                items
            );

        }
    );
}


// ======================================================
// RESULT ERSTELLEN
// ======================================================

function buildResult(
    schema,
    items
) {

    var result = {

        memberCount:
            0,

        testCount:
            0,

        incompleteCount:
            0,

        plausibilityCount:
            0,

        testRunning:
            0,

        testSoon:
            0,

        testExpired:
            0,

        tests:
            [],

        issues:
            [],

        duplicateIds:
            [],

        ranks:
            []

    };


    var rankField =
        getField(
            schema,
            'rank'
        );


    var rankMap =
        {};


    var ids =
        {};


    // ==================================================
    // RÄNGE INITIALISIEREN
    // ==================================================

    if (rankField) {

        (
            rankField.options ||
            []
        ).forEach(
            function (option) {

                rankMap[
                    option.id
                ] = {

                    id:
                        option.id,

                    label:
                        option.label,

                    color:
                        option.color,

                    count:
                        0

                };

            }
        );

    }


    // ==================================================
    // KARTEN
    // ==================================================

    items.forEach(
        function (item) {

            var card =
                item.card;


            var values =
                item.values;


            var listName =
                item.list.normalized;


            // ==========================================
            // MITGLIEDER GESAMT
            // ==========================================

            /*
             * Private First Class
             * wird hier NICHT mitgezählt.
             */

            if (
                MEMBER_LISTS.indexOf(
                    listName
                ) !== -1
            ) {

                result.memberCount++;

            }


            // ==========================================
            // RANGVERTEILUNG
            // ==========================================

            /*
             * Hier zählt PFC ganz normal mit.
             */

            if (
                rankField &&
                values.rank
            ) {

                var rankId =
                    ctNormalizeValue(
                        rankField,
                        values.rank
                    );


                if (
                    rankMap[
                        rankId
                    ]
                ) {

                    rankMap[
                        rankId
                    ].count++;

                }

            }


            // ==========================================
            // UNVOLLSTÄNDIG
            // ==========================================

            var missing =
                getMissingFields(
                    schema,
                    values
                );


            if (
                missing.length > 0
            ) {

                result.incompleteCount++;

            }


            // ==========================================
            // PLAUSIBILITÄT
            // ==========================================

            /*
             * Prüft jetzt:
             *
             * Rang <-> Position
             * UND
             * Trello-Liste <-> Rang
             */

            var plausibility =
                hasPlausibilityError(
                    schema,
                    values,
                    listName
                );


            if (plausibility) {

                result.plausibilityCount++;

            }


            // ==========================================
            // TESTZEIT
            // ==========================================

            var testStatus =
                null;


            if (
                hasValue(
                    values.testUntil
                )
            ) {

                /*
                 * Jede gesetzte Testzeit
                 * zählt als aktive Testzeit.
                 *
                 * Auch:
                 * - bald ablaufend
                 * - bereits abgelaufen
                 */

                result.testCount++;


                testStatus =
                    getTestStatus(
                        values.testUntil
                    );


                if (testStatus) {

                    if (
                        testStatus.id ===
                        'running'
                    ) {

                        result.testRunning++;

                    }


                    if (
                        testStatus.id ===
                        'soon'
                    ) {

                        result.testSoon++;

                    }


                    if (
                        testStatus.id ===
                        'expired'
                    ) {

                        result.testExpired++;

                    }


                    result.tests.push({

                        card:
                            card,

                        date:
                            values.testUntil,

                        status:
                            testStatus

                    });

                }

            }


            // ==========================================
            // ID SAMMELN
            // ==========================================

            if (
                hasValue(
                    values.ctId
                )
            ) {

                var normalizedId =
                    String(
                        values.ctId
                    )

                    .trim()

                    .toLowerCase();


                if (
                    !ids[
                        normalizedId
                    ]
                ) {

                    ids[
                        normalizedId
                    ] = {

                        display:
                            String(
                                values.ctId
                            ).trim(),

                        cards:
                            []

                    };

                }


                ids[
                    normalizedId
                ].cards.push(
                    card
                );

            }


            // ==========================================
            // AUFFÄLLIGKEITEN
            // ==========================================

            var problems =
                [];


            missing.forEach(
                function (name) {

                    problems.push({

                        text:
                            name +
                            ' fehlt',

                        type:
                            'error'

                    });

                }
            );


            if (plausibility) {

                problems.push({

                    text:
                        'Plausibilitätsfehler',

                    type:
                        'warning'

                });

            }


            if (
                testStatus &&
                testStatus.id ===
                'soon'
            ) {

                problems.push({

                    text:
                        'Testzeit läuft bald ab',

                    type:
                        'warning'

                });

            }


            if (
                testStatus &&
                testStatus.id ===
                'expired'
            ) {

                problems.push({

                    text:
                        'Testzeit abgelaufen',

                    type:
                        'error'

                });

            }


            result.issues.push({

                card:
                    card,

                problems:
                    problems

            });

        }
    );


    // ==================================================
    // DOPPELTE IDS
    // ==================================================

    Object.keys(
        ids
    ).forEach(
        function (key) {

            var group =
                ids[key];


            if (
                group.cards.length <= 1
            ) {

                return;

            }


            result.duplicateIds.push({

                id:
                    group.display,

                cards:
                    group.cards

            });


            /*
             * Bei allen betroffenen Karten
             * zusätzlich als Auffälligkeit.
             */

            group.cards.forEach(
                function (card) {

                    var issue =
                        result.issues.find(
                            function (entry) {

                                return (
                                    entry.card.id ===
                                    card.id
                                );

                            }
                        );


                    if (issue) {

                        issue.problems.push({

                            text:
                                'ID doppelt vergeben',

                            type:
                                'error'

                        });

                    }

                }
            );

        }
    );


    // ==================================================
    // NUR KARTEN MIT AUFFÄLLIGKEIT
    // ==================================================

    result.issues =
        result.issues.filter(
            function (issue) {

                return (
                    issue.problems.length >
                    0
                );

            }
        );


    // ==================================================
    // RANGVERTEILUNG
    // ==================================================

    result.ranks =
        Object.keys(
            rankMap
        ).map(
            function (key) {

                return rankMap[
                    key
                ];

            }
        );


    // ==================================================
    // TESTZEITEN SORTIEREN
    // ==================================================

    var statusWeight = {

        expired:
            0,

        soon:
            1,

        running:
            2

    };


    result.tests.sort(
        function (a, b) {

            var weightA =
                statusWeight[
                    a.status.id
                ];


            var weightB =
                statusWeight[
                    b.status.id
                ];


            if (
                weightA !==
                weightB
            ) {

                return (
                    weightA -
                    weightB
                );

            }


            return (

                parseDate(
                    a.date
                )

                -

                parseDate(
                    b.date
                )

            );

        }
    );


    return result;
}


// ======================================================
// HAUPT-RENDER
// ======================================================

function renderResult(result) {

    memberCount.textContent =
        result.memberCount;


    testCount.textContent =
        result.testCount;


    incompleteCount.textContent =
        result.incompleteCount;


    plausibilityCount.textContent =
        result.plausibilityCount;


    testRunningCount.textContent =
        result.testRunning;


    testSoonCount.textContent =
        result.testSoon;


    testExpiredCount.textContent =
        result.testExpired;


    renderRanks(
        result.ranks
    );


    renderTests(
        result.tests
    );


    renderIssues(
        result.issues
    );


    renderDuplicates(
        result.duplicateIds
    );
}


// ======================================================
// RANGVERTEILUNG
// ======================================================

function renderRanks(ranks) {

    rankDistribution.innerHTML =
        '';


    if (
        ranks.length === 0
    ) {

        rankDistribution.innerHTML =

            '<div class="empty">' +

                'Keine Ränge konfiguriert.' +

            '</div>';


        return;

    }


    var max =
        Math.max.apply(

            null,

            ranks.map(
                function (rank) {

                    return rank.count;

                }
            )

            .concat(
                [1]
            )

        );


    ranks.forEach(
        function (rank) {

            var width =
                (
                    rank.count /
                    max
                ) * 100;


            var row =
                document.createElement(
                    'div'
                );


            row.className =
                'rank-row';


            row.innerHTML =

                '<div class="rank-name">' +

                    escapeHtml(
                        rank.label
                    ) +

                '</div>' +


                '<div class="rank-track">' +

                    '<div class="rank-fill" ' +

                        'style="width:' +
                        width +
                        '%">' +

                    '</div>' +

                '</div>' +


                '<div class="rank-count">' +

                    rank.count +

                '</div>';


            rankDistribution.appendChild(
                row
            );

        }
    );
}


// ======================================================
// TESTZEITEN
// ======================================================

function renderTests(tests) {

    testRows.innerHTML =
        '';


    if (
        tests.length === 0
    ) {

        testRows.innerHTML =

            '<div class="empty">' +

                'Keine aktiven Testzeiten.' +

            '</div>';


        return;

    }


    tests.forEach(
        function (item) {

            var row =
                document.createElement(
                    'div'
                );


            row.className =
                'data-row';


            var badgeClass =
                'badge-green';


            if (
                item.status.id ===
                'soon'
            ) {

                badgeClass =
                    'badge-yellow';

            }


            if (
                item.status.id ===
                'expired'
            ) {

                badgeClass =
                    'badge-red';

            }


            row.innerHTML =

                '<div>' +

                    '<div class="card-name">' +

                        escapeHtml(
                            item.card.name
                        ) +

                    '</div>' +

                    '<div class="subtext">' +

                        formatDate(
                            item.date
                        ) +

                    '</div>' +

                '</div>' +


                '<span class="badge ' +
                    badgeClass +
                '">' +

                    escapeHtml(
                        item.status.label
                    ) +

                '</span>';


            row.addEventListener(
                'click',
                function () {

                    openCard(
                        item.card
                    );

                }
            );


            testRows.appendChild(
                row
            );

        }
    );
}


// ======================================================
// AUFFÄLLIGKEITEN
// ======================================================

function renderIssues(issues) {

    issueRows.innerHTML =
        '';


    if (
        issues.length === 0
    ) {

        issueRows.innerHTML =

            '<div class="empty">' +

                '✓ Keine Auffälligkeiten gefunden.' +

            '</div>';


        return;

    }


    issues.forEach(
        function (item) {

            var row =
                document.createElement(
                    'div'
                );


            row.className =
                'issue-row';


            var tags =
                item.problems.map(
                    function (problem) {

                        return (

                            '<span class="issue ' +

                                (
                                    problem.type ===
                                    'error'
                                        ? 'error'
                                        : ''
                                ) +

                            '">' +

                                escapeHtml(
                                    problem.text
                                ) +

                            '</span>'

                        );

                    }
                )

                .join('');


            row.innerHTML =

                '<div class="card-name">' +

                    escapeHtml(
                        item.card.name
                    ) +

                '</div>' +


                '<div class="issue-tags">' +

                    tags +

                '</div>';


            row.addEventListener(
                'click',
                function () {

                    openCard(
                        item.card
                    );

                }
            );


            issueRows.appendChild(
                row
            );

        }
    );
}


// ======================================================
// DOPPELTE IDS
// ======================================================

function renderDuplicates(groups) {

    duplicateRows.innerHTML =
        '';


    if (
        groups.length === 0
    ) {

        duplicateRows.innerHTML =

            '<div class="empty">' +

                '✓ Keine doppelten IDs gefunden.' +

            '</div>';


        return;

    }


    groups.forEach(
        function (group) {

            var wrapper =
                document.createElement(
                    'div'
                );


            wrapper.className =
                'duplicate-group';


            var title =
                document.createElement(
                    'div'
                );


            title.className =
                'duplicate-id';


            title.textContent =
                'ID ' +
                group.id;


            wrapper.appendChild(
                title
            );


            group.cards.forEach(
                function (card) {

                    var cardButton =
                        document.createElement(
                            'span'
                        );


                    cardButton.className =
                        'duplicate-card';


                    cardButton.textContent =
                        card.name;


                    cardButton.addEventListener(
                        'click',
                        function () {

                            openCard(
                                card
                            );

                        }
                    );


                    wrapper.appendChild(
                        cardButton
                    );

                }
            );


            duplicateRows.appendChild(
                wrapper
            );

        }
    );
}


// ======================================================
// DASHBOARD LADEN
// ======================================================

function loadDashboard() {

    loading.style.display =
        'block';


    dashboard.style.display =
        'none';


    errorBox.style.display =
        'none';


    refreshButton.disabled =
        true;


    return Promise.all([

        t.get(
            'board',
            'shared',
            'ctSchema',
            null
        ),

        t.cards(
            'id',
            'name',
            'idList',
            'url',
            'shortLink'
        ),

        t.lists(
            'id',
            'name'
        )

    ]).then(
        function (values) {

            var schema =
                ctDecodeSchema(
                    values[0]
                );


            var cards =
                values[1] ||
                [];


            var lists =
                values[2] ||
                [];


            return analyze(
                schema,
                cards,
                lists
            );

        }
    ).then(
        function (result) {

            renderResult(
                result
            );


            loading.style.display =
                'none';


            dashboard.style.display =
                'block';


            refreshButton.disabled =
                false;

        }
    ).catch(
        function (error) {

            console.error(
                'CT Dashboard Error:',
                error
            );


            loading.style.display =
                'none';


            dashboard.style.display =
                'none';


            errorBox.textContent =

                'CT Overview konnte nicht geladen werden: ' +

                (
                    error.message ||
                    'Unbekannter Fehler'
                );


            errorBox.style.display =
                'block';


            refreshButton.disabled =
                false;

        }
    );
}


// ======================================================
// REFRESH
// ======================================================

refreshButton.addEventListener(
    'click',
    loadDashboard
);


// ======================================================
// START
// ======================================================

loadDashboard();
