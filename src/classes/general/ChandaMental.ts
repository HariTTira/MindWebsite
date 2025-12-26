import GeneralMental from './GeneralMental'
import type { MentalBaseOptions } from '../AbstractMental'

export class ChandaMental extends GeneralMental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('chanda')
    }
  }
}

export default ChandaMental

