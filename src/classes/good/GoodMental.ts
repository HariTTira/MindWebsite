import Mental from '../Mental'
import type { MentalBaseOptions } from '../AbstractMental'

export class GoodMental extends Mental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    
    if (!this.type) {
      this.setType('good')
    }
  }
}

export default GoodMental

