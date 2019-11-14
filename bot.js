const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const fs = require('fs')
const owner = "MakeHell Tal"
var lettersGuessed;
var trainer = 0;
var trainerGame = false;
var racksGiven = 0;
var points = 0;
var possiblePoints = 0;
var trainerPlayer;
var wordList;
var rack;
var trainerRack = '';
var hangmanRack;
var hangmanWord;
var player;
var trainerPlayer;
var hangmanWin = false;
var hangmanLose = false;
var survivalPoints = 0;
var guessesLeft;
var alphabet = ['e', 'a', 'r', 'i', 't', 'o', 's', 'n', 'l', 'u', 'd', 'p', 'g', 'y', 'h', 'f', 'c', 'm', 'v', 'b', 'w', 'q', 'j', 'x', 'k', 'z'];
var letterChances = [1300, 2232, 2984, 3707, 4391, 5054, 5648, 6195, 6661, 7089, 7465, 7726, 7983, 8235, 8487, 8722, 8940, 9154, 9325, 9496, 9650, 9765, 9842, 9902, 9958, 10000];
var letterIdDict = {
	"a": "617474867549175809",
	"b": "617474568990228540",
	"c": "617482570908696583",
	"d": "617481511674839061",
	"e": "617477904259088385",
	"f": "617477631801294850",
	"g": "617483967238504448",
	"h": "617477109325234226",
	"i": "617476179833782280",
	"j": "617480841525985291",
	"k": "617484381166239747",
	"l": "617484528528654367",
	"m": "617481253612159002",
	"n": "617477323142332430",
	"o": "617481933902839943",
	"p": "617481834024009736",
	"q": "617482939109867611",
	"r": "617805623442276385",
	"s": "617480218713522177",
	"t": "617483135067750697",
	"u": "617476393965453372",
	"v": "617484157328556062",
	"w": "617484913276616714",
	"x": "617482352515612672",
	"y": "617478222543847425",
	"z": "617482192427286721",
	"?": "617486265599918104"
};
var letterValueDict = {
	"a": 1,
	"b": 1.25,
	"c": 1.25,
	"d": 1,
	"e": 1,
	"f": 1.25,
	"g": 1,
	"h": 1.25,
	"i": 1,
	"j": 1.75,
	"k": 1.75,
	"l": 1,
	"m": 1.25,
	"n": 1,
	"o": 1,
	"p": 1.25,
	"q": 2.75,
	"r": 1,
	"s": 1,
	"t": 1,
	"u": 1,
	"v": 1.5,
	"w": 1.5,
	"x": 2,
	"y": 1.5,
	"z": 2
}
var helpJSON = [
	[
		"`!sendrack <letters>` - Sends a rack of letters with the Bookworm Adventures tile emotes.\\n\\n" +
		"`!randomrack` - Sends a random rack of 16 letters in a 4x4 square.\\n\\n" +
		"`!randomword` or `!random` - Sends a random word from the BWA dictionary.\\n\\n" +
		"`!bestword <letters>` - States the top three highest value words that can be spelled with the letters you give (according to the Bookworm Adventures Deluxe dictionary), and their length, in spoilers.\\n\\n" +
		"`!attack <word> <attack%> <gem%> <xyz level> <parrot>` - Sends the calc of heards. All arguments except `<word>` are optional.\\n\\n" +
		"`!begins <letters>` - Lists all of the valid words starting with a specific sequence of letters.\\n\\n" +
		"`!ends <letters>` - Lists all of the valid words ending in a specific sequence of letters.\\n\\n" +
		"`!sequence <letters>` - Lists all of the valid words containing a specific sequence of letters.\\n\\n" +
		"`!contains <letters>` - Lists all of the valid words containing a given set of letters."
	],
	[
		"`!realtrainer` - Sends a random rack of letters. After you submit a word with `!submit`, it replaces the letters you used, just like it does in BWA.\\n\\n" +
		"`!randomtrainer` - Instead of replacing the letters you used, it gives you a new rack altogether. Otherwise, it's the same as `!realtrainer`.\\n\\n" +
		"`!board` - Shows the last board the bot generated for convenience.\\n\\n" +
		"`!hangman` - Starts either a game of hangman with six guesses and a random word from 6 to 10 letters long, or a game of Survival Hangman where you keep playing until you lose. React with the server's custom letter emojis to make guesses.\\n\\n" +
		"`!wordchallenge` - Sends a random rack 10 times and gives you an accuracy percentage based on the value of the words you found."
	],
	[
		"`!runners` - Lists who is currently running the bot off of their computer.\\n\\n" +
		"`!helpupdate` - Regenerates `help.json` file from bots' arrays *(for owners only)*."
	],
];

