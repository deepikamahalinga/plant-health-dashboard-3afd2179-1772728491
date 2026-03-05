import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

// Types
type SoilCondition = {
  moisture: number;  // 0-100%
  pH: number;       // 0-14
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
};

type PlantDataSeed = {
  id: string;
  soilCondition: SoilCondition;
  timestamp: Date;
  plotId: string; // Foreign key
};

// Initialize Prisma Client
const prisma = new PrismaClient();

// Helper to generate realistic soil condition data
const generateSoilCondition = (): SoilCondition => ({
  moisture: Number((Math.random() * (80 - 20) + 20).toFixed(2)),
  pH: Number((Math.random() * (8.5 - 5.5) + 5.5).toFixed(1)),
  nitrogen: Math.floor(Math.random() * (200 - 50) + 50),
  phosphorus: Math.floor(Math.random() * (150 - 30) + 30),
  potassium: Math.floor(Math.random() * (300 - 100) + 100),
});

// Helper to generate timestamps within last 30 days
const generateTimestamp = (): Date => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
};

async function seed() {
  try {
    console.log(chalk.blue('🌱 Starting database seed...'));

    // Clear existing data (optional)
    console.log(chalk.yellow('Clearing existing plant data...'));
    await prisma.plantData.deleteMany({});

    // Create sample plot IDs (assuming plots exist)
    const plotIds = [uuidv4(), uuidv4(), uuidv4()]; // Mock plot IDs

    // Generate sample plant data
    const plantDataSeeds: PlantDataSeed[] = Array(10).fill(null).map(() => ({
      id: uuidv4(),
      soilCondition: generateSoilCondition(),
      timestamp: generateTimestamp(),
      plotId: plotIds[Math.floor(Math.random() * plotIds.length)],
    }));

    // Insert data
    console.log(chalk.yellow('Creating new plant data records...'));
    for (const data of plantDataSeeds) {
      await prisma.plantData.create({
        data: {
          id: data.id,
          soilCondition: data.soilCondition,
          timestamp: data.timestamp,
          plotId: data.plotId,
        },
      });
      console.log(chalk.green(`✓ Created plant data record: ${data.id}`));
    }

    console.log(chalk.green('✨ Seed completed successfully!'));
  } catch (error) {
    console.error(chalk.red('Error during seeding:'));
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export the seed function
export default seed;

// Execute if running directly
if (require.main === module) {
  seed()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}