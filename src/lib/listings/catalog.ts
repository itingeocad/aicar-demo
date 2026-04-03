import type { ListingCatalog } from './types';

const listingTypes = [
  { id: 'in_stock', label: 'В наличии' },
  { id: 'in_transit', label: 'В пути' },
  { id: 'on_order', label: 'Под заказ' }
];

const vehicleCategories = [
  { id: 'car', label: 'Легковой автомобиль' },
  { id: 'suv', label: 'SUV' },
  { id: 'truck', label: 'Грузовой автомобиль' },
  { id: 'motorcycle', label: 'Мотоцикл' }
];

const drivetrains = [
  { id: 'fwd', label: 'Передний' },
  { id: 'rwd', label: 'Задний' },
  { id: 'awd', label: 'Полный AWD' },
  { id: '4wd', label: 'Полный 4WD' }
];

const fuelTypes = [
  { id: 'petrol', label: 'Бензин' },
  { id: 'diesel', label: 'Дизель' },
  { id: 'hybrid', label: 'Гибрид' },
  { id: 'plugin_hybrid', label: 'Plug-in Hybrid' },
  { id: 'electric', label: 'Электро' },
  { id: 'lpg', label: 'Газ / LPG' }
];

const transmissions = [
  { id: 'manual', label: 'Механика' },
  { id: 'automatic', label: 'Автомат' },
  { id: 'cvt', label: 'CVT' },
  { id: 'robot', label: 'Робот' }
];

const engines = [
  { id: '0_5', label: '0.5' },
  { id: '0_7', label: '0.7' },
  { id: '0_9', label: '0.9' },
  { id: '1_0', label: '1.0' },
  { id: '1_2', label: '1.2' },
  { id: '1_4', label: '1.4' },
  { id: '1_5', label: '1.5' },
  { id: '1_6', label: '1.6' },
  { id: '2_0', label: '2.0' },
  { id: '2_5', label: '2.5' },
  { id: '3_0', label: '3.0' },
  { id: 'ev', label: 'EV' }
];

const regions = [
  { id: 'chisinau', label: 'Кишинёв' },
  { id: 'balti', label: 'Бельцы' },
  { id: 'cahul', label: 'Кагул' },
  { id: 'orhei', label: 'Оргеев' },
  { id: 'comrat', label: 'Комрат' },
  { id: 'ungheni', label: 'Унгены' }
];

const currencies = [
  { id: 'EUR', label: 'EUR' },
  { id: 'USD', label: 'USD' },
  { id: 'MDL', label: 'MDL' }
];

const brands = [
  { id: 'bmw', label: 'BMW' },
  { id: 'mercedes', label: 'Mercedes-Benz' },
  { id: 'audi', label: 'Audi' },
  { id: 'toyota', label: 'Toyota' },
  { id: 'byd', label: 'BYD' },
  { id: 'tesla', label: 'Tesla' },
  { id: 'volkswagen', label: 'Volkswagen' },
  { id: 'ford', label: 'Ford' },

  { id: 'bmw_moto', label: 'BMW Motorrad' },
  { id: 'yamaha', label: 'Yamaha' },
  { id: 'honda_moto', label: 'Honda Moto' },
  { id: 'kawasaki', label: 'Kawasaki' }
];

const models = [
  { id: 'bmw_x5', brandId: 'bmw', label: 'X5' },
  { id: 'bmw_5', brandId: 'bmw', label: '5 Series' },

  { id: 'mercedes_gle', brandId: 'mercedes', label: 'GLE' },
  { id: 'mercedes_e', brandId: 'mercedes', label: 'E-Class' },

  { id: 'audi_q7', brandId: 'audi', label: 'Q7' },
  { id: 'audi_a6', brandId: 'audi', label: 'A6' },

  { id: 'toyota_rav4', brandId: 'toyota', label: 'RAV4' },
  { id: 'toyota_camry', brandId: 'toyota', label: 'Camry' },

  { id: 'byd_song', brandId: 'byd', label: 'Song Plus' },
  { id: 'byd_seal', brandId: 'byd', label: 'Seal' },

  { id: 'tesla_model3', brandId: 'tesla', label: 'Model 3' },
  { id: 'tesla_modely', brandId: 'tesla', label: 'Model Y' },

  { id: 'vw_tiguan', brandId: 'volkswagen', label: 'Tiguan' },
  { id: 'vw_golf', brandId: 'volkswagen', label: 'Golf' },

  { id: 'ford_kuga', brandId: 'ford', label: 'Kuga' },
  { id: 'ford_ranger', brandId: 'ford', label: 'Ranger' },

  { id: 'bmw_f900gs', brandId: 'bmw_moto', label: 'F 900 GS' },
  { id: 'yamaha_mt07', brandId: 'yamaha', label: 'MT-07' },
  { id: 'honda_cb500x', brandId: 'honda_moto', label: 'CB500X' },
  { id: 'kawasaki_ninja650', brandId: 'kawasaki', label: 'Ninja 650' }
];

export function getListingCatalog(): ListingCatalog {
  return {
    listingTypes,
    vehicleCategories,
    drivetrains,
    fuelTypes,
    transmissions,
    engines,
    regions,
    currencies,
    brands,
    models
  };
}