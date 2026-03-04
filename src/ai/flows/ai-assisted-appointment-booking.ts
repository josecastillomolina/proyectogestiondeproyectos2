
'use server';
/**
 * @fileOverview Se ha desactivado el flujo de IA para priorizar el agendamiento manual directo.
 */

export async function aiAssistedAppointmentBooking(input: any): Promise<any> {
  throw new Error("El sistema de IA ha sido desactivado en favor del agendamiento directo nacional.");
}
