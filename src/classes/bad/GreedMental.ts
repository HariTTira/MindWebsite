import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

export class GreedMental extends BadMental {
  constructor(options: MentalBaseOptions & {
    attractionStrength?: number
    attractionRange?: number
  } = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('greed')
    }
  }
}

export default GreedMental

