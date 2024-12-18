'use server';

import { EToppingType, ITopping } from '@/types/topping';
import { createAdminClient } from '../appwrite';
import { appwriteConfig } from '../appwrite/config';
import { ID, Query } from 'node-appwrite';

export const createTopping = async (
	topping: Omit<ITopping, '$id'>
): Promise<ITopping> => {
	try {
		const { databases } = await createAdminClient();

		const newTopping = await databases.createDocument(
			appwriteConfig.databaseId,
			appwriteConfig.toppingsCollectionId,
			ID.unique(),
			topping
		);

		return {
			$id: newTopping.$id,
			name: newTopping.name,
			price: newTopping.price,
			description: newTopping.description,
			image: newTopping.image,
			type: newTopping.type,
		};
	} catch (error) {
		console.error('Error creating topping:', error);
		throw error;
	}
};

export const getToppings = async (type?: EToppingType): Promise<ITopping[]> => {
	try {
		const { databases } = await createAdminClient();

		const toppingsList = type
			? await databases.listDocuments(
					appwriteConfig.databaseId,
					appwriteConfig.toppingsCollectionId,
					[Query.equal('type', [type])]
			  )
			: await databases.listDocuments(
					appwriteConfig.databaseId,
					appwriteConfig.toppingsCollectionId
			  );

		return toppingsList.documents.map((topping) => ({
			$id: topping.$id,
			name: topping.name,
			price: topping.price,
			description: topping.description,
			image: topping.image,
			type: topping.type,
		}));
	} catch (error) {
		console.error('Error fetching toppings:', error);
		throw error;
	}
};

export const getToppingById = async (toppingId: string): Promise<ITopping> => {
	try {
		const { databases } = await createAdminClient();

		const topping = await databases.getDocument(
			appwriteConfig.databaseId,
			appwriteConfig.toppingsCollectionId,
			toppingId
		);

		return {
			$id: topping.$id,
			name: topping.name,
			price: topping.price,
			description: topping.description,
			image: topping.image,
			type: topping.type,
		};
	} catch (error) {
		console.error('Error fetching topping:', error);
		throw error;
	}
};

export const updateTopping = async (
	toppingId: string,
	updatedTopping: Partial<ITopping>
) => {
	try {
		const { databases } = await createAdminClient();

		const updatedDocument = await databases.updateDocument(
			appwriteConfig.databaseId,
			appwriteConfig.toppingsCollectionId,
			toppingId,
			updatedTopping
		);

		return updatedDocument;
	} catch (error) {
		console.error('Error updating topping:', error);
		throw error;
	}
};

export const deleteTopping = async (toppingId: string) => {
	try {
		const { databases } = await createAdminClient();

		await databases.deleteDocument(
			appwriteConfig.databaseId,
			appwriteConfig.toppingsCollectionId,
			toppingId
		);

		return { success: true, message: 'Topping deleted successfully' };
	} catch (error) {
		console.error('Error deleting topping:', error);
		throw error;
	}
};
