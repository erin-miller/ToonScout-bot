export const gagTracks = [
    { name: 'Toon-Up', value: 'Toon-up' },
    { name: 'Trap', value: 'Trap' },
    { name: 'Lure', value: 'Lure' },
    { name: 'Sound', value: 'Sound' },
    { name: 'Throw', value: 'Throw' },
    { name: 'Squirt', value: 'Squirt' },
    { name: 'Drop', value: 'Drop' },
]

export const suitTypes = [
    { name: 'Sellbot', value: 's'},
    { name: 'Cashbot', value: 'm'},
    { name: 'Lawbot', value: 'l'},
    { name: 'Bossbot', value: 'c'},
]

const factory = [
    { name: 'long Steel', value: 1525 },
    { name: 'short Steel', value: 900 },
    { name: 'long Scrap', value: 609 },
    { name: 'short Scrap', value: 400 },
]

const mint = [
    { name: 'Bullion', value: 1600 },
    { name: 'Coin', value: 735 },
]

const wing = [
    { name: 'Senior', value: 1900 },
    { name: 'Junior', value: 808 },
]

const cgc = [
    { name: 'Final Fringe', value: 2180 },
    { name: 'First Fairway', value: 900 },
]

export function numFacilities(target, type) {
    let total = 0;
    const result = [];
    const facility = getCogFacility(type);

    for (const mode of facility) {
        while (total + mode.value <= target) {
            total += mode.value;
            result.push(mode.name);
        }
    }
    console.log(result);
    console.log(total);
    return 0;
}

function getCogFacility(type) {
    const facilities = {
        's': factory,
        'm': mint,
        'l': wing,
        'c': cgc,
    };

    return facilities[type] || null; 
}

export function getSuitByValue(type) {
    const suit = suitTypes.find(suitTypes => suitTypes.value === type);
    return suit.name;
}