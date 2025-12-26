import BadMental from './BadMental'
import type { MentalBaseOptions } from '../AbstractMental'

export class PrideMental extends BadMental {
  constructor(options: MentalBaseOptions & {
    attractionStrength?: number
    attractionRange?: number
  } = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('pride')
    }
  }
}

export default PrideMental

