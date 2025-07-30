import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

@Pipe({
  name: 'localDate'
})
export class LocalDatePipe implements PipeTransform {
transform(
    value: Date | string | null | undefined,
    formatStr: string = 'dd/MM/yyyy HH:mm',
    timezone?: string
  ): string {
    if (!value) return '-';

    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return 'Fecha inválida';

      // Usa la zona horaria del torneo o del navegador
      const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const zonedDate = toZonedTime(date, tz);  // ← Ahora es toZonedTime
      return format(zonedDate, formatStr);
    } catch (e) {
      return 'Error';
    }
  }
}
