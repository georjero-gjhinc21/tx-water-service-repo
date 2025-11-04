// app/lib/calculations.ts
// Business logic for deposit and rate calculations

import type { 
  PropertyUseType, 
  ServiceTerritory,
  RateCalculation 
} from '@/types/water-service-request';

/**
 * Calculate deposit amount based on property type, territory, and credit score
 * 
 * Business Rules:
 * - Base deposit varies by property use type
 * - Outside city limits adds $50
 * - Credit score affects final amount
 * - Minimum deposit is $50
 */
export function calculateDeposit(
  propertyUseType: PropertyUseType,
  territory: ServiceTerritory | null,
  creditScore: number | null
): number {
  // Base deposits by property type
  const baseDeposits: Record<PropertyUseType, number> = {
    'rent': 200,            // Highest risk
    'owner_occupied': 75,    // Lowest risk
    'owner_leasing': 125     // Medium risk
  };

  const baseDeposit = baseDeposits[propertyUseType];

  // Territory adjustment
  const territoryAdjustment = territory === 'outside_city_limits' ? 50 : 0;

  // Credit score adjustment
  let creditAdjustment = 0;
  if (creditScore === null) {
    creditAdjustment = 100; // No credit check = higher deposit
  } else if (creditScore < 600) {
    creditAdjustment = 100; // Poor credit
  } else if (creditScore >= 600 && creditScore < 700) {
    creditAdjustment = 0; // Fair credit - base deposit
  } else {
    creditAdjustment = -25; // Good credit discount
  }

  const totalDeposit = baseDeposit + territoryAdjustment + creditAdjustment;

  // Minimum deposit is $50
  return Math.max(50, totalDeposit);
}

/**
 * Calculate monthly rate based on services and property features
 */
export function calculateMonthlyRate(
  territory: ServiceTerritory | null,
  trashCarts: number,
  recycleCarts: number,
  hasPool: boolean,
  hasSprinkler: boolean
): RateCalculation {
  // Base water rate
  const BASE_WATER_RATE = 35.00;
  let waterRate = BASE_WATER_RATE;
  
  if (territory === 'outside_city_limits') {
    waterRate += 10; // $10 surcharge for outside city limits
  }

  // Trash service rate
  const TRASH_BASE_RATE = 15.00;
  const ADDITIONAL_TRASH_CART_FEE = 5.00;
  let trashRate = 0;
  
  if (trashCarts > 0) {
    // First cart included in base rate
    const additionalCarts = Math.max(0, trashCarts - 1);
    trashRate = TRASH_BASE_RATE + (additionalCarts * ADDITIONAL_TRASH_CART_FEE);
  }

  // Recycle service rate
  const RECYCLE_BASE_RATE = 8.00;
  const ADDITIONAL_RECYCLE_CART_FEE = 3.00;
  let recycleRate = 0;
  
  if (recycleCarts > 0) {
    // First cart included in base rate
    const additionalCarts = Math.max(0, recycleCarts - 1);
    recycleRate = RECYCLE_BASE_RATE + (additionalCarts * ADDITIONAL_RECYCLE_CART_FEE);
  }

  // Property features
  const POOL_SURCHARGE = 15.00;
  const poolSurcharge = hasPool ? POOL_SURCHARGE : 0;

  const subtotal = waterRate + trashRate + recycleRate + poolSurcharge;

  const notes: string[] = [];
  notes.push(`Base water service: $${waterRate.toFixed(2)}`);
  
  if (trashRate > 0) {
    notes.push(`Trash service (${trashCarts} cart${trashCarts > 1 ? 's' : ''}): $${trashRate.toFixed(2)}`);
  }
  
  if (recycleRate > 0) {
    notes.push(`Recycle service (${recycleCarts} cart${recycleCarts > 1 ? 's' : ''}): $${recycleRate.toFixed(2)}`);
  }
  
  if (hasPool) {
    notes.push(`Pool surcharge: $${poolSurcharge.toFixed(2)}`);
  }
  
  if (hasSprinkler) {
    notes.push('Irrigation rates apply based on usage tiers');
    notes.push('Tier 1 (0-5k gallons): Base rate');
    notes.push('Tier 2 (5k-10k gallons): +$0.50/1k gallons');
    notes.push('Tier 3 (10k+ gallons): +$1.00/1k gallons');
  }
  
  notes.push('Actual bill may vary based on water usage');

  return {
    waterRate,
    trashRate,
    recycleRate,
    poolSurcharge,
    subtotal,
    estimatedTotal: subtotal,
    notes,
    base_water_rate: BASE_WATER_RATE,
    trash_base_rate: TRASH_BASE_RATE,
    recycle_base_rate: RECYCLE_BASE_RATE,
    territory_multiplier: territory === 'outside_city_limits' ? 1.29 : 1.0,
    additional_trash_cart_fee: ADDITIONAL_TRASH_CART_FEE,
    additional_recycle_cart_fee: ADDITIONAL_RECYCLE_CART_FEE,
    pool_surcharge: poolSurcharge,
    irrigation_tier_rate: 0, // Variable based on usage
    estimated_monthly_total: subtotal,
    deposit_required: 0 // Calculated separately
  };
}

/**
 * Validate service start date
 */
export function validateServiceStartDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Must be today or future
  return date >= today;
}

/**
 * Validate service dates
 */
export function validateServiceDates(
  startDate: Date | null,
  stopDate: Date | null
): boolean {
  if (!startDate || !stopDate) return true; // OK if one is missing
  
  // Stop date must be after start date
  return stopDate > startDate;
}

/**
 * Calculate deposit amount examples for documentation
 */
export function getDepositExamples() {
  return [
    {
      scenario: 'Best case',
      propertyType: 'owner_occupied' as PropertyUseType,
      territory: 'inside_city_limits' as ServiceTerritory,
      creditScore: 750,
      result: calculateDeposit('owner_occupied', 'inside_city_limits', 750)
    },
    {
      scenario: 'Typical owner',
      propertyType: 'owner_occupied' as PropertyUseType,
      territory: 'inside_city_limits' as ServiceTerritory,
      creditScore: 650,
      result: calculateDeposit('owner_occupied', 'inside_city_limits', 650)
    },
    {
      scenario: 'Rental fair credit',
      propertyType: 'rent' as PropertyUseType,
      territory: 'inside_city_limits' as ServiceTerritory,
      creditScore: 650,
      result: calculateDeposit('rent', 'inside_city_limits', 650)
    },
    {
      scenario: 'Worst case',
      propertyType: 'rent' as PropertyUseType,
      territory: 'outside_city_limits' as ServiceTerritory,
      creditScore: null,
      result: calculateDeposit('rent', 'outside_city_limits', null)
    }
  ];
}
