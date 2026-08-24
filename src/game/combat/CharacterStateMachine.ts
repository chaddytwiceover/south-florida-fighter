/**
 * Modern 2D Fighter State Machine
 */

export type FighterState =
  | "IDLE"
  | "WALK_FWD"
  | "WALK_BACK"
  | "JUMP_RISE"
  | "JUMP_FALL"
  | "LANDING"
  | "DASH_FWD"
  | "DASH_BACK"
  | "ATTACK_STARTUP"
  | "ATTACK_ACTIVE"
  | "ATTACK_RECOVERY"
  | "BLOCK_HIGH"
  | "BLOCK_LOW"
  | "BLOCK_STUN"
  | "PARRY_ACTIVE"
  | "PARRY_SUCCESS"
  | "PARRY_RECOVERY"
  | "HITSTUN"
  | "LAUNCHED"
  | "KNOCKDOWN"
  | "TECH_ROLL"
  | "KO";

export class CharacterStateMachine {
  currentState: FighterState = "IDLE";
  stateTime = 0;
  stateFrames = 0;

  changeState(newState: FighterState): void {
    if (this.currentState === "KO") return; // KO is terminal
    this.currentState = newState;
    this.stateTime = 0;
    this.stateFrames = 0;
  }

  tick(dt: number): void {
    this.stateTime += dt;
    this.stateFrames++;
  }

  isNeutral(): boolean {
    return (
      this.currentState === "IDLE" ||
      this.currentState === "WALK_FWD" ||
      this.currentState === "WALK_BACK"
    );
  }

  isAirborne(): boolean {
    return this.currentState === "JUMP_RISE" || this.currentState === "JUMP_FALL";
  }

  isAttacking(): boolean {
    return (
      this.currentState === "ATTACK_STARTUP" ||
      this.currentState === "ATTACK_ACTIVE" ||
      this.currentState === "ATTACK_RECOVERY"
    );
  }

  isBlocking(): boolean {
    return (
      this.currentState === "BLOCK_HIGH" ||
      this.currentState === "BLOCK_LOW" ||
      this.currentState === "BLOCK_STUN"
    );
  }

  isParrying(): boolean {
    return (
      this.currentState === "PARRY_ACTIVE" ||
      this.currentState === "PARRY_SUCCESS"
    );
  }

  isInvulnerable(): boolean {
    return (
      this.currentState === "TECH_ROLL" ||
      this.currentState === "PARRY_SUCCESS"
    );
  }

  canCancel(): boolean {
    return this.currentState === "ATTACK_ACTIVE" || this.currentState === "ATTACK_RECOVERY";
  }
}
