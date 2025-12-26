import Mental from '../Mental'
import type { MentalBaseOptions } from '../AbstractMental'

export class GeneralMental extends Mental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('general')
    }
  }
}

export default GeneralMental

