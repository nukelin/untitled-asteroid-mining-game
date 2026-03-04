// ─── Buyer Countries ──────────────────────────────────────────────────────────
// Defines the 5 countries that will buy ore from the player.
// Each visit to the Sell menu generates fresh randomized prices for all buyers.

import { MARKET_PRICES } from './ores'

// The list of buyer countries shown in the Sell menu.
// Each entry has an id (used internally) and a label (shown to the player).
export const BUYER_COUNTRIES = [
  { id: 'america', label: 'America' },
  { id: 'china',   label: 'China'   },
  { id: 'russia',  label: 'Russia'  },
  { id: 'japan',   label: 'Japan'   },
  { id: 'uk',      label: 'UK'      },
  { id: 'india',   label: 'India'   },
]

// generateBuyerPrices()
// Builds a fresh price table for every buyer and every ore type.
// Each price is MARKET_PRICES[ore] multiplied by a random factor between 0.70 and 1.30,
// then rounded to the nearest integer (no decimal credits).
//
// Returns an object shaped like:
//   {
//     america: { iron: 11, nickel: 27, cobalt: 48, gold: 214 },
//     china:   { iron:  8, nickel: 22, ... },
//     ...
//   }
export function generateBuyerPrices() {
  const result = {}

  for (const buyer of BUYER_COUNTRIES) {
    // Build a price entry for each ore type for this buyer
    result[buyer.id] = {}

    for (const [ore, basePrice] of Object.entries(MARKET_PRICES)) {
      // Random multiplier uniformly distributed in [0.70, 1.30]
      const multiplier = 0.70 + Math.random() * 0.60
      result[buyer.id][ore] = Math.round(basePrice * multiplier)
    }
  }

  return result
}
