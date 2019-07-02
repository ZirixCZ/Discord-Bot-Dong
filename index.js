'use strict';

const Discord = require("discord.js");
const Neko = require("nekos.life");
const util = require('util');
const config = require("./config.json");

const nekoClient = new Neko();
const client = new Discord.Client();

let userDafca = new Discord.User();
let userZirix = new Discord.User();

const eightBall = ["Jak to vidím - Ano", "Zeptej se znovu později", "Teď raději neodpovím", "Teď nemohu předpovědět", "Soustřeď se a zeptej se znovu", "S tím nepočítej", "Je to jisté", "Je to rozhodně tak", "S největší pravděpodobností", "Má odpověd je - Ne", "Mé zdroje říkají - Ne", "Vyhlídky jsou dobré", "Vyhlídky nejsou dobré", "Odpověď je zamlžená, zkus to znovu", "Znamení ukazují - Ano", "Velmi pochybuji", "Bezpochyby", "Ano", "Ano - rozhodně", "Můžeš se na to splehnout"];

client.on("ready", () => {
    console.info(`Bot byl spuštěn! Momentálně pracuje s ${client.users.size} uživateli v celkem ${client.channels.size} kanálech na ${client.guilds.size} serverech.`);

    client.fetchUser("522766931967868931").then(user => userDafca = user);
    client.fetchUser("378937948948791297").then(user => userZirix = user);

    let helpStatus = false;

    setInterval(() => {
        if (helpStatus = !helpStatus)
            client.user.setActivity(".help pro seznam příkazů");
        else
            client.user.setActivity("Vytvořil Dafča & Zirix");
    }, 5000);
});

if (talkedRecently.has(msg.author.id)) {
    msg.channel.send("Musíš dvě vteřiny počkat..." + msg.author); } 
    else 
{talkedRecently.add(msg.author.id);
setTimeout(() => {talkedRecently.delete(msg.author.id);}, 120);
}

function getUserFromArgs(guild, args) {
    const matches = args[0].match(/^<@!?(\d+)>$/);
    let member = guild.member(matches ? matches[1] : args[0]);

    if (!member) {
        const fullArg = args.join(" ").toLocaleLowerCase();

        member = guild.members.find(mem => mem.displayName.toLowerCase().startsWith(fullArg));

        if (util.isNullOrUndefined(member))
            member = guild.members.find(mem => mem.user.tag.toLowerCase().startsWith(fullArg));
        if (util.isNullOrUndefined(member))
            member = guild.members.find(mem => mem.displayName.toLowerCase().includes(fullArg));
        if (util.isNullOrUndefined(member))
            member = guild.members.find(mem => mem.user.tag.toLowerCase().includes(fullArg));
    }

    return member || false;
}

async function ReturnHelpEmbed(msg, args) {
    const categories = ["info", "fun", "images"];

    const getCommand = (cmd) => {
        let exists = false;

        for (const cat of categories) {
            if (exists = config.commands[cat].find(e => e.name.toLowerCase() === cmd.toLowerCase()))
                break;
        }

        return exists;
    };

    if (args) {
        const command = getCommand(args);

        if (command) {

            const propertyToList = (array) => {
                const list = [];

                array.forEach(item => {
                    list.push(`\`${config.settings.prefix + item}\` `);
                });

                return list.join(", ");
            };

            const embedObject = {
                color: 0xffffff,
                title: ":keyboard: Nápověda k příkazu - " + args,
                description: command.desc,
                fields: [
                    {
                        name: "Užití",
                        value: `\`${config.settings.prefix + command.usage}\``
                    },
                    {
                        name: "Příklad(y)",
                        value: propertyToList(command.examples)
                    }
                ],
                footer: {
                    text: `Parametry v [] jsou volitelné a parametry v <> jsou povinné`,
                    icon_url: msg.author.avatarURL
                }
            };

            if (command.aliases)
                embedObject.fields.push({
                    name: "Alias(y)",
                    value: propertyToList(command.aliases)
                });

            msg.channel.send({ embed: embedObject });
        }
        else
            msg.channel.send(":negative_squared_cross_mark: **Nebyl nalezen žádná příkaz s tímto názvem**");
    }
    else {
        let cmdCount = 0;

        categories.forEach(cat => cmdCount += config.commands[cat].length);

        const getCommandsFromCategory = (category) => {
            const commandsList = [];

            config.commands[category].sort((a, b) => {
                if (a.name < b.name)
                    return -1;
                else if (a.name > b.name)
                    return 1;
                else
                    return 0;
            }).forEach(cmd => commandsList.push(`\`${cmd.name}\` `));

            return commandsList.join(", ");
        };

        msg.channel.send({
            embed: {
                color: 0xffffff,
                title: "**:keyboard: Seznam všech příkazů**",
                description: `Pokud máte nějaké dotazy, či návrhy na nové příkazy a vylepšení, dejte vědět <@!${userDafca.id}> (*${userDafca.tag}*) či <@!${userZirix.id}> (*${userZirix.tag}*). \n**Dong** má prozatím celkem **${cmdCount}** příkazů a jednotlivé příkazy jsou rozděleny do kategorií:`,
                fields: [
                    {
                        name: "Info",
                        value: getCommandsFromCategory("info")
                    },
                    {
                        name: "Zábava",
                        value: getCommandsFromCategory("fun")
                    },
                    {
                        name: "Obrázky & GIFy",
                        value: getCommandsFromCategory("images")
                    }
                ],
                footer: {
                    text: `Pro bližší informace o příkazu zadejte ${config.settings.prefix}help <příkaz>`,
                    icon_url: msg.author.avatarURL
                }
            }
        });
    }
}

