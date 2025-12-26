import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

export class ImmeasureMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('immeasure')
    }
  }
}

export default ImmeasureMental

