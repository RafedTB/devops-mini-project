import dataSource from './data-source';
import { User } from '../src/users/user.entity';
import { Product } from '../src/products/product.entity';
import { Review } from '../src/reviews/review.entity';
import { UserType } from '../src/utils/enum';
import * as bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Connected successfully!');

    console.log('Creating/synchronizing database tables...');
    await dataSource.synchronize();
    console.log('Tables created successfully!');

    const userRepo = dataSource.getRepository(User);
    const productRepo = dataSource.getRepository(Product);
    const reviewRepo = dataSource.getRepository(Review);

    // Check if admin already exists
    const existingAdmin = await userRepo.findOne({ where: { email: 'admin@nestlearn.com' } });
    let admin = existingAdmin;
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = userRepo.create({
        username: 'Admin User',
        email: 'admin@nestlearn.com',
        password: hashedPassword,
        userType: UserType.ADMIN,
        isAccountVerified: true,
      });
      admin = await userRepo.save(admin);
      console.log('Created admin user: admin@nestlearn.com / admin123');
    }

    // Check if test user exists
    const existingUser = await userRepo.findOne({ where: { email: 'user@nestlearn.com' } });
    let testUser = existingUser;
    if (!testUser) {
      const hashedPassword = await bcrypt.hash('user123', 10);
      testUser = userRepo.create({
        username: 'John Doe',
        email: 'user@nestlearn.com',
        password: hashedPassword,
        userType: UserType.USER,
        isAccountVerified: true,
      });
      testUser = await userRepo.save(testUser);
      console.log('Created normal user: user@nestlearn.com / user123');
    }

    // Seed sample products if none exist
    const productCount = await productRepo.count();
    if (productCount === 0 && admin) {
      const p1 = await productRepo.save(
        productRepo.create({
          name: 'Wireless Noise-Canceling Headphones',
          description: 'High-fidelity audio with active noise cancellation and 30-hour battery life.',
          price: 199.99,
          user: admin,
        })
      );

      const p2 = await productRepo.save(
        productRepo.create({
          name: 'Mechanical Gaming Keyboard',
          description: 'RGB mechanical keyboard with tactile blue switches and detachable USB-C cable.',
          price: 89.99,
          user: admin,
        })
      );

      const p3 = await productRepo.save(
        productRepo.create({
          name: 'Ergonomic Office Chair',
          description: 'Breathable mesh back with lumbar support and adjustable 3D armrests.',
          price: 249.5,
          user: admin,
        })
      );
      console.log('Created 3 sample products.');

      // Add a sample review if testUser exists
      if (testUser) {
        await reviewRepo.save(
          reviewRepo.create({
            rating: 5,
            comment: 'Fantastic headphones, clear sound and very comfortable!',
            user: testUser,
            product: p1,
          })
        );
        console.log('Created 1 sample review.');
      }
    }

    console.log('\nSeeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seedDatabase();

