import GeneralMental from './GeneralMental'
import type { MentalBaseOptions } from '../AbstractMental'

export class VicaraMental extends GeneralMental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('vicara')
    }
  }
}

export default VicaraMental

