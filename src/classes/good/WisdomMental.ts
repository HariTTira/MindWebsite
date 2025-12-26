import GoodMental from './GoodMental'
import type { MentalBaseOptions } from '../AbstractMental'

export class WisdomMental extends GoodMental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('wisdom')
    }
  }
}

export default WisdomMental

