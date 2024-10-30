import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { InteractionResponseType } from 'discord-interactions';
import { getToonRendition } from '../utils.js';
import { getScoutToken } from '../db/scoutData/scoutService.js';
import { RacingCalculator } from 'toonapi-calculator';

const car = 'https://i.imgur.com/oOEXNMv.png';
const trophyIcon = 'https://i.imgur.com/Sl1ep8e.png';

export const data = new SlashCommandBuilder()
        .setName('race')
        .setDescription('Get advising on what trophies to go for next.')
        .setIntegrationTypes(1)
        .setContexts([0, 1, 2])
        .addUserOption(option => 
            option.setName('user')
            .setDescription('(Optional) Get the specified user\'s toon info.')
            .setRequired(false)
        )

export async function execute(req, res, target) {
    // const item = await getScoutToken(target);
    // const toon = item.data;

    const TEST = `{"event":"all","data":{"toon":{"id":"TTID-NFSQ-MFDB","name":"Meerkataclysm","species":"cat","headColor":"#a35a44","style":"7405020100991b8c1bc01b080025060104004000000a0500049f00120000024400"},"laff":{"current":61,"max":61},"location":{"zone":"Meerkataclysm's Estate","neighborhood":"Meerkataclysm's Estate","district":"Splat Summit","instanceId":205224},"gags":{"Toon-Up":null,"Trap":{"gag":{"level":3,"name":"Marbles"},"organic":null,"experience":{"current":162,"next":500}},"Lure":null,"Sound":{"gag":{"level":7,"name":"Opera Singer"},"organic":null,"experience":{"current":0,"next":500}},"Throw":{"gag":{"level":7,"name":"Wedding Cake"},"organic":null,"experience":{"current":500,"next":500}},"Squirt":{"gag":{"level":7,"name":"Geyser"},"organic":null,"experience":{"current":52,"next":500}},"Drop":{"gag":{"level":7,"name":"Toontanic"},"organic":null,"experience":{"current":500,"next":500}}},"tasks":[{"objective":{"text":"Defeat 10 Level 8+ Cogs","where":"Anywhere","progress":{"text":"Complete","current":29,"target":10}},"from":{"name":"Lil Oldman","building":"The Blizzard Wizard","zone":"Walrus Way","neighborhood":"The Brrrgh"},"to":{"name":"Lil Oldman","building":"The Blizzard Wizard","zone":"Walrus Way","neighborhood":"The Brrrgh"},"reward":"Gag training","deletable":false}],"invasion":null,"fish":{"rod":{"id":4,"name":"Gold"},"collection":{"0":{"name":"Balloon Fish","album":{"0":{"name":"Balloon Fish","weight":47},"1":{"name":"Hot Air Balloon Fish","weight":16},"2":{"name":"Weather Balloon Fish","weight":76},"3":{"name":"Water Balloon Fish","weight":68},"4":{"name":"Red Balloon Fish","weight":61}}},"2":{"name":"Cat Fish","album":{"0":{"name":"Cat Fish","weight":94},"1":{"name":"Siamese Cat Fish","weight":77},"2":{"name":"Alley Cat Fish","weight":105},"3":{"name":"Tabby Cat Fish","weight":85},"4":{"name":"Tom Cat Fish","weight":169}}},"4":{"name":"Clown Fish","album":{"0":{"name":"Clown Fish","weight":125},"1":{"name":"Sad Clown Fish","weight":122},"2":{"name":"Party Clown Fish","weight":125},"3":{"name":"Circus Clown Fish","weight":105}}},"6":{"name":"Frozen Fish","album":{"0":{"name":"Frozen Fish","weight":190}}},"8":{"name":"Star Fish","album":{"0":{"name":"Star Fish","weight":79},"1":{"name":"Five Star Fish","weight":94},"2":{"name":"Rock Star Fish","weight":156},"3":{"name":"Shining Star Fish","weight":76},"4":{"name":"All Star Fish","weight":77}}},"10":{"name":"Holey Mackerel","album":{"0":{"name":"Holey Mackerel","weight":126}}},"12":{"name":"Dog Fish","album":{"0":{"name":"Dog Fish","weight":235},"1":{"name":"Bull Dog Fish","weight":317},"2":{"name":"Hot Dog Fish","weight":65},"3":{"name":"Dalmatian Dog Fish","weight":104},"4":{"name":"Puppy Dog Fish","weight":31}}},"14":{"name":"Amore Eel","album":{"0":{"name":"Amore Eel","weight":93},"1":{"name":"Electric Amore Eel","weight":82}}},"16":{"name":"Nurse Shark","album":{"0":{"name":"Nurse Shark","weight":188},"1":{"name":"Clara Nurse Shark","weight":173},"2":{"name":"Florence Nurse Shark","weight":149}}},"18":{"name":"King Crab","album":{"0":{"name":"King Crab","weight":62},"1":{"name":"Alaskan King Crab","weight":119},"2":{"name":"Old King Crab","weight":93}}},"20":{"name":"Moon Fish","album":{"0":{"name":"Moon Fish","weight":93},"2":{"name":"Half Moon Fish","weight":105},"3":{"name":"New Moon Fish","weight":16},"4":{"name":"Crescent Moon Fish","weight":81},"5":{"name":"Harvest Moon Fish","weight":219}}},"22":{"name":"Sea Horse","album":{"0":{"name":"Sea Horse","weight":251},"1":{"name":"Rocking Sea Horse","weight":283},"2":{"name":"Clydesdale Sea Horse","weight":289},"3":{"name":"Arabian Sea Horse","weight":310}}},"24":{"name":"Pool Shark","album":{"0":{"name":"Pool Shark","weight":173},"1":{"name":"Kiddie Pool Shark","weight":128},"2":{"name":"Swimming Pool Shark","weight":168},"3":{"name":"Olympic Pool Shark","weight":152}}},"26":{"name":"Bear Acuda","album":{"0":{"name":"Brown Bear Acuda","weight":282},"1":{"name":"Black Bear Acuda","weight":258},"2":{"name":"Koala Bear Acuda","weight":263},"3":{"name":"Honey Bear Acuda","weight":268},"4":{"name":"Polar Bear Acuda","weight":296},"5":{"name":"Panda Bear Acuda","weight":314},"6":{"name":"Kodiac Bear Acuda","weight":294},"7":{"name":"Grizzly Bear Acuda","weight":283}}},"28":{"name":"Cutthroat Trout","album":{"0":{"name":"Cutthroat Trout","weight":152},"1":{"name":"Captain Cutthroat Trout","weight":86},"2":{"name":"Scurvy Cutthroat Trout","weight":87}}},"30":{"name":"Piano Tuna","album":{"0":{"name":"Piano Tuna","weight":269},"1":{"name":"Grand Piano Tuna","weight":295},"2":{"name":"Baby Grand Piano Tuna","weight":245},"3":{"name":"Upright Piano Tuna","weight":274},"4":{"name":"Player Piano Tuna","weight":279}}},"32":{"name":"Peanut Butter & Jellyfish","album":{"0":{"name":"Peanut Butter & Jellyfish","weight":79},"1":{"name":"Grape PB&J Fish","weight":74},"2":{"name":"Crunchy PB&J Fish","weight":70},"3":{"name":"Strawberry PB&J Fish","weight":70}}},"34":{"name":"Devil Ray","album":{"0":{"name":"Devil Ray","weight":271}}}}},"flowers":{"shovel":{"id":0,"name":"Tin Shovel"},"collection":{"49":{"name":"Daisy","album":{"0":"School Daisy","1":"Lazy Daisy"}},"51":{"name":"Carnation","album":{"0":"What-in Carnation","1":"Instant Carnation"}},"52":{"name":"Lily","album":{"0":"Lily-of-the-Alley","1":"Lily Pad"}},"53":{"name":"Daffodil","album":{"0":"Laff-o-dil","1":"Daffy Dill"}},"54":{"name":"Pansy","album":{"0":"Dandy Pansy","1":"Chim Pansy"}}}},"cogsuits":{"c":{"department":"Bossbot","hasDisguise":false},"l":{"department":"Lawbot","hasDisguise":false},"m":{"department":"Cashbot","hasDisguise":false},"s":{"department":"Sellbot","hasDisguise":true,"suit":{"id":"mh","name":"Mr. Hollywood"},"version":1,"level":23,"promotion":{"current":0,"target":1310}}},"golf":[{"name":"Courses Completed","num":0},{"name":"Courses Under Par","num":0},{"name":"Hole In One Shots","num":0},{"name":"Eagle Or Better Shots","num":0},{"name":"Birdie Or Better Shots","num":0},{"name":"Par Or Better Shots","num":0},{"name":"Multiplayer Courses Completed","num":0},{"name":"Walk In The Par Wins","num":0},{"name":"Hole Some Fun Wins","num":0},{"name":"The Hole Kit And Caboodle Wins","num":0}],"racing":[{"name":"Speedway Wins","num":0},{"name":"Rural Wins","num":0},{"name":"Urban Wins","num":0},{"name":"Total Wins","num":0},{"name":"Speedway Qualify Count","num":0},{"name":"Rural Qualify Count","num":0},{"name":"Urban Qualify Count","num":0},{"name":"Total Qualify Count","num":0},{"name":"Tournament Race Wins","num":0},{"name":"Tournament Race Qualify Count","num":0},{"name":"Unique race tracks completed","num":0}]}}`
    const TEST_MOD = new Date()
    const toon = JSON.parse(TEST).data;
    
    const embed = new EmbedBuilder()
        .setColor('Gold')
        .setAuthor({ name: toon.toon.name, iconURL: getToonRendition(toon, 'laffmeter') })
        .setTitle(`Racing Trophies (${getTotalEarned(toon.racing)}/30)`)
        .setThumbnail(car)
        .setDescription(getTrophies(toon.racing))
        .setFooter({ text: getLaff(toon.racing), iconURL: trophyIcon})
        .setTimestamp(TEST_MOD)

    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            embeds: [embed]
        }
    });
}

function getLaff(toon) {
    const calc = new RacingCalculator(JSON.stringify(toon));
    const pts = calc.getCurrentProgress();
    return `${pts}/3 laff points earned.`;
}

function getTrophies(toon) {
    if (getTotalEarned(toon) === 30) {
        return 'You have maxed racing! Congratulations!';
    }
    const calc = new RacingCalculator(JSON.stringify(toon));
    let trophies = calc.getBestTrophy().slice(0,5);
    trophies = trophies.map((t, index) => 
        `**${index+1}. ${t.name}**Progress: ${t.progress.current}/${t.progress.required}\n${t.progress.difference} more to go!\n`
    ).join('\n');
    return trophies;
}

function getTotalEarned(toon) {
    const calc = new RacingCalculator(JSON.stringify(toon));
    return calc.getTotalEarned();
}