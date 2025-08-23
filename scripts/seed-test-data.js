import { db } from '../lib/db.js';

async function seedTestData() {
  try {
    console.log('🌱 Starting to seed test data...');

    // Create sample clubs
    const clubs = await Promise.all([
      db.club.upsert({
        where: { name: 'Computer Science Club' },
        update: {},
        create: {
          name: 'Computer Science Club',
          description: 'A club for students passionate about computer science, programming, and technology',
          category: 'Technology',
          ownerId: 'placeholder' // Will need to be updated with actual user ID
        }
      }),
      db.club.upsert({
        where: { name: 'Photography Club' },
        update: {},
        create: {
          name: 'Photography Club',
          description: 'Capture the world through your lens',
          category: 'Arts',
          ownerId: 'placeholder'
        }
      }),
      db.club.upsert({
        where: { name: 'Environmental Club' },
        update: {},
        create: {
          name: 'Environmental Club',
          description: 'Making our campus and world more sustainable',
          category: 'Environment',
          ownerId: 'placeholder'
        }
      })
    ]);

    console.log(`✅ Created ${clubs.length} clubs`);

    // Create sample events
    const events = await Promise.all([
      db.event.upsert({
        where: { id: 'sample-event-1' },
        update: {},
        create: {
          id: 'sample-event-1',
          title: 'Web Development Workshop',
          description: 'Learn the basics of React and Next.js',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          venue: 'Tech Lab 101',
          maxParticipants: 30,
          clubId: clubs[0].id
        }
      }),
      db.event.upsert({
        where: { id: 'sample-event-2' },
        update: {},
        create: {
          id: 'sample-event-2',
          title: 'Photography Contest',
          description: 'Show off your best shots in our annual contest',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          venue: 'Art Building Gallery',
          maxParticipants: 50,
          clubId: clubs[1].id
        }
      }),
      db.event.upsert({
        where: { id: 'sample-event-3' },
        update: {},
        create: {
          id: 'sample-event-3',
          title: 'Campus Clean-up Day',
          description: 'Help make our campus beautiful and green',
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
          venue: 'Main Campus',
          maxParticipants: 100,
          clubId: clubs[2].id
        }
      })
    ]);

    console.log(`✅ Created ${events.length} events`);

    console.log('🎉 Test data seeded successfully!');
    console.log('\nNote: You will need to:');
    console.log('1. Sign up or sign in to create a user account');
    console.log('2. Update club owner IDs to your user ID');
    console.log('3. Join clubs and register for events through the UI');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    await db.$disconnect();
  }
}

seedTestData();
