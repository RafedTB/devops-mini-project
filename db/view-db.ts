import dataSource from './data-source';
import { User } from '../src/users/user.entity';
import { Product } from '../src/products/product.entity';
import { Review } from '../src/reviews/review.entity';

async function viewDatabase() {
  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    await dataSource.synchronize();
    console.log('Connected successfully!\n');

    console.log('==================== USERS ====================');
    const users = await dataSource.getRepository(User).find();
    if (users.length === 0) {
      console.log('(No users found in database)');
    } else {
      console.table(
        users.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          userType: u.userType,
          isAccountVerified: u.isAccountVerified,
        }))
      );
    }

    console.log('\n=================== PRODUCTS ===================');
    const products = await dataSource.getRepository(Product).find();
    if (products.length === 0) {
      console.log('(No products found in database)');
    } else {
      console.table(
        products.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description?.substring(0, 30),
        }))
      );
    }

    console.log('\n=================== REVIEWS ===================');
    const reviews = await dataSource.getRepository(Review).find({
      relations: { user: true, product: true },
    });
    if (reviews.length === 0) {
      console.log('(No reviews found in database)');
    } else {
      console.table(
        reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          userId: r.user?.id,
          productId: r.product?.id,
        }))
      );
    }
  } catch (error) {
    console.error('Error viewing database content:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

viewDatabase();
