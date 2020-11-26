const { mongodb_uri } = require("../../token.json");
const mongoose = require("mongoose");

const { MessageEmbed, MessageCollector } = require("discord.js");
const MOTW = require("../../Models/MOTW.js");
const Pokemon = require("../../Utils/Pokemon.js");

module.exports = {
	name: "motw",
	aliases: [],
	category: "MOTW",
	description: "Displays most recent MOTW moveset, or all movesets to a specific pokemon (Only has pokemon in motws after 2020)",
	usage: "<none or PokemonName>",
	permissions: [],
	run: async (client, message, args) => {
		if(message.deletable) message.delete();
		let motws = args[0] ? await getMOTWWithSpecies(args.join(" ")) : await getMOTW();
		if(motws && motws.length > 1){
			motws = motws.reverse();
		}

		client.helpers.createMenuEmbed(client, message, motws, createMOTWEmbed);
	}
}

const createMOTWEmbed = (client, index, motws) => {
	let embed = new MessageEmbed()
	.setColor(client.config.color);
	if(!motws || motws.length === 0 || !motws[index]){
		embed.addField("No MOTWs", "Come back later!");
	}else{
		let currentSet = motws[index];
		embed.setTitle(currentSet.setName)
				 .setThumbnail(Pokemon.GetSerebiiURL(currentSet.pokemon, currentSet.forme, currentSet.shiny))
				 .addField("Pokemon", client.helpers.toTitleCase(currentSet.pokemon))
				 .addField("Ability(s)", currentSet.ability)
				 .addField("Item(s)", currentSet.item)
				 .addField("EVs", `${formatEVSpread(currentSet)}`)
				 .addField("Moveset", `${currentSet.move1}\n${currentSet.move2}\n${currentSet.move3}\n${currentSet.move4}`)
				 .setFooter(`Set #${index+1} of ${motws.length}`);
				 if(currentSet.ytLink){
           embed.setURL(currentSet.ytLink);
         }
	}
	return embed;
}

const formatEVSpread = ({evs}) => {
	let res = ``;
	let keys = Object.keys(evs);
	let stat = {
		hp: "HP",
		atk: "Atk",
		def: "Def",
		spa: "Sp. Atk",
		spd: "Sp. Def",
		spe: "Speed"
	};
	for(let i = 0; i < keys.length; i++){
		if(evs[i] != 0){
			res += `${evs[keys[i]]} ${stat[keys[i]]}, `;
		}
	}
	return res.substring(0, res.length - 2);
}

const getMOTW = async () => {
	const db = await mongoose.connect(mongodb_uri, {useNewUrlParser: true, useUnifiedTopology: true});
	let motws = await new Promise(function(resolve, reject) {
		MOTW.find().exec((err, res) => {
			if(err) console.log(err);
			if(!res) resolve([]);
			resolve(res);
		})
	});
	db.disconnect();
	return motws;
}

const getMOTWWithSpecies = async (species) => {
	const db = await mongoose.connect(mongodb_uri, {useNewUrlParser: true, useUnifiedTopology: true});
	let motws = await new Promise(function(resolve, reject) {
		MOTW.find({
			pokemon: species.toLowerCase()
		}).exec((err, res) => {
			if(err) console.log(err);
			if(!res) resolve([]);
			resolve(res);
		})
	});
	db.disconnect();
	return motws;
}
