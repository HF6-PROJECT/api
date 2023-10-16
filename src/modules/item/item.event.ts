import { pusher } from '../../plugins/pusher';
import { Item } from './item.schema';

export enum ItemEventType {
	UPDATE = 'update',
	DELETE = 'delete',
}

/* istanbul ignore next */
const getItemParentChannel = (item: Item): string => {
	if (!item.parentId) {
		return `browser-root-${item.ownerId}`;
	}

	return `browser-folder-${item.parentId}`;
};

/* istanbul ignore next */
export const triggerItemEvent = async (item: Item, type: ItemEventType): Promise<void> => {
	if (process.env.NODE_ENV === 'test') {
		return;
	}

	/* istanbul ignore next */
	const channelName = getItemParentChannel(item);

	/* istanbul ignore next */
	await pusher.trigger(channelName, type, item);
};
