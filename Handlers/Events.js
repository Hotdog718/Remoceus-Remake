const { MessageEmbed, DiscordAPIError } = require('discord.js');

module.exports = (client) => {
	const updateGymCache = async () => {
		// Update Gym Cache
		try{
			return await client.gymrules.updateCache();
		}catch(e){
			throw 'Something went wrong updating gymrules cache';
		}
	}

	const updateBadgeCache = async () => {
		// Update badge cache
		try{
			return await client.badges.updateCache();
		}catch(e){
			throw 'Something went wrong updating badge cache';
		}
	}

	const updateGameInfoCache = async () => {
		// Update Game Info Cache
		try{
			await client.gameinfo.updateCache();
		}catch(e){
			throw "Failed to update Game Info cache.";
		}
	}

	const updateBanListCache = async() => {
		// Update Ban List Cache
		try{
			await client.banlist.updateCache();
		}catch(e){
			throw "Failed to update Ban List cache.";
		}
	}

	const updateACLACache = async () => {
		// Update ACLA cache
		try{
			await client.acla.updateCache();
		}catch(e){
			throw "Failed to update ACLA cache.";
		}
	}

	client.once("ready", async () => {
		try{
			await updateBadgeCache();
			console.log("Updated Badge Cache");
			await updateGymCache();
			console.log("Updated Gym Cache");
			await updateGameInfoCache();
			console.log("Updated Game Info Cache");
			await updateACLACache();
			console.log("Updated ACLA Cache");
		}catch(e){
			console.error(e);
		}finally{
			console.log(`${client.user.tag} is online!`);
		}
	});

	// client.setInterval(async () => {
	// 	try{
	// 		await updateBadgeCache();
	// 		console.log("Updated Badge Cache");
	// 		await updateGymCache();
	// 		console.log("Updated Gym Cache");
	// 		await updateGameInfoCache();
	// 		console.log("Updated Game Info Cache");
	// 	}catch(e){
	// 		console.error(e);
	// 	}
	// }, 21600000);

	client.on("guildMemberAdd", async (member) => {
		let joinMessage = ["Please leave your soul at the door, LowRes will come to collect it later.", "Be sure to leave a tribute to appease the glitch gods!", "Don't ask the humble merchant about the monkey's paw, he's out of stock!", "Please don't clap your hands thinking it'll rain. That stopped working after Gen 5.", "If you don't pick Moo Moo Meadows, you're against freedom."]
		let channel = member.guild.systemChannel;
		if(channel){
			channel.send(`Welcome ${member} to ${member.guild.name}! ${joinMessage[Math.floor(Math.random()*joinMessage.length)]}`, {
				files: [{
					attachment: `./Images/Banner.png`,
					name: `Banner.png`
				}]
			}).catch(err => console.log(err));
		}
	})

	const checkMember = async (member) => {
		let memberRole = member.guild.roles.cache.find(r => r.name === "Members");
		if(member.roles.cache.has(memberRole.id)){
			return;
		}
		if(memberRole){
			member.roles.add(memberRole.id).catch(err => {});
		}
		return;
	}

	client.on("message", async (message) => {
		if(message.channel.type === "dm") return;
		if(message.author.bot){
			return;
			// let currentMember = message.guild.members.cache.find(member => member.user.tag === message.author.username);
			// if(currentMember){
			// 	message.author = currentMember.user;
			// 	message.member = currentMember;
			// }else{
			// 	return;
			// }
		}
		checkMember(message.member);

		if(message.content === "update cache" && message.author.id === client.config.botowner){
			// Update Gym Cache
			try{
				await client.gymrules.updateCache();
				message.channel.send("Updated Gym Cache");
			}catch(e){
				message.channel.send('Something went wrong updating gymrules cache');
				console.error(e);
			}
			
			// Update badge cache
			try{
				await client.badges.updateCache();
				message.channel.send("Updated Badge Cache");
			}catch(e){
				message.channel.send('Something went wrong updating badge cache');
				console.error(e);
			}

			// Update Game Info Cache
			try{
				await client.gameinfo.updateCache();
				message.channel.send("Updated Game Info Cache");
			}catch(e){
				message.channel.send("Failed to update Game Info cache.");
				console.error(e);
			}

			// Update Banlist Cache
			try{
				await client.banlist.updateCache();
				message.channel.send("Updated Banlist Cache");
			}catch(e){
				message.channel.send("Failed to update banlist cache.");
				console.error(e);
			}

			// Update ACLA Cache
			try{
				await client.acla.updateCache();
				message.channel.send("Updated ACLA Cache");
			}catch(e){
				message.channel.send("Failed to update ACLA cache.");
			}
		}
		
		if(/^wins:\s*[0-9]+$/gmi.test(message.content) && /^losses:\s*[0-9]+$/gmi.test(message.content) && /^total\spoints\scollected:\s*[0-9]+$/gmi.test(message.content)){
			let wins = message.content.match(/^wins:\s*[0-9]+$/gmi)[0].split(/:\s*/gmi)[1];
			let losses = message.content.match(/^losses:\s*[0-9]+$/gmi)[0].split(/:\s*/gmi)[1];
			let points = message.content.match(/^total\spoints\scollected:\s*[0-9]+$/gmi)[0].split(/:\s*/gmi)[1];
			
			let type = client.helpers.getGymType(client, message.member);
			if(type){
				try{
					await client.gymrules.updateGymStats(wins, losses, points, type, message.guild.id);
					message.channel.send('Updated gym wins-losses');
					message.react('☑️');
				}catch(e){
					console.error(e);
					message.channel.send(`Something went wrong trying to update your score, please try again later or just ask hotdog to do it for you`);
					message.react('❌');
				}
			}
		}

		let prefix = client.config.prefix;
		let messageArray = message.content.split(" ");
		let cmd = messageArray[0];
		let args = messageArray.slice(1);
		let command = client.commands.get(cmd.slice(prefix.length) || client.aliases.get(cmd.slice(prefix.length)));

		if(!command || !message.content.startsWith(prefix)){
			return;
		}
		try{
			command.run(client, message, args);
		}catch(e){
			console.log(e)
		}
	})

	// client.on('presenceUpdate', async (oldPresence, newPresence) => {
	// 	if(newPresence.status === 'offline'){
	// 		let guildMember = newPresence.member;
	// 		let type = client.helpers.getGymType(client, guildMember);
	// 		if(type){
	// 			let rules = await client.gymrules.getGymType(type, guildMember.guild.id);
	// 			if(rules.open){
	// 				guildMember.send('You forgot to close your gym');
	// 			}
	// 		}
	// 	}
	// })

	client.on('guildBanAdd', async (guild, user) => {
		const logsChannel = guild.channels.cache.find(c => c.name === client.config.logsChannel);

		if(!logsChannel) return;
		
		// const banInfo = await guild.fetchBan(user);
		const banLogs = (await guild.fetchAuditLogs({type: 'MEMBER_BAN_ADD'}));

		const banInfo = banLogs.entries.first();
		const banEmbed = new MessageEmbed()
		.setTitle("Banned User Log")
		.setThumbnail(user.displayAvatarURL())
		.setColor(client.config.color)
		.addField("Banned User", `${user.tag} (${user.id})`)
		.addField("Banned By", `${banInfo.executor.tag} (${banInfo.executor.id})`);
		if(banInfo.reason){
			banEmbed.addField("Reason", banInfo.reason);
		}
		logsChannel.send(banEmbed);
	})

	client.on('guildMemberRemove', async (member) => {
		const logsChannel = member.guild.channels.cache.find(c => c.name === client.config.logsChannel);
		
		if(!logsChannel) return;
		const logs = await member.guild.fetchAuditLogs();
		if(logs.entries.first().target.id === member.id && logs.entries.first().action === 'MEMBER_KICK'){
			const kicklog = logs.entries.first();
			const kickEmbed = new MessageEmbed()
			.setTitle("Kick Embed")
			.setThumbnail(member.user.displayAvatarURL())
			.setColor(client.config.color)
			.addField("Kicked User", `${member.user.tag} (${member.id})`)
			.addField("Kicked By", `${kicklog.executor.tag} (${kicklog.executor.id})`);
			if(kicklog.reason){
				kickEmbed.addField("Reason", kicklog.reason);
			}
			logsChannel.send(kickEmbed);
		}
	})

	client.on("error", (err) => console.log(err));
	client.on("warn", (info) => console.warn(info));

	client.login(process.env.TOKEN);
}
