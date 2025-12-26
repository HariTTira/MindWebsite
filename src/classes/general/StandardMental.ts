import GeneralMental from './GeneralMental'
import type { MentalBaseOptions } from '../AbstractMental'

export class StandardMental extends GeneralMental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('standard')
    }
  }
}

export default StandardMental

