import { MessageAttachment } from 'discord.js';

import chatHeadImage from './chatHeadImage';

export default async function mejJalImage(str: string) {
	const image = await chatHeadImage({ npc: 'Jad', content: str, name: 'TzHaar-Mej-Jal' });
	return new MessageAttachment(image);
}
