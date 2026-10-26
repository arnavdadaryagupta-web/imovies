const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

dotenv.config();

const { getSeedData } = require('./data/seedData');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Theater = require('./models/Theater');
const Showtime = require('./models/Showtime');
const Booking = require('./models/Booking');

const runSeed = async () => {
  try {
    const seed = await getSeedData();

    // 1. Always write to data/local_db.json
    const dbPath = path.join(__dirname, 'data', 'local_db.json');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2), 'utf-8');
    console.log('✅ Local JSON database seeded successfully at:', dbPath);

    // 2. Also seed MongoDB if connection succeeds
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      
      await User.deleteMany();
      await Movie.deleteMany();
      await Theater.deleteMany();
      await Showtime.deleteMany();
      await Booking.deleteMany();

      await User.insertMany(seed.users);
      await Movie.insertMany(seed.movies);
      await Theater.insertMany(seed.theaters);
      await Showtime.insertMany(seed.showtimes);
      await Booking.insertMany(seed.bookings);

      console.log('✅ MongoDB collections populated successfully!');
      await mongoose.disconnect();
    } catch (err) {
      console.log('ℹ️ Notice: MongoDB was not reachable for CLI seed, JSON fallback is active.');
    }

    console.log('\n🎉 Seed complete! Default credentials:');
    console.log('👤 Admin: admin@imovies.com / admin123');
    console.log('👤 User:  john@example.com / password123\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seed:', error);
    process.exit(1);
  }
};

runSeed();
