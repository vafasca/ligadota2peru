import { PlayerDivision } from "./jugador.model";

export interface RegistrationLog {
  userId: string;
  email: string;
  playerDivision: PlayerDivision;
  accessCode: string;
  usedAt: Date;
  registrationCompleted?: boolean;
  completedAt?: Date;
}