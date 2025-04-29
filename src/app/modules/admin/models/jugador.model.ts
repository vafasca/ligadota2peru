export interface Player {
    avatar: string;
    nick: string;
    idDota: number;
    category: string;  // Debería contener el rol y categoría ej: "Core 1"
    mmr: number;
    status: string;
    rating: number;
    observations?: string;
    isCaptain?: boolean; // Campo adicional necesario
    registrationDate?: Date;
  }