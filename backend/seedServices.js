import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service.js';

// Load environmental variables
dotenv.config();

const services = [
  {
    name: 'Hagaajinta Tuubooyinka (Plumbing)',
    category: 'Maintenance',
    price: 25,
    description: 'Waxaan hagaajinaa dhamaan ciladaha tuubooyinka biyaha iyo bulaacadaha.'
  },
  {
    name: 'Cilad bixinta Korontada (Electrical)',
    category: 'Repairs',
    price: 30,
    description: 'Hagaajinta fiilooyinka, nalka, iyo rakibidda qalabka korontada.'
  },
  {
    name: 'Nadiifinta Guriga (Cleaning)',
    category: 'Cleaning',
    price: 15,
    description: 'Nadiifinta guud ee qolalka, jikada iyo agagaarka guriga.'
  },
  {
    name: 'Rinjiyeynta (Painting)',
    category: 'Home Improvement',
    price: 40,
    description: 'Rinjiyeynta darbiga gudaha iyo dibadda ee guryaha.'
  }
];

const seedDB = async () => {
  try {
    // Waxaan si toos ah u isticmaalaynaa URL-kaaga MongoDB Atlas si aan u hubino in xogta ay sax u gasho
    const ATLAS_URI = "mongodb+srv://homemaintenance:g0B1p6RdglJAQq2M@cluster0.9xchkgr.mongodb.net/HomeMaintenance?appName=Cluster0";
    
    console.log('Isku dayaya in lagu xirmo MongoDB Atlas... ⏳');
    await mongoose.connect(ATLAS_URI);
    console.log('Database-ka Atlas waa lagu xirmay... 🔌');
    
    // Tirtir xogtii hore ee ku jirtay 'services' collection
    await Service.deleteMany({});
    console.log('Xogtii hore ee madhnayd ama khaldanayd waa la tirtiray...');
    
    // Geli adeegyada cusub
    await Service.insertMany(services);
    console.log('Adeegyada si guul leh ayaa loogu shubay MongoDB Atlas! ✅');
    
    await mongoose.connection.close();
    console.log('Xiriirkii Database-ka waa la xiray.');
    process.exit(0);
  } catch (err) {
    console.error('Qalad baa dhacay xilliga gelinta xogta:', err);
    process.exit(1);
  }
};

seedDB();