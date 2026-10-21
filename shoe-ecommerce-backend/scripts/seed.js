const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');

const photo = (id) => `/products/${id}.jpg`;

const ACCOUNTS = [
  { name: 'Store Admin', email: 'admin@shoestore.com', password: 'Admin@12345', role: 'admin' },
  { name: 'Demo Shopper', email: 'demo@shoestore.com', password: 'Demo@12345', role: 'user' },
];

const REVIEWERS = ['Amara K.', 'Jordan P.', 'Lena M.', 'Sipho N.', 'Chris T.', 'Aisha R.'];
const REVIEW_TEXT = [
  ['Exactly what I wanted', 'Fits true to size and feels great from the first wear. Delivery was quick too.'],
  ['Great value', 'Build quality is better than I expected for the price. Would buy again.'],
  ['Comfortable all day', 'I wear these for long shifts and my feet still feel fine at the end of the day.'],
  ['Looks even better in person', 'The colours are sharp and the stitching is clean. Lots of compliments.'],
  ['Solid but runs slightly small', 'Great shoe overall, but I would go up half a size next time.'],
];

const SIZES = {
  men: [7, 8, 9, 10, 11, 12],
  women: [5, 6, 7, 8, 9, 10],
  kids: [1, 2, 3, 4, 5, 6],
};

