import GeneralMental from './GeneralMental'
import type { MentalBaseOptions } from '../AbstractMental'

export class DeterMental extends GeneralMental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('deter')
    }
  }
}

export default DeterMental

