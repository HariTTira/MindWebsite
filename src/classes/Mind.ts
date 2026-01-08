import { AbstractMind } from './AbstractMind'
import type { MindBaseOptions } from './AbstractMind'
import Mental from './Mental'
import { handleCollision as handleCollisionHelper } from '../helpers/collisionHelpers'

export class Mind extends AbstractMind {
  mentals: Mental[] = []

  constructor(options: MindBaseOptions = {}) {
    super(options)
    this.createGeometry()
    this.createMaterial()
    this.createMesh()
  }

  getRadius(): number {
    return this.scale
  }

  constrainMentalPosition(mental: Mental): void {
    const mindRadius = this.getRadius()
    const mentalRadius = mental.getRadius() * this.scale
    const maxDistance = Math.max(mentalRadius + 0.005, mindRadius - mentalRadius - 0.01)

    const position = mental.getPosition()
    const worldX = position.x * this.scale
    const worldY = position.y * this.scale
    const worldZ = position.z * this.scale
    const distance = Math.sqrt(worldX * worldX + worldY * worldY + worldZ * worldZ)

    if (distance > maxDistance || distance === 0) {
      if (distance > 0) {
        const localDistance = Math.sqrt(
          position.x * position.x +
          position.y * position.y +
          position.z * position.z
        )
        const normalX = localDistance > 0 ? position.x / localDistance : 1
        const normalY = localDistance > 0 ? position.y / localDistance : 0
        const normalZ = localDistance > 0 ? position.z / localDistance : 0

        const localMaxDistance = maxDistance / this.scale
        
        mental.setPosition(
          normalX * localMaxDistance,
          normalY * localMaxDistance,
          normalZ * localMaxDistance
        )
      } else {
        const localMaxDistance = maxDistance / this.scale
        const randomRadius = Math.random() * localMaxDistance * 0.3
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(Math.random() * 2 - 1)
        const newX = randomRadius * Math.sin(phi) * Math.cos(theta)
        const newY = randomRadius * Math.sin(phi) * Math.sin(theta)
        const newZ = randomRadius * Math.cos(phi)
        
        mental.setPosition(newX, newY, newZ)
      }
    }
  }

  handleCollision(mental1: Mental, mental2: Mental): void {
    const bounceStrength = 0.9
    handleCollisionHelper(mental1, mental2, bounceStrength)
  }

  handleBoundaryCollision(mental: Mental): void {
    const mindRadius = this.getRadius()
    const mentalRadius = mental.getRadius() * this.scale
    const maxDistance = mindRadius - mentalRadius - 0.01

    const position = mental.getPosition()
    const worldX = position.x * this.scale
    const worldY = position.y * this.scale
    const worldZ = position.z * this.scale
    const distance = Math.sqrt(worldX * worldX + worldY * worldY + worldZ * worldZ)

    if (distance >= maxDistance) {
      const localDistance = Math.sqrt(
        position.x * position.x +
        position.y * position.y +
        position.z * position.z
      )
      
      const normalX = localDistance > 0 ? position.x / localDistance : 1
      const normalY = localDistance > 0 ? position.y / localDistance : 0
      const normalZ = localDistance > 0 ? position.z / localDistance : 0

      const localMaxDistance = maxDistance / this.scale
      mental.setPosition(
        normalX * localMaxDistance,
        normalY * localMaxDistance,
        normalZ * localMaxDistance
      )

      const velocity = mental.getVelocity()
      const dotProduct = velocity.x * normalX + velocity.y * normalY + velocity.z * normalZ

      const bounceStrength = 0.95
      
      if (dotProduct > 0) {
        const newVelX = velocity.x - (1 + bounceStrength) * dotProduct * normalX
        const newVelY = velocity.y - (1 + bounceStrength) * dotProduct * normalY
        const newVelZ = velocity.z - (1 + bounceStrength) * dotProduct * normalZ

        mental.setVelocity(newVelX, newVelY, newVelZ)
      } else {
        const tangentialVelX = velocity.x - dotProduct * normalX
        const tangentialVelY = velocity.y - dotProduct * normalY
        const tangentialVelZ = velocity.z - dotProduct * normalZ
        mental.setVelocity(tangentialVelX, tangentialVelY, tangentialVelZ)
      }

      mental.normalizeVelocityToMotionSpeed()
    }
  }