function funImageEmbed(channel, desc, url, text = undefined) {
    channel.send(text, {
        embed: {
            color: 0xffffff,
            description: desc,
            image: {
                url: url
            },
            footer: {
                text: "Používá nekos.life"
            }
        }
    });

}

function actionFunCmd(msg, args, action) {
    let mentionedUser = new Discord.User();

    if (!args.length || !(mentionedUser = getUserFromArgs(msg.guild, args)))
        msg.channel.send(":negative_squared_cross_mark: Musíte označit, napsat ID, nebo část jména/přezdívky existujícího uživatele");
    else {
        const doAction = (actionPromise, message, self, sneaky = false) => {
            if (sneaky)
                msg.delete();

            let desc = "";

            if (mentionedUser.id === msg.author.id)
                desc = self;
            else if (!sneaky)
                desc = util.format(message, `<@!${mentionedUser.id}>`, `\`${msg.member.displayName}\``);
            else
                desc = util.format(message, `\`${mentionedUser.displayName}\``);

            actionPromise.then((response) => {
                funImageEmbed(msg.channel, desc, response.url, (sneaky) ? `<@!${mentionedUser.id}>` : undefined);
            });
        };

        switch (action) {
            case "kiss":
                doAction(nekoClient.sfw.kiss(), "Aww %s, %s tě políbil/a :heart:", "Zde máš polibek ode mne :heart:");
                break;
            case "hug":
                doAction(nekoClient.sfw.hug(), "Aww %s, %s tě obejmul/a <:CuteHuggu:593094280181055499>", "Ooh, jsi sám/sama? *obejme* <:CuteHuggu:593094280181055499>");
                break;
            case "cuddle":
                doAction(nekoClient.sfw.cuddle(), "Aww %s, %s se s tebou mazlí <a:party:524228413851041802>", "Klidně se s tebou pomazlím <a:party:524228413851041802>");
                break;
            case "pat":
                doAction(nekoClient.sfw.pat(), "Aww %s, %s tě pohladil/a <:PatPat:593095459686580265>", "Osamělost? *pat pat* <:PatPat:593095459686580265>");
                break;
            case "feed":
                doAction(nekoClient.sfw.feed(), "Aww %s, %s tě nakrmil/a :yum:", "Chápu jsi hladový/á, tady máš :yum:");
                break;
            case "slap":
                doAction(nekoClient.sfw.slap(), "Ow %s, %s ti dal/a facku <:SlapSlapSlap:593097031845937152>", "Nevím, proč se sám/sama mlátíš, ale-");
                break;
            case "tickle":
                doAction(nekoClient.sfw.tickle(), "Hehe %s, %s tě polechtal/a :relaxed:", "Jsi lechtivý/á?~ :relaxed::relaxed:");
                break;
            case "poke":
                doAction(nekoClient.sfw.poke(), "*Šťouch*, %s, %s do tebe šťouchnul :blush::point_right:", "Hm, co to je? Jsi to ty? *šťouchne do tebe* :blush::point_right: ");
                break;

            case "sneakykiss": case "skiss":
                doAction(nekoClient.sfw.kiss(), "Aww %s, někdo tě tajně políbil :heart: Třeba tvůj tajný ctitel? :3", "Uwuwu *muck* :heart: *rychle uteče* S-snad jsi mně neviděl :blush:", true);
                break;
            case "sneakyhug": case "shug":
                doAction(nekoClient.sfw.hug(), "Aww %s, někdo tě tajně objal a potom rychle utekl <:CuteHuggu:593094280181055499> Kdo...? :3", "Uwuwu *obejme tě* <:CuteHuggu:593094280181055499> *rychle uteče* S-snad jsi mně neviděl :blush:", true);
                break;
            case "sneakypoke": case "spoke":
                doAction(nekoClient.sfw.poke(), "*Šťouch*, %s, někdo tě tajně šťouchl a potom rychle utekl :blush::point_right: Kdo..? :3", "Uwuwu *šťouchne do tebe* :blush::point_right: *rychle uteče* Hehe, kdo to byl? :blush:", true);
                break;
        }
    }
}

