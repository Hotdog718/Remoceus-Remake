const b = require("../../Badges.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
	name: "profile",
	aliases: [],
	category: "General",
	description: "Displays yours or other another member's profile",
	usage: "[@user]",
	permissions: [],
	run: async (client, message, args) => {
		await message.guild.members.fetch();
    let leUser = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.find(member => member.user.username === args.join(" ")) || message.member;

		let friendCard = await client.gameinfo.getGameInfo(leUser.id);
    let badges = await client.badges.getBadges(leUser.id, message.guild.id)

		let embed = new MessageEmbed()
		.setTitle(`${leUser.nickname || leUser.user.username}\'s Profile`)
		.setColor(leUser.roles.color ? leUser.roles.color.color : client.config.color)
		.setThumbnail(leUser.user.displayAvatarURL())
    .setDescription(badges ? badges.hometown : '')
		.addField("FC", friendCard? friendCard.fc: "No FC set, use !setfc <fc> to set your fc (ex. !setfc 1234-5678-9012)")
		.addField("IGN", friendCard? friendCard.ign: "No IGN set, use !setign <ign> to set your ign (ex. !setign John)");

    if(badges){
      let major = [];
      let minor = [];

      const gymRules = await client.gymrules.getGyms(message.guild.id);

      for(const rules of gymRules){
        const emote = client.emojis.cache.find(emote => emote.name === `type_${rules.type}`);
        if(rules.majorLeague){
          if(badges[rules.type]){
            major.push(emote ? emote : b[rules.type]);
          }
        }else{
          if(badges[rules.type]){
            minor.push(emote ? emote : b[rules.type]);
          } 
        }
      }

      const badgeArray = (await client.badges.getAllBadges(message.guild.id))
      .filter(value => {
        const member = message.guild.members.cache.get(value.userID);
        if(!member) return false;
        return true;
      })

      embed.addField(`__Major League Badges__`, major.length > 0 ? major.join(" ") : `No Major League badges.`)
           .addField(`__Minor League Badges__`, minor.length > 0 ? minor.join(" ") : `No Minor League badges.`)
           .addField(`__Points__`, `${badges.points} (${client.helpers.getClass(badges.points)} Division)`, true)
           .addField('Ranking', `#${client.helpers.getRanking(message, badges, badgeArray)}`, true)
           .setFooter(`Badge Count: ${badges.count} out of 18`);
    }else{
      embed.addField(`No Badges`, `Use !register [hometown] to sign up to challenge the gyms.`);
    }

		message.channel.send(embed);
	}
}
