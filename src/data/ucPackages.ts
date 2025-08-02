
export interface UCPackage {
  id: string;
  baseAmount: number;
  bonusAmount: number;
  discount: string;
  price: number;
  originalPrice: number;
  bonusPercent: string;
  image: string;
}

export const ucPackages: UCPackage[] = [
  {
    id: "10000uc",
    baseAmount: 10000,
    bonusAmount: 700,
    discount: "-78.8%",
    price: 3000,
    originalPrice: 15000,
    bonusPercent: "7%",
    image: "/lovable-uploads/6b0727f0-f8bd-4223-9e36-ffd7671fc90d.png"
  },
  {
    id: "20000uc",
    baseAmount: 20000,
    bonusAmount: 1400,
    discount: "-75.9%",
    price: 6000,
    originalPrice: 25000,
    bonusPercent: "7%",
    image: "/lovable-uploads/6b0727f0-f8bd-4223-9e36-ffd7671fc90d.png"
  },
  {
    id: "30000uc",
    baseAmount: 30000,
    bonusAmount: 2400,
    discount: "-73.5%",
    price: 10000,
    originalPrice: 38000,
    bonusPercent: "8%",
    image: "/lovable-uploads/6b0727f0-f8bd-4223-9e36-ffd7671fc90d.png"
  },
  {
    id: "50000uc",
    baseAmount: 50000,
    bonusAmount: 4000,
    discount: "-70.2%",
    price: 18750,
    originalPrice: 63000,
    bonusPercent: "8%",
    image: "/lovable-uploads/6b0727f0-f8bd-4223-9e36-ffd7671fc90d.png"
  },
  {
    id: "100000uc",
    baseAmount: 100000,
    bonusAmount: 8000,
    discount: "-68.1%",
    price: 40250,
    originalPrice: 126250,
    bonusPercent: "8%",
    image: "/lovable-uploads/6dcffa69-b046-4099-b802-d86a27b04cc3.png"
  },
  {
    id: "200000uc",
    baseAmount: 200000,
    bonusAmount: 16000,
    discount: "-67.0%",
    price: 83250,
    originalPrice: 252500,
    bonusPercent: "8%",
    image: "/lovable-uploads/6dcffa69-b046-4099-b802-d86a27b04cc3.png"
  },
  {
    id: "300000uc",
    baseAmount: 300000,
    bonusAmount: 24000,
    discount: "-66.7%",
    price: 133250,
    originalPrice: 399750,
    bonusPercent: "8%",
    image: "/lovable-uploads/6dcffa69-b046-4099-b802-d86a27b04cc3.png"
  },
  {
    id: "500000uc",
    baseAmount: 500000,
    bonusAmount: 40000,
    discount: "-66.4%",
    price: 213750,
    originalPrice: 637500,
    bonusPercent: "8%",
    image: "/lovable-uploads/6dcffa69-b046-4099-b802-d86a27b04cc3.png"
  },
  {
    id: "750000uc",
    baseAmount: 750000,
    bonusAmount: 60000,
    discount: "-66.2%",
    price: 322000,
    originalPrice: 954000,
    bonusPercent: "8%",
    image: "/lovable-uploads/6dcffa69-b046-4099-b802-d86a27b04cc3.png"
  },
  {
    id: "1000000uc",
    baseAmount: 1000000,
    bonusAmount: 80000,
    discount: "-66.0%",
    price: 430000,
    originalPrice: 1265000,
    bonusPercent: "8%",
    image: "/lovable-uploads/6dcffa69-b046-4099-b802-d86a27b04cc3.png"
  },
  {
    id: "2000000uc",
    baseAmount: 2000000,
    bonusAmount: 160000,
    discount: "-65.8%",
    price: 860000,
    originalPrice: 2516000,
    bonusPercent: "8%",
    image: "/lovable-uploads/6dcffa69-b046-4099-b802-d86a27b04cc3.png"
  }
];

export const getPackageById = (id: string): UCPackage | undefined => {
  return ucPackages.find(pkg => pkg.id === id);
};

// Get currently selected country from localStorage
export const getSelectedCountry = (): { code: string; currency: string } => {
  try {
    const savedCountry = localStorage.getItem('selectedCountry');
    if (savedCountry) {
      const country = JSON.parse(savedCountry);
      return { code: country.code, currency: country.currency };
    }
  } catch (error) {
    console.error('Error getting selected country:', error);
  }
  return { code: 'pk', currency: 'PKR' }; // Default to Pakistan/PKR
};

// Create a broadcasted channel to communicate currency changes
export const setupCountryChangeListener = (callback: () => void) => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'selectedCountry') {
      callback();
    }
  };
  
  // For direct changes in the same window
  const handleCustomEvent = () => {
    callback();
  };
  
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('countryChanged', handleCustomEvent);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('countryChanged', handleCustomEvent);
  };
};

// Trigger a custom event when country changes
export const triggerCountryChangeEvent = () => {
  const event = new CustomEvent('countryChanged');
  window.dispatchEvent(event);
};
