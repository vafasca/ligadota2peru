import { PlayerDivision } from "./jugador.model";

// En tu archivo de modelos (jugador.model.ts o donde tengas tus interfaces)
export interface RegistrationLog {
  userId: string;
  email: string;
  playerDivision: PlayerDivision;
  accessCode: string;
  usedAt: Date;
  registrationCompleted?: boolean;
  completedAt?: Date;
}