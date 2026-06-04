// Stub for @mediapipe/pose. The @tensorflow-models/pose-detection bundle
// statically imports `Pose` from this package for its BlazePose runtime, but we
// only use MoveNet, which never touches it. The real package ships no ESM
// exports, which breaks bundling — this stub satisfies the static import.
export class Pose {}
export default {}
