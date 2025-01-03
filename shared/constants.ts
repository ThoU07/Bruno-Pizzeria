export const APP_NAME = 'Bruno Pizza';
export const APP_SUBTITLE = 'More than just a pizza';
export const APP_DESCRIPTION =
	'Place that do you want to try the best pizza in the world';
export const currency = 'VND';
export const PHONE_CONTACT = '0904355270'
export const DEFAULT_IMAGE =
	'/assets/images/photo-1628840042765-356cda07504e.png';
export const CATEGORY_CUSTOM = `6775102d0018da09c89c`
export const SIZE_CUSTOM = `674f21ac000b46e1c01c`
export const DEFAULT_CUSTOM_PRICE = 150000

export const ROUTES = [
	{
		label: 'Home',
		href: '/',
	},
	{
		label: 'Menu',
		href: '/menu',
	},
	{
		label: 'Pizza Builder',
		href: '/pizza-builder',
	},
	{
		label: 'About',
		href: '/about',
	},
];

export const actionsDropdownItems = [
	{
		label: 'Rename',
		icon: '/assets/icons/edit.svg',
		value: 'rename',
	},
	{
		label: 'Details',
		icon: '/assets/icons/info.svg',
		value: 'details',
	},
	{
		label: 'Share',
		icon: '/assets/icons/share.svg',
		value: 'share',
	},
	{
		label: 'Download',
		icon: '/assets/icons/download.svg',
		value: 'download',
	},
	{
		label: 'Delete',
		icon: '/assets/icons/delete.svg',
		value: 'delete',
	},
];

export const sortTypes = [
	{
		label: 'Date created (newest)',
		value: '$createdAt-desc',
	},
	{
		label: 'Created Date (oldest)',
		value: '$createdAt-asc',
	},
	{
		label: 'Name (A-Z)',
		value: 'name-asc',
	},
	{
		label: 'Name (Z-A)',
		value: 'name-desc',
	},
	{
		label: 'Size (Highest)',
		value: 'size-desc',
	},
	{
		label: 'Size (Lowest)',
		value: 'size-asc',
	},
];

export const avatarPlaceholderUrl =
	'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg';

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