// [name, brand, category, price, compareAtPrice, photoId, colors, featured, description]
const CATALOG = [
  ['Air Runner Pro Flyknit', 'Nike', 'sports', 129.99, 159.99, '1542291026-7eec264c27ff', ['Red', 'Black'], true, 'Lightweight knit upper with responsive cushioning built for daily miles and race-day pace.'],
  ['Court Classic Low', 'Nike', 'casual', 89.99, 0, '1460353581641-37baddab0fa2', ['Grey', 'White'], true, 'Clean low-top silhouette with a breathable mesh upper and a cushioned footbed.'],
  ['Heritage 574 Core', 'New Balance', 'casual', 84.99, 99.99, '1465453869711-7e174808ace9', ['White', 'Peach'], false, 'A timeless trainer with suede overlays and ENCAP midsole support for all-day comfort.'],
  ['Max Cushion 90 Women', 'Nike', 'women', 139.99, 0, '1511556532299-8f662fc26c06', ['Pink', 'Grey'], true, 'Visible Air cushioning and a soft, flexible upper for a standout everyday look.'],
  ['Retro Air Max Sunset', 'Nike', 'casual', 149.99, 179.99, '1514989940723-e8e51635b782', ['Orange', 'Yellow'], true, 'Bold colour-blocking meets Max Air cushioning in a street-ready retro runner.'],
  ['Neon Glide Trainer', 'Adidas', 'sports', 119.99, 0, '1515955656352-a1fa3ffcd111', ['Blue'], false, 'Glow-ready trainer with a snug sock-like fit and a springy foam midsole.'],
  ['Strappy Block Heel Set', 'Aldo', 'women', 74.99, 94.99, '1519415943484-9fa1873496d4', ['Beige', 'Nude'], false, 'Elegant block heels with an adjustable ankle strap, comfortable enough for a full evening out.'],
  ['Prophere Street Runner', 'Adidas', 'sports', 109.99, 129.99, '1520256862855-398228c41684', ['Blue', 'Pink'], false, 'Chunky street-inspired runner with a mixed-material upper and a dual-density sole.'],
  ['Old Skool Burgundy', 'Vans', 'casual', 69.99, 0, '1525966222134-fcfa99b8ae77', ['Burgundy', 'White'], true, 'Durable canvas and suede upper with the signature waffle outsole for grippy skate-ready wear.'],
  ['Runner 247 Olive', 'New Balance', 'men', 94.99, 109.99, '1539185441755-769473a23570', ['Olive', 'Black'], false, 'Sleek, sock-fit trainer with a responsive foam sole for a smooth ride in the city.'],
  ['Free Run Flyknit Crimson', 'Nike', 'sports', 134.99, 0, '1542291026-7eec264c27ff', ['Crimson'], false, 'Barefoot-inspired flexibility with a stretchy knit upper for natural movement.'],
  ['Floral Stiletto Pumps', 'Steve Madden', 'women', 89.99, 119.99, '1543508282-6319a3e2621f', ['Floral'], true, 'Statement stilettos with a vibrant print and a cushioned insole for comfort.'],
  ['Court Force Black', 'Nike', 'men', 109.99, 0, '1543163521-1bf539c55dd2', ['Black', 'White'], true, 'The legendary court silhouette in premium leather with a durable rubber cupsole.'],
  ['Court Force Tan', 'Nike', 'casual', 114.99, 129.99, '1549298916-b41d501d3772', ['Tan', 'Black'], false, 'Warm tan leather with contrast overlays for a versatile everyday sneaker.'],
  ['Retro 9 Flamingo', 'New Balance', 'women', 99.99, 0, '1551107696-a4b0c5a0d9a2', ['Pink', 'White'], false, 'Soft suede and mesh in a playful pink palette with a plush cushioned midsole.'],
  ['High Court Chicago', 'Jordan', 'men', 169.99, 189.99, '1552346154-21d32810aba3', ['Red', 'Black', 'White'], true, 'Iconic colourway on a classic high-top with premium leather and Air-Sole cushioning.'],
  ['Skate Pro Low', 'Nike', 'casual', 79.99, 0, '1556906781-9a412961c28c', ['White', 'Orange'], false, 'Padded tongue and a flick-friendly upper make this a skate-park favourite.'],
  ['Color Pop Trainer', 'Puma', 'kids', 54.99, 64.99, '1560769629-975ec94e6a86', ['Multi'], true, 'Playful colour mix with easy lace-up closure and a flexible outsole for active kids.'],
  ['Deru Knit Grey', 'Adidas', 'men', 99.99, 0, '1562183241-b937e95585b6', ['Grey', 'Lime'], false, 'Breathable knit upper with a sculpted heel for lockdown comfort on city streets.'],
  ['Retro 1 Royal Hi', 'Jordan', 'men', 179.99, 0, '1578116922645-3976907a7671', ['Royal Blue', 'White'], true, 'Knit high-top with bold royal colouring and a cushioned midsole built for the court and beyond.'],
  ['Free Run 5.0 Forest', 'Nike', 'sports', 124.99, 149.99, '1582588678413-dbf45f4823e9', ['Forest Green'], false, 'Flexible grooved sole and stretch knit upper for a natural, lightweight feel.'],
  ['High Dunk Sunset', 'Nike', 'women', 119.99, 0, '1584735175315-9d5df23860e6', ['Peach', 'Cream'], false, 'Padded high-top with soft pastel panels and a rubber cupsole for lasting grip.'],
  ['Urban Trek Runner', 'Lacoste', 'men', 104.99, 124.99, '1595341888016-a392ef81b7de', ['Navy', 'Orange'], false, 'Multi-panel trainer with a chunky sole, designed to stand out on any commute.'],
  ['Pastel Force Low', 'Nike', 'women', 119.99, 139.99, '1595950653106-6c9ebd614d3a', ['Pastel'], true, 'Soft pastel layers over the classic Force sole for an eye-catching everyday sneaker.'],
  ['Retro 1 Mid Red', 'Jordan', 'men', 139.99, 0, '1597045566677-8cf032ed6634', ['White', 'Red', 'Black'], false, 'Mid-top comfort with sharp colour contrast and supportive padded collar.'],
  ['Air Max 1 Ember', 'Nike', 'women', 144.99, 164.99, '1600185365926-3a2ce3cdb9eb', ['White', 'Orange'], false, 'Light, cushioned and clean, with a hint of ember orange on the Air window.'],
  ['Leather Court Elite', 'Nike', 'formal', 99.99, 0, '1603808033192-082d6919d3e1', ['Tan', 'White'], false, 'Dressed-up leather court shoe that pairs equally well with chinos and tailored trousers.'],
  ['Kyrie Flow Black', 'Nike', 'sports', 129.99, 0, '1605348532760-6753d2c43329', ['Black', 'White'], true, 'Low-profile court shoe with sharp traction and a locked-in fit for quick cuts.'],
  ['SuperRep Volt', 'Nike', 'sports', 94.99, 114.99, '1606107557195-0e29a4b5b4aa', ['Volt', 'Black'], false, 'Stable heel and flexible forefoot for HIIT, studio classes and gym sessions.'],
  ['Palace Court Lite', 'Puma', 'casual', 74.99, 89.99, '1608231387042-66d1773070a5', ['White', 'Black'], false, 'Minimal leather court sneaker with a padded collar and a clean profile.'],
  ['Oxford Cap-Toe Brown', 'Clarks', 'formal', 119.99, 149.99, '1614252235316-8c857d38b5f4', ['Brown'], true, 'Hand-finished leather oxford with a cap toe and cushioned leather-lined interior.'],
  ['Air Max 90 Navy', 'Nike', 'men', 149.99, 0, '1620138546344-7b2c38516edf', ['Navy', 'Gold'], true, 'Navy and gold take the 90 silhouette to a premium level with plush Air cushioning.'],
  ['Heritage Oxford Cognac', 'Clarks', 'formal', 129.99, 0, '1449505278894-297fdb3edbc1', ['Cognac'], false, 'Classic lace-up oxford in polished cognac leather with a flexible stitched sole.'],
  ['Little Racer Neon', 'Adidas', 'kids', 49.99, 59.99, '1515955656352-a1fa3ffcd111', ['Blue', 'Neon'], false, 'Light, bouncy and easy to put on: a trainer made for playground speed.'],
  ['Mini Skate Canvas', 'Vans', 'kids', 44.99, 0, '1525966222134-fcfa99b8ae77', ['Burgundy'], false, 'Kid-sized skate classic with reinforced toe caps built to survive recess.'],
  ['Mini Court Sneaker', 'Nike', 'kids', 52.99, 0, '1460353581641-37baddab0fa2', ['Grey', 'White'], false, 'Easy hook-and-loop closure with a breathable upper for growing feet.'],
  ['Pro Trainer Sunrise', 'Adidas', 'sports', 114.99, 139.99, '1520256862855-398228c41684', ['Pink', 'Blue'], false, 'Cushioned training shoe with a stable base for lifts and agility drills.'],
];

