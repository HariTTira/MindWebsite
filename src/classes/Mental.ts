import { AbstractMental } from './AbstractMental'
import type { MentalBaseOptions } from './AbstractMental'

export class Mental extends AbstractMental {
  constructor(options: MentalBaseOptions = {}) {
    super(options)
    this.createGeometry()
    this.createMaterial()
    this.createMesh()
    
    this.normalizeVelocityToMotionSpeed()
  }
}

export default Mental
