/**
 * Converts an array [x,y,z] to a vector3 obj
 **/
import { Vector3 } from "../types/misc.types";

export const arrayToVector3 = ([x, y, z]: [number, number, number]) => ({
  x,
  y,
  z,
});

/**
 * Returns the distance between two coords of vec3 type
 */
export const distBetweenCoords = (vec1: Vector3, vec2: Vector3) => {
  const dx = vec1.x - vec2.x;
  const dy = vec1.y - vec2.y;
  const dz = vec1.z - vec1.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};
