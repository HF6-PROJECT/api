import { pusher } from '../../plugins/pusher';
import { Item } from './item.schema';

export enum ItemEventType {
	UPDATE = 'update',
	DELETE = 'delete',
}

const getItemParentChannel = (item: Item): string => {
	if (!item.parentId) {
		return `browser-root-${item.ownerId}`;
	}

	return `browser-folder-${item.parentId}`;
};

export const triggerItemEvent = async (item: Item, type: ItemEventType): Promise<void> => {
	const channelName = getItemParentChannel(item);

	await pusher.trigger(channelName, type, item);
};
