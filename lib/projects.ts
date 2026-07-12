export type Project = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  goalSol: number;
};

// Single treasury wallet that receives ALL donations (devnet).
// Which project a donation belongs to is tracked on-chain via the
// transaction memo: "donation:<projectId>".
export const DONATION_WALLET = '9TbViaPerwkLAnCz8yF2yTYbLM4aURUMXtQ8rsTgJAeZ';

export const projects: Project[] = [
  {
    id: 'clean-water-nepal',
    name: 'Clean Water Nepal',
    description:
      'Deep wells and filtration systems for remote villages in Karnali.',
    imageUrl: 'https://picsum.photos/seed/water/600/400',
    goalSol: 50,
  },
  {
    id: 'rural-education-fund',
    name: 'Rural Education Fund',
    description:
      'School supplies, books, and teacher training for rural schools.',
    imageUrl: 'https://picsum.photos/seed/education/600/400',
    goalSol: 75,
  },
  {
    id: 'disaster-relief',
    name: 'Disaster Relief Fund',
    description:
      'Rapid response kits — food, shelter, medicine — for flood and earthquake victims.',
    imageUrl: 'https://picsum.photos/seed/relief/600/400',
    goalSol: 100,
  },
  {
    id: 'girls-in-stem',
    name: 'Girls in STEM Nepal',
    description:
      'Coding bootcamps and science labs for girls in government schools.',
    imageUrl: 'https://picsum.photos/seed/stem/600/400',
    goalSol: 40,
  },
  {
    id: 'reforest-himalaya',
    name: 'Reforest the Himalaya',
    description:
      'Community tree-planting and landslide prevention in hill districts.',
    imageUrl: 'https://picsum.photos/seed/forest/600/400',
    goalSol: 60,
  },
  {
    id: 'mobile-health-camps',
    name: 'Mobile Health Camps',
    description:
      'Free health checkups and medicines delivered to villages without clinics.',
    imageUrl: 'https://picsum.photos/seed/health/600/400',
    goalSol: 80,
  },
];