const hash = (str) => [...str].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 100000, 7);

const buildProduct = ([name, brand, category, price, compareAtPrice, photoId, colors, isFeatured, description], index) => {
  const seed = hash(name);
  const reviewCount = 2 + (seed % 4);
  const reviews = Array.from({ length: reviewCount }, (_, i) => {
    const [title, comment] = REVIEW_TEXT[(seed + i) % REVIEW_TEXT.length];
    return {
      user: new mongoose.Types.ObjectId(),
      name: REVIEWERS[(seed + i) % REVIEWERS.length],
      rating: 3 + ((seed + i * 3) % 3),
      title,
      comment,
    };
  });

  const product = new Product({
    name,
    brand,
    category,
    price,
    compareAtPrice,
    description,
    shortDescription: description,
    mainImage: photo(photoId),
    subImages: [],
    colors,
    sizes: SIZES[category === 'women' || category === 'kids' ? category : 'men'],
    tags: [brand.toLowerCase(), category, ...name.toLowerCase().split(' ')].slice(0, 6),
    stock: index % 11 === 0 ? 0 : 8 + (seed % 40),
    isFeatured,
    reviews,
  });
  product.recalculateRatings();
  return product;
};

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  await Promise.all([Product.deleteMany(), Cart.deleteMany(), Wishlist.deleteMany(), Order.deleteMany()]);
  await Product.insertMany(CATALOG.map(buildProduct));

  for (const account of ACCOUNTS) {
    await User.deleteOne({ email: account.email });
    await User.create(account);
  }

  console.log(`Seeded ${CATALOG.length} products`);
  ACCOUNTS.forEach((a) => console.log(`  ${a.role.padEnd(5)} ${a.email} / ${a.password}`));
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