client.on("message", (msg) => {
    if (msg.author.bot) return; // zabránění zkurwenému botspamu

    if (!msg.content.startsWith(config.settings.prefix)) return; // pouze náš krásný prefix

    const argsArray = msg.content.slice(config.settings.prefix.length).trim().split(/ +/);
    const command = argsArray.shift().toLowerCase();
    const argFull = argsArray.join(" ").trim();

    switch (command) {
        case "ping": {
            msg.channel.send("***Pinging...***").then((pingMsg) => {
                pingMsg.edit({
                    embed: {
                        color: 0xffffff,
                        title: ":ping_pong: \u200b **PONG!** \u200b :ping_pong:",
                        fields: [
                            {
                                name: '**Odezva bota:**',
                                value: `:hourglass_flowing_sand: ${pingMsg.createdTimestamp - msg.createdTimestamp} ms`,
                                inline: true
                            },
                            {
                                name: '**Odezva API:**',
                                value: `:stopwatch: ${Math.round(client.ping)} ms`,
                                inline: true
                            }
                        ]
                    }
                });
            });
            break;
        }
        case "help": case "commands": case "h": {
            ReturnHelpEmbed(msg, argFull);
            break;
        }
        case "info": case "about": {
            let utTotalSeconds = client.uptime / 1000;
            const utDays = Math.floor(utTotalSeconds / 86400);
            const utHours = Math.floor(utTotalSeconds / 3600);
            utTotalSeconds %= 3600;
            const utMinutes = Math.floor(utTotalSeconds / 60);
            const utSeconds = Math.round(utTotalSeconds % 60);

            msg.channel.send({
                embed: {
                    color: 0xffffff,
                    title: ":heart: **O-oh, vidím, že tě zajímá info o mně**",
                    description: `Jsem **Dong**, bot vytvořený jen tak pro srandu a to je taky důvod, proč u mne pravděpodobně nenajdete žádné moderation commandy. Mí vývojáři jsou úžasný <@!${userDafca.id}> (*${userDafca.tag}*) a neschopný, ale přesto úžasný a inteligentní <@!${userZirix.id}> (*${userZirix.tag}*). Přecejen byl to Zirixův nápad vytvořit bota.`,
                    fields: [
                        {
                            name: '**Technické parametry**',
                            value: `:books: **Klihovna:** \`Discord.js\`\n:pencil: **Jazyk:** \`JavaScript\`\n:desktop: **Hosting:** \`heroku.com\``
                        },
                        {
                            name: '**Bot byl vytvořen pro server**',
                            value: "*Anime Sekai CZ/SK* - [invite](https://discord.gg/nVz3Nwe)"
                        },
                        {
                            name: "Uptime",
                            value: `**${utDays}**d **${utHours}**h **${utMinutes}**m **${utSeconds}**s`
                        },
                        {
                            name: '**Verze bota**',
                            value: "2.0.6 beta"
                        }
                    ],
                    thumbnail: {
                        url: client.user.avatarURL
                    },
                    footer: {
                        text: `Pro seznam všech příkazů zadejte ${config.settings.prefix}help`,
                        icon_url: msg.author.avatarURL
                    }
                }
            });
            break;
        }
        case "kiss": case "pat": case "poke": case "slap": case "tickle": case "hug": case "feed": case "cuddle": {
            actionFunCmd(msg, argsArray, command);
            break;
        }
        case "sneakykiss": case "skiss": case "sneakypoke": case "spoke": case "sneakyhug": case "shug": {
            actionFunCmd(msg, argsArray, command);
            break;
        }
        case "smug": {
            nekoClient.sfw.smug().then(response =>
                funImageEmbed(msg.channel, "Hehe <:EvilSmug:524227753655140365>", response.url));
            break;
        }
        case "neko": {
            nekoClient.sfw.neko().then(response =>
                funImageEmbed(msg.channel, "Nyaaa :heart:", response.url));
            break;
        }
        case "nekogif": {
            nekoClient.sfw.nekoGif().then(response =>
                funImageEmbed(msg.channel, "Nyaaa :heart:", response.url));
            break;
        }
        case "kitsune": case "foxgirl": {
            nekoClient.sfw.foxGirl().then(response =>
                funImageEmbed(msg.channel, "UwU :heart:", response.url));
            break;
        }
        case "dog": case "woof": {
            nekoClient.sfw.woof().then(response =>
                funImageEmbed(msg.channel, "Woof woof :dog:", response.url));
            break;
        }
        case "cat": case "meow": {
            nekoClient.sfw.meow().then(response =>
                funImageEmbed(msg.channel, "Meooow :cat:", response.url));
            break;
        }
        case "holo": {
            nekoClient.sfw.holo().then(response =>
                funImageEmbed(msg.channel, "Kawaiiii, isn't she? :heart:", response.url));
            break;
        }
        case "8ball": {
            if (!argFull.length) {
                msg.channel.send(":negative_squared_cross_mark: **Musíte napsat vaší ANO/NE otázku!** :8ball: Magická koule sice ví, na co myslíte, ale přesto musíte svou otázku předat veřejně");
            }

            msg.channel.send("***Hmmm <:HoloThinkHmmm:563794401831419952>** Nech mě chvíli přemýšlet... :hourglass:*").then(ballMessage => {
                setTimeout(() => {
                    ballMessage.edit(`:8ball: | **${eightBall[Math.floor(Math.random() * eightBall.length)]}**, ${msg.author.username} <:bang:524227757799112705>`);
                }, 3000);
            });
            break;
        }
        case "avatar": {
            let mentionedUser = new Discord.User();

            if (!argsArray.length || !(mentionedUser = getUserFromArgs(msg.guild, argsArray)))
                msg.channel.send(":negative_squared_cross_mark: Musíte označit, napsat ID, nebo část jména/přezdívky existujícího uživatele");
            else {

                msg.channel.send({
                    embed: {
                        title: `Profilový obrázek od \`${mentionedUser.user.tag}\``,
                        description: `[Link na profilový obrázek](${mentionedUser.user.avatarURL})`,
                        image: {
                            url: mentionedUser.user.avatarURL
                        }
                    }
                });
            }

            break;
        }
        case "ban": {
            if (argFull.toLocaleLowerCase() === "michi" || argFull === "<@!444953054933155840>")
                msg.channel.send("U can't ban Dafča's love <3 <:AngryDissapointed:589363995350138881>");
            else if (argFull.toLowerCase() === "dafča" || argFull === "<@!522766931967868931>")
                msg.channel.send("COS TO PRÁVĚ... <@!522766931967868931>, tati, tenhle baka se ti snaží dát ban <:AngryDissapointed:589363995350138881>");
            else if (argsArray.length)
                msg.channel.send("Bruh, nemůžu bannovat lidi, použij YAPGDB bota. A pokud nejsi moderátor tak... Rip, rip");
            else
                msg.channel.send("A koho mám zabanovat? Řekni mi jeho jméno :3");
            break;
        }
    }
});

client.login(config.main.token);
