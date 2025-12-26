import GeneralMental from './GeneralMental'
import type { MentalBaseOptions } from '../AbstractMental'

export class EffortMental extends GeneralMental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('effort')
    }
  }
}

export default EffortMental

