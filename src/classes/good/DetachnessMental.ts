import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

export class DetachnessMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('detachness')
    }
  }
}

export default DetachnessMental

