export const PRODUCTS = [
  {
    id: '1',
    name: 'Quantum CPU Cooler',
    price: 89.99,
    category: 'Cooling',
    image: 'https://picsum.photos/seed/quantum/640/640',
    desc: 'Liquid cooling with addressable RGB and silent fans for high-performance builds.',
    specs: 'Fan Speed: 2000 RPM\nNoise: 18 dBA\nRadiator: 240mm\nSocket Support: AM5 / LGA 1700',
    reviews: '5★ — Extremely quiet!\n4★ — Fits well but manual is brief.',
    tags: ['cooling', 'rgb', 'silent'],
  },
  {
    id: '2',
    name: 'Nebula Mechanical Keyboard',
    price: 149.5,
    category: 'Peripherals',
    image: 'https://picsum.photos/seed/nebula/640/640',
    desc: 'Hot-swappable linear switches with gasket mount design and south-facing LEDs.',
    specs: 'Switches: Gateron Yellow\nKeycaps: PBT dye-sub\nLayout: 75%\nConnection: USB-C / 2.4GHz',
    reviews: '5★ — Smooth as butter.\n5★ — Amazing build quality.',
    tags: ['keyboard', 'mechanical', 'wireless'],
  },
  {
    id: '3',
    name: 'Titan Gaming Mouse',
    price: 79.0,
    category: 'Peripherals',
    image: 'https://picsum.photos/seed/titan/640/640',
    desc: 'Ultra-lightweight wireless mouse with optical switches and 26K DPI sensor.',
    specs: 'Weight: 59g\nSensor: 26K DPI\nBattery: 80 hours\nSwitches: Optical',
    reviews: '4★ — Super light, fits medium hands well.\n3★ — Scroll wheel got squeaky.',
    tags: ['mouse', 'gaming', 'wireless'],
  },
  {
    id: '4',
    name: 'Aurora UltraWide Monitor',
    price: 499.0,
    category: 'Displays',
    image: 'https://picsum.photos/seed/aurora/640/640',
    desc: '34" curved ultrawide with 144Hz refresh and HDR400 for immersive work and play.',
    specs: 'Size: 34"\nResolution: 3440×1440\nRefresh: 144Hz\nPanel: IPS',
    reviews: '5★ — Incredible for multitasking.\n4★ — Stand is sturdy but heavy.',
    tags: ['monitor', 'ultrawide', 'hdr'],
  },
  {
    id: '5',
    name: 'Pulse Noise-Cancel Headset',
    price: 129.0,
    category: 'Audio',
    image: 'https://picsum.photos/seed/pulse/640/640',
    desc: 'Over-ear ANC headset with spatial audio and 40-hour battery life.',
    specs: 'ANC: Hybrid\nBattery: 40 hours\nDrivers: 40mm\nMic: Boom detachable',
    reviews: '5★ — Great for calls and games.\n4★ — Ear cups get warm after long sessions.',
    tags: ['headset', 'anc', 'audio'],
  },
  {
    id: '6',
    name: 'Orbit USB-C Dock',
    price: 119.0,
    category: 'Accessories',
    image: 'https://picsum.photos/seed/orbit/640/640',
    desc: 'Single-cable dock with dual 4K display support and 100W power delivery.',
    specs: 'Ports: HDMI ×2, USB-A ×3, USB-C, Ethernet, SD\nPD: 100W\nDisplay: Dual 4K@60Hz',
    reviews: '5★ — Clean desk setup finally.\n4★ — Runs warm under load.',
    tags: ['dock', 'usb-c', 'hub'],
  },
];

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === String(id)) || null;
}

export function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function searchProducts(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter((p) => {
    const haystack = [p.name, p.desc, p.category, ...(p.tags || [])]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function getProductsByCategory(category) {
  if (!category || category === 'all') return PRODUCTS;
  return PRODUCTS.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase()
  );
}
