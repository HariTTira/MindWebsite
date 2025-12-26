import GeneralMental from './GeneralMental'
import type { MentalBaseOptions } from '../AbstractMental'

export class JoyMental extends GeneralMental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('joy')
    }
  }
}

export default JoyMental

