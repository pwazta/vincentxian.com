// Declares gsap VelocityTracker module so TS uses typed declaration.
// Used wherever gsap/utils/VelocityTracker is imported in the app.
declare module "gsap/utils/VelocityTracker.js" {
  import type { gsap as GsapType } from "gsap";
  type VelocityTrackerType = GsapType["utils"]["VelocityTracker"];
  const VelocityTracker: VelocityTrackerType;
  export { VelocityTracker };
  export default VelocityTracker;
}

declare module "gsap/utils/VelocityTracker" {
  export * from "gsap/utils/VelocityTracker.js";
  export { default } from "gsap/utils/VelocityTracker.js";
}