fs.readFile('bookwormwordList.txt', (err, data) => {
	if (err) throw err;
	wordList = data.toString().split("\n");
	for (i = 0; i < wordList.length; i++) {
		wordList[i] = wordList[i].replace("\r", "");
	}
	hangmanList = wordList.filter(word => word.length > 5 && word.length < 11 && (!word.includes('q') || word.includes('qu')))
})
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});
client.login(auth.pen);
client.on('message', msg => {
	function createPages(string, pageLength) {
		var pages = string.match(new RegExp(".{1," + pageLength + "}", "g"))
		return pages;
	}
        function WindowWithButtons(message, buttons) {
		    msg.channel.send(message).then(sent => {
			for (var i = 0; i < buttons.length; i++) {
				if (alphabet.includes(buttons[i])) {
					sent.react(client.emojis.get(letterIdDict[buttons[i].toLowerCase()]));
				} else {
					sent.react(buttons[i]);
				}
			}
			client.on('raw', event => {
				if (event.t === 'MESSAGE_REACTION_ADD' && event.d.message_id === sent.id) {
					var buttonIndex = 0;
					while (event.d.emoji.name !== buttons[buttonIndex]) {
						buttonIndex++;
					}
					return buttonIndex;
				}
			});
		});
		}
	
	function generateHangmanRack(word) {
		hangmanRack = "";
		for (var i = 0; i < word.length; i++) {
			hangmanRack += client.emojis.get(letterIdDict['?']);
			hangmanRack += " ";
		}
		return hangmanRack;
	}
	function generateRack(rack) {
		var rackString = "";
		for (var i = 0; i < rack.length; i++) {
			rackString += client.emojis.get(letterIdDict[rack.toLowerCase().charAt(i)])
			if (i % 4 == 3) {
				rackString += "\n"
			}
		}
		return rackString;
	}
	function randomRack() {
		var rackString = "";
		rack = "";
		for (var i = 0; i < 16; i++) {
			var randNum = Math.round(Math.random() * 10000);
			var index = 0;
			while (randNum > letterChances[index])
				index++;
			rack += alphabet[index];
			rackString += client.emojis.get(letterIdDict[alphabet[index]])
			if (i % 4 == 3) {
				rackString += "\n"
			}
		}
		return [rackString, rack];
	}
	function findValidWords(rack) {
		rack = rack.replace("q", "qu")
		var ogRack = rack;
		validWords = [];
		for (i = 0; i < wordList.length; i++) {
			var wordSplit = wordList[i].split("");
			var charsFound = [];
			rack = ogRack;
			for (j = 0; j < wordSplit.length; j++) {
				if (rack.includes(wordSplit[j])) {

					for (k = 0; k < rack.length; k++) {

						if (rack[k] === wordSplit[j]) {
							part1 = rack.substring(0, k);
							part2 = rack.substring(k + 1, rack.length);
							rack = part1 + part2;
							charsFound.push(wordSplit[j]);
							break;
						}
					}
				} else { break; }
			}
			if (charsFound.length === wordSplit.length) { validWords.push(wordList[i]); }
		}
		return validWords;
	}
	function findWordValue(word, xyz, parrot) {
		letterValueDict["x"] = 2;
		letterValueDict["y"] = 1.5;
		letterValueDict["z"] = 2;
		letterValueDict["r"] = 1;
		if (xyz > 0) {
			letterValueDict["x"] = 2 + xyz / 2;
			letterValueDict["y"] = 2 + xyz / 2;
			letterValueDict["z"] = 2 + xyz / 2;
		}
		if (parrot === 1) {
			letterValueDict["r"] = 2;
		}
		var wordValue = 0;
		for (var i = 0; i < word.length; i++) {
			wordValue += letterValueDict[word[i]];
		}
		if (wordValue < 10) wordValue = "0" + wordValue;
		if (wordValue % 1 === 0) wordValue += ".00";
		else if (wordValue % 0.1 === 0) wordValue += "0";
		return wordValue;
		
	}
	function findBestWord(theValidWords) {
		theValidWords.sort((a, b) => findWordValue(b, 2, 1) - findWordValue(a, 2, 1));
		var words = 0;
		var string = "";
		for (var i = 0; i < 3 && theValidWords[i] !== ''; i++) {
			words = i + 1;
			string += "> **" + words + ".** ||**" + theValidWords[i].toUpperCase()
				+ "**|| with a value of ||**" + findWordValue(theValidWords[i], 2, 1)
				+ "**|| and a length of ||**" + theValidWords[i].length + "**||.\n";
		}
		if (words == 0) {
			string = "No words in the Bookworm Adventures Deluxe Dictionary could be spelled using the rack."
		} else if (words < 3) {
			string += "No more words could be found."
		}
		string += "\n\n"
		return string;
	}
	function playHangman() {
		hangmanWin = false;
		hangmanLose = false;
		lettersGuessed = []
		hangmanWord = hangmanList[Math.floor(Math.random() * hangmanList.length)].replace("qu", "q");
		hangmanRack = generateHangmanRack(hangmanWord).split(" ");
		guessesLeft = ":heart: ".replace(6);
		msg.channel.send("**" + player.username + "'s Game** | Classic Hangman");
		msg.channel.send(hangmanRack.join(' ') + "\n\n" + guessesLeft).then(sent => {
			client.on('raw', event => {
				const eventName = event.t;
				if (eventName === 'MESSAGE_CREATE' && event.d.author.id === player.id && event.d.content.toLowerCase().trim().substring(0, 9) === '!exitgame') { sent.channel.send("You have successfully abandoned the current game."); return; }
				else if (eventName === 'MESSAGE_REACTION_ADD' && event.d.message_id === sent.id && event.d.user_id === player.id) {
					if (Object.values(letterIdDict).includes(event.d.emoji.id) && event.d.emoji.id !== letterIdDict['?'] && !(lettersGuessed.includes(event.d.emoji.name.substring(5, 6).toLowerCase()))) {
						lettersGuessed.push(event.d.emoji.name.substring(5, 6).toLowerCase());
						if (hangmanWord.includes(event.d.emoji.name.substring(5, 6).toLowerCase())) {
							for (var i = 0; i < hangmanWord.length; i++) {
								if (hangmanWord[i] === event.d.emoji.name.substring(5, 6).toLowerCase()) hangmanRack[i] = client.emojis.get(event.d.emoji.id);
							}
							if (!(hangmanRack.includes("<:wildcard:617486265599918104>"))) hangmanWin = true;
						} else {
							guessesLeft = guessesLeft.replace(":heart:", ":broken_heart:");
							if (!(guessesLeft.includes(":heart:"))) hangmanLose = true;
						}
						if (hangmanWin === true) {
							sent.channel.send("You won! Great job! Play again with the command `!hangman`.")
							return;
						} else if (hangmanLose === true) {
							sent.channel.send("You lost! The mystery word was\n\n||**" + hangmanWord.replace("q", "qu").toUpperCase() + "**||\n\nTry again with the command `!hangman`.")
							return;
						}
						sent.edit(hangmanRack.join(' ') + "\n\n" + guessesLeft);
					}
				}
			});
		});
	}
	function playSurvivalHangman() {

		hangmanWin = false;
		hangmanLose = false;

		lettersGuessed = []
		hangmanWord = hangmanList[Math.floor(Math.random() * hangmanList.length)].replace("qu", "q");
		hangmanRack = generateHangmanRack(hangmanWord).split(" ");
		guessesLeft = ":heart: ".repeat(6);

		msg.channel.send("**" + player.username + "'s Game** | " + "Survival Mode | **Score: " + survivalPoints + "**\n");
		msg.channel.send(hangmanRack.join(' ') + '\n\n' + guessesLeft).then(sent => {
			client.on('raw', event => {
				const eventName = event.t;

				if (eventName === 'MESSAGE_CREATE' && event.d.author.id === player.id && event.d.content.toLowerCase().trim().substring(0, 9) === '!exitgame') { sent.channel.send("You have successfully abandoned the current game."); return; }
				else if (eventName === 'MESSAGE_REACTION_ADD' && event.d.message_id === sent.id && event.d.user_id === player.id) {

					if (Object.values(letterIdDict).includes(event.d.emoji.id) && event.d.emoji.id !== letterIdDict['?'] && !(lettersGuessed.includes(event.d.emoji.name.substring(5, 6).toLowerCase()))) {
						lettersGuessed.push(event.d.emoji.name.substring(5, 6).toLowerCase());
						if (hangmanWord.includes(event.d.emoji.name.substring(5, 6).toLowerCase())) {
							for (var i = 0; i < hangmanWord.length; i++) {
								if (hangmanWord[i] === event.d.emoji.name.substring(5, 6).toLowerCase()) { hangmanRack[i] = client.emojis.get(event.d.emoji.id); }
							}
							if (!(hangmanRack.includes("<:wildcard:617486265599918104>"))) { hangmanWin = true }
						} else {
							guessesLeft = guessesLeft.replace(":heart:", ":broken_heart:");
							if (!(guessesLeft.includes(":heart:"))) { hangmanLose = true; }
						}
						sent.edit(hangmanRack.join(' ') + "\n\n" + guessesLeft);
						if (hangmanWin === true) {
							survivalPoints++;
							sent.channel.send("You won! Great job! You currently have a score of **" + survivalPoints + "**.")

							playSurvivalHangman();
							return;
						} else if (hangmanLose === true) {
							sent.channel.send("You lost with a score of **" + survivalPoints + "**! The mystery word was\n\n||**" + hangmanWord.replace("q", "qu").toUpperCase() + "**||\n\nTry again with the command `!hangman`.")
							return;
						}
					}
				}
			});
		});
	}
	function showGameMenu() {
		msg.channel.send(">>> **Welcome to Hangman, " + player.username + "!** There are two modes: Classic and Survival. \nTo play a normal game, react to this message with " + client.emojis.get(letterIdDict['c']) + ". \nTo test your skills in Survival mode, react with " + client.emojis.get(letterIdDict['s']) + ".").then(sent => {
			sent.react(client.emojis.get(letterIdDict['c']));
			sent.react(client.emojis.get(letterIdDict['s']));
			client.on('raw', event => {
				if (event.t === 'MESSAGE_REACTION_ADD' && event.d.message_id === sent.id && event.d.user_id === player.id) {
					if (event.d.emoji.name === "tile_C") {
						sent.delete();
						playHangman();
					} else if (event.d.emoji.name === "tile_S") {
						survivalPoints = 0;
						sent.delete();
						playSurvivalHangman();

					}
				}
			});
		});
	}
	function sendArrayOfWords(resultArray) {
		resultArray.sort((a, b) => a.length - b.length);
		var index = 0
		while ((result + resultArray[index]).length <= 1996 && index < resultArray.length) {
			result += ', ' + resultArray[index].toUpperCase();
			index++;
		}
		result = result.replace(', ', '');
		if (index < resultArray.length) { result += ' ...' }
		if (result.length !== 0) { msg.channel.send(result); }
	}

	var cmdMsg = msg.content.toLowerCase().trim().split(' ');

	if (cmdMsg[0] === '!sendrack') {
		var newRack = generateRack(cmdMsg[1]);
		msg.channel.send(newRack);
	} else if (cmdMsg[0] === '!randomrack') {
		var newRack = randomRack()[0];
		msg.channel.send(newRack);
	} else if (cmdMsg[0] === '!bestword') {
		var newRack = generateRack(cmdMsg[1]);
		var bestWord = findBestWord(findValidWords(cmdMsg[1]));
		msg.channel.send(newRack);
		msg.channel.send(bestWord);
	} else if (cmdMsg[0] === '!random'
		|| cmdMsg[0] === '!randomword') {
		var randomWord = wordList[Math.floor(Math.random() * wordList.length)];
		msg.channel.send('The random word is: **' + randomWord.toUpperCase() + '**.');
	} else if (cmdMsg[0] === '!attack') {
		var data = cmdMsg[1];
		var quaterHearts = [1, 2, 3, 4, 6, 8, 11, 14, 18, 22, 27, 32, 38, 44, 52];
		var word = cmdMsg[1].replace('qu', 'q').replace('qu', 'q');
		var calc = "```";

		function generateLinedRack(rack) {
			var rackString = "";
			for (var i = 0; i < rack.length; i++) {
				rackString += client.emojis.get(letterIdDict[rack.toLowerCase().charAt(i)]);
			}
			return rackString;
		}

		var attack = cmdMsg[2];
		if (attack === undefined) { attack = 0; }
		calc += `Attack = ${attack}%, `;
		var gems = cmdMsg[3];
		if (gems === undefined) { gems = 0; }
		calc += `Gems = ${gems}%` + "\n";
		var xyz = cmdMsg[4];
		if (xyz === undefined) { xyz = 2; }
		calc += `Xyz=${xyz}(${["none", "Bow of Zyx", "Arch of Xyzzy"][xyz]}), `;
		var parrot = cmdMsg[5];
		if (parrot === undefined) { parrot = xyz === 2 ? 1 : 0; }
		calc += `Wooden Parrot=${["off", "on"][parrot]}` + "```\n";

		function findWordExtraValue(word, xyz, parrot) {
			var extraDamage = "";
			letterValueDict["x"] = 2;
			letterValueDict["y"] = 1.5;
			letterValueDict["z"] = 2;
			letterValueDict["r"] = 1;
			if (xyz > 0) {
				letterValueDict["x"] = 2 + xyz / 2;
				letterValueDict["y"] = 2 + xyz / 2;
				letterValueDict["z"] = 2 + xyz / 2;
			}
			if (parrot === 1) {
				letterValueDict["r"] = 2;
			}
			for (var i = 0; i < word.length; i++) {
				if (letterValueDict[word[i]] > 1) {
					extraDamage += ` + ${word[i].toUpperCase()}(**${letterValueDict[word[i]] - 1}**)`
				}
			}
			if (extraDamage.length === 0) extraDamage = " + ";
			return extraDamage;
		}

		var extraDamage = findWordExtraValue(word, xyz, parrot);
		var wordValue = findWordValue(word, xyz, parrot);

		calc += `${generateLinedRack(word)} - **${word.length}** letters + **${wordValue - word.length}** extra.\n`
		var letters = Math.floor(wordValue + 0.5)
		var bqh /*basic quater-hearts*/ = quaterHearts[Math.min(letters, 16) - 2];
		var I6plus = letters > 16 ? "?" : ""

		calc += `${extraDamage.substring(3)}\n`
		calc += `= **${letters}** letters = **${bqh / 4}**${I6plus} hearts or **${bqh}**${I6plus} Qh.\n\n`

		var total = bqh + Math.floor(bqh * attack / 100) + Math.ceil(bqh * gems / 100);

		calc += `Total = ${bqh / 4} + floor(${bqh / 4} * ${attack}%) + ceil(${bqh / 4} * ${gems}%)\n`;
		calc += `          = ${bqh / 4} + ${Math.floor(bqh * attack / 100) / 4} + ${Math.ceil(bqh * gems / 100) / 4} = **${total / 4}** hearts.\n\n`;
		calc += `Total = ${bqh} + floor(${bqh} * ${attack}%) + ceil(${bqh} * ${gems}%)\n`;
		calc += `          = ${bqh} + ${Math.floor(bqh * attack / 100)} + ${Math.ceil(bqh * gems / 100)} = **${total}** Qh.`;

		msg.channel.send(calc)
	} else if (cmdMsg[0] === '!hangman') {
		player = msg.author;
		showGameMenu();
	} else if (cmdMsg[0] === '!test') {

	} else if (cmdMsg[0] === '!randomtrainer'
		|| cmdMsg[0] === '!realtrainer') {
		if (cmdMsg[0][2] === 'a') {
			trainer = 1;
		} else {
			trainer = 2;
		}
		trainerGame = false;
		trainerPlayer = msg.author;
		trainerRack = randomRack()[1];
		msg.channel.send("\n\n" + generateRack(trainerRack));
	} else if (cmdMsg[0] === '!wordchallenge') {
		racksGiven = 0;
		points = 0;
		possiblePoints = 0;
		trainerGame = true;
		trainer = 0;
		trainerPlayer = msg.author;
		trainerRack = randomRack()[1];
		msg.channel.send("Rack 1/10")
		msg.channel.send(generateRack(trainerRack));
	} else if (cmdMsg[0] === '!submit' && msg.author.id === trainerPlayer.id) {
		var validWords = findValidWords(trainerRack);
		if (validWords.includes(cmdMsg[1])) {
			var word = cmdMsg[1]
			if (trainerGame === false) {
				msg.channel.send(word.toUpperCase() + " has a value of **" + findWordValue(word, 2, 1) + "**.")
				validWords.sort((a, b) => findWordValue(b, 2, 1) - findWordValue(a, 2, 1));
				var place = validWords.indexOf(cmdMsg[1]);
				if (place < 3) {
					msg.channel.send(`${[":first_place:", ":second_place:", ":third_place:"][place]} ` +
						`You reached the ${["BEST", "second best", "third best"][place]} word in this rack. :thumbsup:`)


				} else {
					msg.channel.send(`Your word is the **#${place + 1}** word in this rack. :thumbsup:`)
				}
			}
			msg.channel.send("Best words: \n" + findBestWord(validWords));
			if (trainer === 2) {
				for (var j = 0; j < word.length; j++) {
					for (k = 0; k < trainerRack.length; k++) {

						if (trainerRack[k] === word[j]) {
							part1 = trainerRack.substring(0, k);
							part2 = trainerRack.substring(k + 1, trainerRack.length);
							trainerRack = part1 + part2;
							break;
						}
					}
				}
			}
			var trainerRackLength = trainerRack.length;
			if (trainer === 1) {
				trainerRack = randomRack()[1];
				msg.channel.send("\n\n" + generateRack(trainerRack));
			}
			else if (trainer === 2) {
				for (var i = 0; i < (16 - trainerRackLength); i++) {
					var randNum = Math.round(Math.random() * 10000);
					var index = 0;
					while (randNum > letterChances[index]) {
						index++;
					}
					trainerRack += alphabet[index];

				}
				msg.channel.send("\n\n" + generateRack(trainerRack));
			}
			else if (trainerGame === true) {

				possiblePoints += findWordValue(findValidWords(trainerRack).sort((a, b) => findWordValue(b) - findWordValue(a))[0], 2, 1)
				racksGiven++;
				points += findWordValue(word, 2, 1)
				trainerRack = randomRack()[1]
				if (racksGiven == 10) {
					msg.channel.send("Game over. Well done!\n You earned " + points + " out of a possible " + possiblePoints + " points, which works out to a " + Math.round((points / possiblePoints) * 10000) / 100 + "% accuracy.")
					racksGiven = 0;
					possiblePoints = 0;
					points = 0;
					trainerRack = "";
					trainerPlayer = null;
				} else {
					msg.channel.send("Rack " + (racksGiven + 1) + "/10")
					msg.channel.send(generateRack(trainerRack));
				}
			}

		} else msg.channel.send("Invalid word!")

		trainerPlayer = msg.author;

	} else if (cmdMsg[0] === '!board' && trainerPlayer.id === msg.author.id) {
		msg.channel.send(generateRack(trainerRack));
	} else if (cmdMsg[0] === '!scramble' && trainerPlayer.id === msg.author.id && trainerGame === false) {
		msg.channel.send(findBestWord(findValidWords(trainerRack)));
		trainerPlayer = msg.author;
		trainerRack = randomRack()[1];
		msg.channel.send("\n\n" + generateRack(trainerRack));
	} else if (cmdMsg[0] === '!runners') {
		msg.channel.send(owner);
	} else if (cmdMsg[0] === '!sequence') {
		var sequence = cmdMsg[1].toLowerCase();
		var result = '';
		var resultArray = [];
		for (var i = 0; i < wordList.length; i++) {
			if (wordList[i].length !== wordList[i].replace(sequence, '').length) {
				resultArray.push(wordList[i]);
			}
		}
		msg.channel.send('There are ' + resultArray.length + ' words that contain this sequence of letters in the BA 1 Dictionary.');
		resultArray.sort((a, b) => findWordValue(b, 2, 1) - findWordValue(a, 2, 1))
		sendArrayOfWords(resultArray);
	} else if (cmdMsg[0] === '!begins') {
		var sequence = cmdMsg[1].toLowerCase();
		if (sequence === undefined) {
			msg.channel.send("Use `!begins` with a sequence of letters as the arguments.");
			return;
		}
		var result = '';
		var resultArray = [];
		for (var i = 0; i < wordList.length; i++) {
			if (wordList[i].substring(0, sequence.length) === sequence) {
				resultArray.push(wordList[i]);
			}
		}
		msg.channel.send('There are ' + resultArray.length + ' words that begin with this sequence of letters in the BA 1 Dictionary.');
		resultArray.sort((a, b) => findWordValue(b, 2, 1) - findWordValue(a, 2, 1))
		sendArrayOfWords(resultArray);
	} else if (cmdMsg[0] === '!ends') {
		var sequence = cmdMsg[1].toLowerCase();
		if (sequence === undefined) {
		msg.channel.send("You didn't supply needed arguments. Try again with a string of letters after `!ends`.");
		return; 
		}
		var result = "";
		var pageArray = []
		for (var i = 0; i < wordList.length; i++) {
			if (wordList[i].substring(wordList[i].length - sequence.length, wordList[i].length) === sequence) {
				if (result.length + wordList[i].length >= 1996) {
				   result += "...";
				   pageArray.push(result);
				   result = wordList[i] + ", ";
				} else result += wordList[i] + ", ";
			}
		} 
		pageArray.push(result);
		console.log(pageArray)
		msg.channel.send(pageArray[0])


	} else if (cmdMsg[0] === '!contains') {
		var contain = cmdMsg[1].toLowerCase();
		var result = '';
		var resultArray = [];
		for (var i = 0; i < wordList.length; i++) {
			var lettersLeft = wordList[i];
			var lettersRemoved = 0;
			for (var j = 0; j < contain.length; j++) {
				if (lettersLeft.length !== lettersLeft.replace(contain[j], '').length) {
					lettersLeft = lettersLeft.replace(contain[j], '');
					lettersRemoved++;
				}
				else break;
			}
			if (lettersRemoved == contain.length) {
				resultArray.push(wordList[i]);
			}
		}
		msg.channel.send('There are ' + resultArray.length + ' words that contain the requested letters in the BA 1 Dictionary.');

		sendArrayOfWords(resultArray.sort((a, b) => findWordValue(b, 2, 1) - findWordValue(a, 2, 1)));
	} else if (cmdMsg[0] === '!helpupdate') {
		if (msg.author.username === owner) {
			var data = "{\n" + `"Title": ">>> **Help with the Pen**",` + "\n";
			for (var i = 0; i < helpJSON.length; i++) {
				data += `"` + (i + 1) + `": ` + `"` + helpJSON[i] + `"` + (i !== helpJSON.length - 1 ? "," : "") + "\n"
			}
			data += "}"
			fs.writeFileSync("help.json", data)

			console.log("Help Update success! But you still need to restart the bot! :(")
		} else {
			console.log("Help Update failed: Wrong person.")
		}
	} else if (cmdMsg[0] === '!help') {

		var help = require('./help.json');
		var page = cmdMsg[1];
		if (page === undefined) page = "1";

		msg.channel.send(help.Title + " (" + page + "/3)\n\n" + help[page])
	}
});
