const { mongodb_uri } = require("../../token.json");
const mongoose = require("mongoose");
const { MessageEmbed } = require("discord.js");
const Badges = require("../../Models/Badges.js");
const resultsPerPage = 10;

module.exports = {
	name: "rankings",
	aliases: [],
	category: "Gym Challenge",
	description: "Displays the current gym rankings from most badges to least",
	usage: "",
	permissions: [],
	run: async (client, message, args) => {
    let index = 0;
		const db = await mongoose.connect(mongodb_uri, {useNewUrlParser: true, useUnifiedTopology: true});
    let badgeArray = await Badges.find({serverID: message.guild.id});
		db.disconnect();
    if(badgeArray.length <= 0) return message.channel.send(`Sorry, there was no documents that I could find.`).then(m => m.delete({timeout: 5000}));
    let maxPages = Math.ceil(badgeArray.length/resultsPerPage);
    badgeArray = badgeArray.sort((a, b) => {
      if(a.count == b.count){
        let aName = a.name.toUpperCase();
        let bName = b.name.toUpperCase();
        if(aName > bName){
          return 1;
        }
        if(aName < bName){
          return -1;
        }
        return 0;
      }
      return b.count - a.count;
    })
    message.channel.send(await getEmbed(client, badgeArray, index))
      .then(msg => {
        let reactions = ["⬅", "➡", "⏹"];
  			reactions.forEach(function(r, i){
  				setTimeout(function(){
  					msg.react(r);
  				}, i*800)
  			})

  			//set filter to only let only set reactions and message author to respond
  			const filter = (reaction, user) => {
  				return reactions.includes(reaction.emoji.name) && user.id === message.author.id;
  			}

  			//create reactionCollector
  			const collector = msg.createReactionCollector(filter, {});

  			collector.on('collect', async (reaction) => {
  				/*setTimeout(function(){
  					reaction.remove(message.author.id).catch(err => {});
  				}, 250)*/
  				switch(reaction.emoji.name){
  					case '⬅':{
  						index = (index-1) < 0? maxPages-1 :index-1;
  						msg.edit(await getEmbed(client, badgeArray, index));
  						break;
  					}
  					case '➡':{
  						index = (index+1)%maxPages;
  						msg.edit(await getEmbed(client, badgeArray, index));
  						break;
  					}
  					case '⏹':{
  						collector.emit('end');
  						break;
  					}
  				}
  			})

  			collector.on('end', collected => {
  				msg.delete();
  			})
      })
      .catch(err => console.log(err));
	}
}

async function getEmbed(client, badgeArray, index){
  let maxPages = Math.ceil(badgeArray.length/resultsPerPage);
  let embed = new MessageEmbed().setTitle(`Current SL Gym Rankings`).setColor(client.config.color).setThumbnail(client.user.displayAvatarURL()).setFooter(`Page ${index+1} of ${maxPages}`);
  for(let i = index*resultsPerPage; i < badgeArray.length && i < (index+1)*resultsPerPage; i++){
		let user = await client.users.fetch(badgeArray[i].userID);
    embed.addField(`#${i+1}: ${user.tag || "User not found"}`, `Badge Count: ${badgeArray[i].count}`);
  }
  return embed;
}