import GeneralMental from './GeneralMental'
import type { MentalBaseOptions } from '../AbstractMental'

export class ThoughtMental extends GeneralMental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('thought')
    }
  }
}

export default ThoughtMental

