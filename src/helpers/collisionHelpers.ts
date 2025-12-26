import type { AbstractMental } from '../classes/AbstractMental'
import type Mental from '../classes/Mental'

export function calculateDistance(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number }
): number {
  const dx = pos2.x - pos1.x
  const dy = pos2.y - pos1.y
  const dz = pos2.z - pos1.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function checkCollision(
  mental1: AbstractMental,
  mental2: AbstractMental
): { isColliding: boolean; distance: number; minDistance: number } {
  const pos1 = mental1.getPosition()
  const pos2 = mental2.getPosition()
  const radius1 = mental1.getRadius()
  const radius2 = mental2.getRadius()
  
  const distance = calculateDistance(pos1, pos2)
  const minDistance = radius1 + radius2
  
  return {
    isColliding: distance < minDistance && distance > 0,
    distance,
    minDistance
  }
}

export function separateSpheres(
  mental1: AbstractMental,
  mental2: AbstractMental,
  overlap: number
): void {
  const pos1 = mental1.getPosition()
  const pos2 = mental2.getPosition()
  
  const dx = pos2.x - pos1.x
  const dy = pos2.y - pos1.y
  const dz = pos2.z - pos1.z
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
  
  if (distance === 0) return
  
  const separationX = (dx / distance) * overlap * 0.5
  const separationY = (dy / distance) * overlap * 0.5
  const separationZ = (dz / distance) * overlap * 0.5
  
  mental1.setPosition(
    pos1.x - separationX,
    pos1.y - separationY,
    pos1.z - separationZ
  )
  mental2.setPosition(
    pos2.x + separationX,
    pos2.y + separationY,
    pos2.z + separationZ
  )
  
  const mesh1 = mental1.getMesh()
  const mesh2 = mental2.getMesh()
  if (mesh1) {
    mesh1.position.set(
      pos1.x - separationX,
      pos1.y - separationY,
      pos1.z - separationZ
    )
  }
  if (mesh2) {
    mesh2.position.set(
      pos2.x + separationX,
      pos2.y + separationY,
      pos2.z + separationZ
    )
  }
}

export function applyElasticCollision(
  mental1: AbstractMental,
  mental2: AbstractMental,
  bounceStrength: number = 0.9
): void {
  const pos1 = mental1.getPosition()
  const pos2 = mental2.getPosition()
  const vel1 = mental1.getVelocity()
  const vel2 = mental2.getVelocity()
  
  const dx = pos2.x - pos1.x
  const dy = pos2.y - pos1.y
  const dz = pos2.z - pos1.z
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)
  
  if (distance === 0) return
  
  const normalX = dx / distance
  const normalY = dy / distance
  const normalZ = dz / distance
  
  const relVelX = vel2.x - vel1.x
  const relVelY = vel2.y - vel1.y
  const relVelZ = vel2.z - vel1.z
  
  const dotProduct = relVelX * normalX + relVelY * normalY + relVelZ * normalZ
  
  if (dotProduct < 0) {
    const impulse = dotProduct * (1 + bounceStrength)
    
    const newVel1X = vel1.x + impulse * normalX
    const newVel1Y = vel1.y + impulse * normalY
    const newVel1Z = vel1.z + impulse * normalZ
    
    const newVel2X = vel2.x - impulse * normalX
    const newVel2Y = vel2.y - impulse * normalY
    const newVel2Z = vel2.z - impulse * normalZ
    
    mental1.setVelocity(newVel1X, newVel1Y, newVel1Z)
    mental2.setVelocity(newVel2X, newVel2Y, newVel2Z)
    
    mental1.normalizeVelocityToMotionSpeed()
    mental2.normalizeVelocityToMotionSpeed()
  }
}

export function handleCollision(
  mental1: Mental,
  mental2: Mental,
  bounceStrength: number = 0.9
): void {
  const collisionInfo = checkCollision(mental1, mental2)
  
  if (collisionInfo.isColliding) {
    const overlap = collisionInfo.minDistance - collisionInfo.distance
    separateSpheres(mental1, mental2, overlap)
    
    applyElasticCollision(mental1, mental2, bounceStrength)
  }
}
