import CategoryFilter from '@/components/pages/menu/category-filter';
import MenuList from '@/components/pages/menu/menu-list';
import { getCategories } from '@/lib/actions/category.action';

interface Props {
	searchParams: Promise<{
		category?: string;
	}>;
}

export default async function Page({ searchParams }: Props) {
	const s = await searchParams;

	const categories = await getCategories();

	return (
		<div className='min-h-screen px-4 md:px-6'>
			<div className='container mx-auto max-w-6xl pb-10'>
				<div className='text-center mb-12'>
					<h1 className='text-4xl md:text-5xl font-bold mb-4 py-0.5'>
						<span className='text-brand'>Menu</span> That{' '}
						<span className='text-brand'>Always</span>
						<br />
						Make You Fall In <span className='text-brand'>Love</span>
					</h1>
				</div>

				{/* Categories */}
				<CategoryFilter searchParams={s} categories={categories} />

				{/* Menu Grid */}
				<MenuList slug={s.category} />
			</div>
		</div>
	);
}
