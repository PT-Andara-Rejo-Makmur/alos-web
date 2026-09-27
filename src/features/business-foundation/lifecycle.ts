import { LIFECYCLE_STATES, PERFORMANCE_STATES, type LifecycleState, type PerformanceState } from "./enums";
export const isLifecycleState = (value: unknown): value is LifecycleState => LIFECYCLE_STATES.includes(value as LifecycleState);
export const isPerformanceState = (value: unknown): value is PerformanceState => PERFORMANCE_STATES.includes(value as PerformanceState);
