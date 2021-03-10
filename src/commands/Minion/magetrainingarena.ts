import { CommandStore, KlasaMessage } from 'klasa';

import { Emoji } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { stringMatches } from '../../lib/util';
import getOSItem from '../../lib/util/getOSItem';

const buyables = [
	{
		item: getOSItem('Infinity gloves'),
		price: {
			telekinetic: 175,
			alchemist: 225,
			enchantment: 1500,
			graveyard: 175
		}
	},
	{
		item: getOSItem('Infinity hat'),
		price: {
			telekinetic: 350,
			alchemist: 400,
			enchantment: 3000,
			graveyard: 350
		}
	},
	{
		item: getOSItem('Infinity top'),
		price: {
			telekinetic: 400,
			alchemist: 450,
			enchantment: 4000,
			graveyard: 400
		}
	},
	{
		item: getOSItem('Infinity bottoms'),
		price: {
			telekinetic: 450,
			alchemist: 500,
			enchantment: 5000,
			graveyard: 450
		}
	},
	{
		item: getOSItem('Infinity boots'),
		price: {
			telekinetic: 120,
			alchemist: 120,
			enchantment: 1200,
			graveyard: 120
		}
	},
	{
		item: getOSItem('Beginner wand'),
		price: {
			telekinetic: 30,
			alchemist: 30,
			enchantment: 300,
			graveyard: 30
		}
	},
	{
		item: getOSItem('Apprentice wand'),
		price: {
			telekinetic: 60,
			alchemist: 60,
			enchantment: 600,
			graveyard: 60
		}
	},
	{
		item: getOSItem('Teacher wand'),
		price: {
			telekinetic: 150,
			alchemist: 200,
			enchantment: 1500,
			graveyard: 150
		}
	},
	{
		item: getOSItem('Master wand'),
		price: {
			telekinetic: 240,
			alchemist: 240,
			enchantment: 2400,
			graveyard: 240
		}
	},
	{
		item: getOSItem("Mage's book"),
		price: {
			telekinetic: 500,
			alchemist: 550,
			enchantment: 6000,
			graveyard: 500
		}
	},
	{
		item: getOSItem('Bones to Peaches'), // TODO is an unlock not an item
		price: {
			telekinetic: 200,
			alchemist: 300,
			enchantment: 2000,
			graveyard: 200
		}
	},
	{
		item: getOSItem('Mist rune'),
		price: {
			telekinetic: 1,
			alchemist: 1,
			enchantment: 15,
			graveyard: 1
		}
	},
	{
		item: getOSItem('Dust rune'),
		price: {
			telekinetic: 1,
			alchemist: 1,
			enchantment: 15,
			graveyard: 1
		}
	},
	{
		item: getOSItem('Mud rune'),
		price: {
			telekinetic: 1,
			alchemist: 1,
			enchantment: 15,
			graveyard: 1
		}
	},
	{
		item: getOSItem('Smoke rune'),
		price: {
			telekinetic: 1,
			alchemist: 1,
			enchantment: 15,
			graveyard: 1
		}
	},
	{
		item: getOSItem('Steam rune'),
		price: {
			telekinetic: 1,
			alchemist: 1,
			enchantment: 15,
			graveyard: 1
		}
	},
	{
		item: getOSItem('Lava rune'),
		price: {
			telekinetic: 1,
			alchemist: 1,
			enchantment: 15,
			graveyard: 1
		}
	},
	{
		item: getOSItem('Cosmic rune'),
		price: {
			telekinetic: 0,
			alchemist: 0,
			enchantment: 5,
			graveyard: 0
		}
	},
	{
		item: getOSItem('Chaos rune'),
		price: {
			telekinetic: 0,
			alchemist: 1,
			enchantment: 5,
			graveyard: 1
		}
	},
	{
		item: getOSItem('Nature rune'),
		price: {
			telekinetic: 0,
			alchemist: 1,
			enchantment: 0,
			graveyard: 1
		}
	},
	{
		item: getOSItem('Death rune'),
		price: {
			telekinetic: 2,
			alchemist: 1,
			enchantment: 20,
			graveyard: 1
		}
	},
	{
		item: getOSItem('Law rune'),
		price: {
			telekinetic: 2,
			alchemist: 0,
			enchantment: 0,
			graveyard: 0
		}
	},
	{
		item: getOSItem('Soul rune'),
		price: {
			telekinetic: 2,
			alchemist: 2,
			enchantment: 25,
			graveyard: 2
		}
	},
	{
		item: getOSItem('Blood rune'),
		price: {
			telekinetic: 2,
			alchemist: 2,
			enchantment: 25,
			graveyard: 2
		}
	}
];

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			requiredPermissions: ['ADD_REACTIONS', 'ATTACH_FILES'],
			categoryFlags: ['minion', 'minigame'],
			description: 'Sends your minion to train at the Mage Training Arena.',
			examples: ['+mta'],
			subcommands: true,
			usage: '<buy|points|train> [quantity:int{1}|str:...str] [str:...str]',
			usageDelim: ' ',
			aliases: ['mta']
		});
	}

	async buy(
		msg: KlasaMessage,
		[quantity = 1, input = '']: [undefined | string | number, string]
	) {
		if (typeof quantity === 'string') {
			input = quantity;
			quantity = 1;
		}

		if (!quantity) {
			quantity = 1;
		}

		const item = buyables.find(i => stringMatches(input, i.item.name));
		if (!item) {
			return msg.channel.send(
				`That's not a valid item to buy from the reward shop. These are the items you can buy: ${buyables
					.map(i => i.item.name)
					.join(', ')}.`
			);
		}

		const [telekineticPrice, alchemistPrice, enchantmentPrice, graveyardPrice] = [
			item.price.telekinetic * quantity,
			item.price.alchemist * quantity,
			item.price.enchantment * quantity,
			item.price.graveyard * quantity
		];

		const [telekineticBal, alchemistBal, enchantmentBal, graveyardBal] = [
			msg.author.settings.get(UserSettings.PizazzPoints.Telekinetic),
			msg.author.settings.get(UserSettings.PizazzPoints.Alchemist),
			msg.author.settings.get(UserSettings.PizazzPoints.Enchantment),
			msg.author.settings.get(UserSettings.PizazzPoints.Graveyard)
		];

		if (
			telekineticBal < telekineticPrice ||
			alchemistBal < alchemistPrice ||
			enchantmentBal < enchantmentPrice ||
			graveyardBal < graveyardPrice
		) {
			let str = 'You do not have enough Pizazz points to buy this.\n';
			str += `**x${quantity} ${item.item.name} costs:**\n`;
			str += `- ${telekineticPrice} Telekinetic points\n`;
			str += `- ${alchemistPrice} Alchemist points\n`;
			str += `- ${enchantmentPrice} Enchantment points\n`;
			str += `- ${graveyardPrice} Graveyard points`;

			return msg.channel.send(str);
		}

		await msg.author.settings.update(
			UserSettings.PizazzPoints.Telekinetic,
			telekineticBal - telekineticPrice
		);
		await msg.author.settings.update(
			UserSettings.PizazzPoints.Alchemist,
			alchemistBal - alchemistPrice
		);
		await msg.author.settings.update(
			UserSettings.PizazzPoints.Enchantment,
			enchantmentBal - enchantmentPrice
		);
		await msg.author.settings.update(
			UserSettings.PizazzPoints.Graveyard,
			graveyardBal - graveyardPrice
		);

		if (item.item === getOSItem('Bones to Peaches')) {
			if (!msg.author.settings.get(UserSettings.UnlockedBonesToPeaches)) {
				await msg.author.settings.update(UserSettings.UnlockedBonesToPeaches, true);
				return msg.channel.send(
					`${Emoji.Magic}${msg.author.minionName} has unlocked the Bones to Peaches spell!`
				);
			}
			return msg.channel.send(`${msg.author.minionName} already knows this spell!`);
		}
		await msg.author.addItemsToBank({ [item.item.id]: quantity }, true);

		return msg.channel.send(`Added ${quantity}x ${item.item.name} to your bank.`);
	}

	async points(msg: KlasaMessage) {
		let str = `${Emoji.Magic}${msg.author.minionName}'s Pizazz points:\n`;
		str += `**Telekinetic:** ${msg.author.settings.get(
			UserSettings.PizazzPoints.Telekinetic
		)}\n`;
		str += `**Alchemist:** ${msg.author.settings.get(UserSettings.PizazzPoints.Alchemist)}\n`;
		str += `**Enchantment:** ${msg.author.settings.get(
			UserSettings.PizazzPoints.Enchantment
		)}\n`;
		str += `**Graveyard:** ${msg.author.settings.get(UserSettings.PizazzPoints.Graveyard)}\n`;

		return msg.channel.send(str);
	}

	// async train(msg: KlasaMessage, [input = '']: [string]) {
	// 	// TODO
	// }
}
