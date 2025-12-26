import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

export class StandardGoodMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('standardGood')
    }
  }
}

export default StandardGoodMental

