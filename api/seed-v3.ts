import sql from './db';
import dotenv from 'dotenv';
dotenv.config();

const artisans = [
    // North Western (Kurunegala/Puttalam)
    { name: "Dinesh Perera", job: "Master Woodworker", price: 4500, province: "North Western", city: "Kosgolla", story: "20+ years of teak furniture expertise.", cats: ['woodworking'] },
    { name: "Arjun Silva", job: "Precision Mason", price: 3800, province: "North Western", city: "Mathawa", story: "Specialist in heritage brickwork.", cats: ['masonry'] },
    { name: "Nimal Ranasinghe", job: "Classic Roofer", price: 4200, province: "North Western", city: "Narammala", story: "Expert in Sinhala tile roofing.", cats: ['roofing'] },

    // Western (Colombo/Gampaha)
    { name: "Malani Gamage", job: "Textile Artist", price: 5200, province: "Western", city: "Colombo 07", story: "Award-winning handloom designer.", cats: ['textiles'] },
    { name: "Ruwan Kumara", job: "Chief Electrician", price: 3500, province: "Western", city: "Maharagama", story: "Certified solar and domestic specialist.", cats: ['electrical'] },
    { name: "Samanthi Perera", job: "Modern Gardener", price: 2800, province: "Western", city: "Gampaha", story: "Unique landscape designs for urban homes.", cats: ['gardening'] },
    { name: "Sunil Mendis", job: "Master Plumber", price: 3200, province: "Western", city: "Negombo", story: "Large scale industrial plumbing expert.", cats: ['plumbing'] },

    // Central (Kandy/Matale)
    { name: "Sunethra Rani", job: "Traditional Potter", price: 2900, province: "Central", city: "Kandy City", story: "Preserving clay heritage for generations.", cats: ['pottery'] },
    { name: "Bandara Tilak", job: "Temple Sculptor", price: 6500, province: "Central", city: "Peradeniya", story: "Master of stone and brass sculpture.", cats: ['pottery', 'masonry'] },
    { name: "Rohan Fernando", job: "Metal Artisan", price: 4100, province: "Central", city: "Matale", story: "Custom ironwork and gate fabrication.", cats: ['masonry'] },

    // Southern (Galle/Matara)
    { name: "Chandra Siri", job: "Lace Expert", price: 3800, province: "Southern", city: "Galle Fort", story: "Exquisite Beeralu lace craftsmanship.", cats: ['textiles'] },
    { name: "Upul Priyantha", job: "Boat Carpenter", price: 4800, province: "Southern", city: "Hikkaduwa", story: "Traditional fishing boat construction specialist.", cats: ['woodworking'] },

    // Northern (Jaffna)
    { name: "K. Selvam", job: "Palmyrah Weaver", price: 2500, province: "Northern", city: "Jaffna Town", story: "Sustainable weaving using ancient techniques.", cats: ['textiles'] },

    // Eastern (Batticaloa)
    { name: "M. Farook", job: "Handicraft Master", price: 3100, province: "Eastern", city: "Batticaloa", story: "Specialist in cane and bamboo products.", cats: ['textiles', 'woodworking'] },

    // Sabaragamuwa (Ratnapura)
    { name: "P. Gamini", job: "Gemstone Polisher", price: 5500, province: "Sabaragamuwa", city: "Ratnapura", story: "Precision cutting for high-value gems.", cats: ['pottery'] }, // Using pottery as a proxy for fine craft

    // Uva (Badulla)
    { name: "S. Mahendran", job: "Tea Garden Expert", price: 2200, province: "Uva", city: "Badulla", story: "Sustainable tea estate maintenance.", cats: ['gardening'] },

    // North Central (Anuradhapura)
    { name: "Jayathilake A.", job: "Restoration Mason", price: 4600, province: "North Central", city: "Anuradhapura", story: "Historical site foundation specialist.", cats: ['masonry'] }
];

async function seed() {
    console.log('Clearing and Seeding V3...');
    try {
        // 1. Fetch categories for mapping
        const categoryRows = await sql`SELECT id, slug FROM categories`;
        const catMap: Record<string, number> = {};
        categoryRows.forEach(row => { catMap[row.slug] = row.id; });

        // 2. Insert Artisans
        for (const a of artisans) {
            const result = await sql`
        INSERT INTO workers (name, job, price, province, city, story, services, rating, reviews_count)
        VALUES (
          ${a.name}, ${a.job}, ${a.price}, ${a.province}, ${a.city}, ${a.story}, 
          ${['Custom Work', 'Consultation', 'Heritage Craft']}, 
          ${(Math.random() * 1.5 + 3.5).toFixed(1)}, -- Random rating between 3.5 and 5.0
          ${Math.floor(Math.random() * 100 + 10)}    -- Random reviews count
        )
        RETURNING id
      `;

            const workerId = result[0].id;

            // 3. Link categories
            for (const catSlug of a.cats) {
                const catId = catMap[catSlug];
                if (catId) {
                    await sql`
            INSERT INTO worker_categories (worker_id, category_id)
            VALUES (${workerId}, ${catId})
            ON CONFLICT DO NOTHING
          `;
                }
            }

            // 4. Add 1 mockup review per worker
            await sql`
        INSERT INTO reviews (worker_id, name, rating, comment, date)
        VALUES (${workerId}, 'Happy Client', 5, 'Exceptional quality and professionalism. Highly recommended!', ${new Date().toLocaleDateString()})
      `;
        }

        console.log('Seeding V3 successful!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding V3 failed:', error);
        process.exit(1);
    }
}

seed();