  updatePhysics(deltaTime: number = 0.016): void {
    const mindRadius = this.getRadius()
    const speedMultiplier = deltaTime * 60
    const mindMesh = this.getMesh()
    if (!mindMesh) return

    this.mentals.forEach((mental) => {
      if (mental.isFrozen()) {
        mental.updateMaterial(deltaTime)
        return
      }

      mental.updateMaterial(deltaTime)

      const otherMentals = this.mentals.filter(m => m !== mental)
      mental.applyCustomPhysics(otherMentals)
      
      mental.normalizeVelocityToMotionSpeed()

      const position = mental.getPosition()
      const velocity = mental.getVelocity()
      
      const mentalRadius = mental.getRadius() * this.scale
      const maxDistance = mindRadius - mentalRadius - 0.01

      const nextX = position.x + velocity.x * speedMultiplier
      const nextY = position.y + velocity.y * speedMultiplier
      const nextZ = position.z + velocity.z * speedMultiplier

      const nextWorldX = nextX * this.scale
      const nextWorldY = nextY * this.scale
      const nextWorldZ = nextZ * this.scale
      const nextDistance = Math.sqrt(nextWorldX * nextWorldX + nextWorldY * nextWorldY + nextWorldZ * nextWorldZ)

      if (nextDistance > maxDistance) {
        const nextLocalDistance = Math.sqrt(nextX * nextX + nextY * nextY + nextZ * nextZ)
        const normalX = nextLocalDistance > 0 ? nextX / nextLocalDistance : 1
        const normalY = nextLocalDistance > 0 ? nextY / nextLocalDistance : 0
        const normalZ = nextLocalDistance > 0 ? nextZ / nextLocalDistance : 0

        const dotProduct = velocity.x * normalX + velocity.y * normalY + velocity.z * normalZ
        const bounceStrength = 0.95

        if (dotProduct > 0) {
          const newVelX = velocity.x - (1 + bounceStrength) * dotProduct * normalX
          const newVelY = velocity.y - (1 + bounceStrength) * dotProduct * normalY
          const newVelZ = velocity.z - (1 + bounceStrength) * dotProduct * normalZ
          mental.setVelocity(newVelX, newVelY, newVelZ)
        }

        mental.normalizeVelocityToMotionSpeed()

        const localMaxDistance = maxDistance / this.scale
        mental.setPosition(normalX * localMaxDistance, normalY * localMaxDistance, normalZ * localMaxDistance)
      } else {
        mental.setPosition(nextX, nextY, nextZ)
      }
    })

    for (let i = 0; i < this.mentals.length; i++) {
      for (let j = i + 1; j < this.mentals.length; j++) {
        const a = this.mentals[i]
        const b = this.mentals[j]
        if (a.isFrozen() || b.isFrozen()) continue
        this.handleCollision(a, b)
      }
    }

    this.mentals.forEach(mental => {
      this.constrainMentalPosition(mental)
      mental.normalizeVelocityToMotionSpeed()
    })
  }

  addMental(mental: Mental): void {
    if (!this.mentals.includes(mental)) {
      this.mentals.push(mental)
      
      this.constrainMentalPosition(mental)
      
      const mentalMesh = mental.getMesh()
      const mindMesh = this.getMesh()
      
      if (mentalMesh && mindMesh) {
        mindMesh.add(mentalMesh)
      }
    }
  }

  removeMental(mental: Mental): void {
    const index = this.mentals.indexOf(mental)
    if (index !== -1) {
      this.mentals.splice(index, 1)
      
      const mentalMesh = mental.getMesh()
      const mindMesh = this.getMesh()
      
      if (mentalMesh && mindMesh) {
        mindMesh.remove(mentalMesh)
      }
    }
  }

  getMentals(): Mental[] {
    return [...this.mentals]
  }

  getMental(index: number): Mental | undefined {
    return this.mentals[index]
  }

  getMentalByName(name: string): Mental | undefined {
    return this.mentals.find(mental => mental.getName() === name)
  }

  clearMentals(): void {
    this.mentals.forEach(mental => {
      const mentalMesh = mental.getMesh()
      const mindMesh = this.getMesh()
      
      if (mentalMesh && mindMesh) {
        mindMesh.remove(mentalMesh)
      }
      mental.dispose()
    })
    
    this.mentals = []
  }

  getMentalCount(): number {
    return this.mentals.length
  }

  dispose(): void {
    this.clearMentals()
    
    super.dispose()
  }
}

export default Mind
