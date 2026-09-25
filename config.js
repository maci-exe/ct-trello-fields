(function () {

    var DEFAULT_CONFIG = {

        version: 1,

        units: [
            {
                id: 'muunilinst-10',
                label: 'Muunilinst 10',
                color: 'blue'
            },
            {
                id: 'rancor-battalion',
                label: 'Rancor Battalion',
                color: 'red'
            },
            {
                id: 'tactical-combat-instructor',
                label: 'Tactical Combat Instructor',
                color: 'green'
            }
        ],

        ranks: [
            {
                id: 'private-first-class',
                label: 'Private First Class',
                color: 'light-gray'
            },
            {
                id: 'lance-corporal',
                label: 'Lance Corporal',
                color: 'purple'
            },
            {
                id: 'corporal',
                label: 'Corporal',
                color: 'purple'
            },
            {
                id: 'sergeant',
                label: 'Sergeant',
                color: 'green'
            },
            {
                id: 'staff-sergeant',
                label: 'Staff Sergeant',
                color: 'green'
            },
            {
                id: 'sergeant-major',
                label: 'Sergeant Major',
                color: 'green'
            },
            {
                id: 'lieutenant',
                label: 'Lieutenant',
                color: 'blue'
            },
            {
                id: 'first-lieutenant',
                label: 'First Lieutenant',
                color: 'blue'
            },
            {
                id: 'captain',
                label: 'Captain',
                color: 'red'
            },
            {
                id: 'major',
                label: 'Major',
                color: 'orange'
            },
            {
                id: 'commander',
                label: 'Commander',
                color: 'yellow'
            },
            {
                id: 'high-general',
                label: 'High General',
                color: 'purple'
            }
        ],

        positions: [
            {
                id: 'mannschaft',
                label: 'Mannschaft',
                color: 'purple'
            },
            {
                id: 'unteroffizierebene',
                label: 'Unteroffizierebene',
                color: 'green'
            },
            {
                id: 'fuehrungsebene',
                label: 'Führungsebene',
                color: 'blue'
            },
            {
                id: 'hohe-fuehrungsebene',
                label: 'Hohe Führungsebene',
                color: 'red'
            }
        ],

        adjutants: [
            {
                id: '5th',
                label: '5th',
                color: 'sky'
            },
            {
                id: '41st',
                label: '41st',
                color: 'green'
            },
            {
                id: '104th',
                label: '104th',
                color: 'light-gray'
            },
            {
                id: '187th',
                label: '187th',
                color: 'purple'
            },
            {
                id: '212th',
                label: '212th',
                color: 'orange'
            },
            {
                id: '501st',
                label: '501st',
                color: 'blue'
            },
            {
                id: 'ctp',
                label: 'CTP',
                color: 'lime'
            },
            {
                id: 'gmc',
                label: 'GMC',
                color: 'purple'
            },
            {
                id: 'rmc',
                label: 'RMC',
                color: 'red'
            },
            {
                id: 'so',
                label: 'SO',
                color: 'sky'
            },
            {
                id: 'st',
                label: 'ST',
                color: 'red'
            }
        ],

        fixedColors: {
            promotion: 'red',
            testUntil: 'yellow',
            ctId: 'light-gray'
        }
    };


    window.CT_COLOR_OPTIONS = [
        { value: 'light-gray', label: 'Grau' },
        { value: 'red', label: 'Rot' },
        { value: 'blue', label: 'Blau' },
        { value: 'green', label: 'Grün' },
        { value: 'purple', label: 'Violett / Lila' },
        { value: 'orange', label: 'Orange' },
        { value: 'yellow', label: 'Gelb' },
        { value: 'sky', label: 'Türkis' },
        { value: 'lime', label: 'Kaki / Grün' }
    ];


    window.ctGetDefaultConfig = function () {
        return JSON.parse(
            JSON.stringify(DEFAULT_CONFIG)
        );
    };


    window.ctNormalizeConfig = function (config) {

        var defaults =
            window.ctGetDefaultConfig();

        if (
            !config ||
            typeof config !== 'object' ||
            !config.version
        ) {
            return defaults;
        }

        return {
            version: 1,

            units:
                Array.isArray(config.units)
                    ? config.units
                    : defaults.units,

            ranks:
                Array.isArray(config.ranks)
                    ? config.ranks
                    : defaults.ranks,

            positions:
                Array.isArray(config.positions)
                    ? config.positions
                    : defaults.positions,

            adjutants:
                Array.isArray(config.adjutants)
                    ? config.adjutants
                    : defaults.adjutants,

            fixedColors: Object.assign(
                {},
                defaults.fixedColors,
                config.fixedColors || {}
            )
        };
    };


    window.ctFindItem = function (
        config,
        section,
        storedValue
    ) {

        if (!storedValue) {
            return null;
        }

        var items =
            config[section] || [];

        return items.find(function (item) {

            // Neue Daten speichern die ID.
            // Alte Testdaten speichern noch den Namen.
            return (
                item.id === storedValue ||
                item.label === storedValue
            );

        }) || null;
    };


    window.ctGetChoiceColor = function (
        config,
        section,
        value
    ) {

        var item =
            window.ctFindItem(
                config,
                section,
                value
            );

        return item
            ? item.color
            : 'light-gray';
    };

})();
