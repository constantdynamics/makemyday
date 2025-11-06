import { connectDatabases, closeDatabases } from './connection';
import { ChallengeModel } from './models/Challenge';
import { logger } from '../utils/logger';
import { CHALLENGES } from './challenges-data';

async function seed() {
  try {
    logger.info('🌱 Starting database seed...');

    await connectDatabases();

    // Clear existing challenges
    await ChallengeModel.deleteMany({});
    logger.info('✅ Cleared existing challenges');

    // Add challenges
    const createdChallenges = await ChallengeModel.insertMany(CHALLENGES);
    logger.info(`✅ Created ${createdChallenges.length} challenges`);

    // Summary
    const byCategory = await ChallengeModel.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    logger.info('📊 Challenges by category:');
    byCategory.forEach((cat) => {
      logger.info(`   ${cat._id}: ${cat.count}`);
    });

    const premiumCount = await ChallengeModel.countDocuments({ premium: true });
    logger.info(`   Premium challenges: ${premiumCount}`);

    logger.info('🎉 Seed completed successfully!');

    await closeDatabases();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
