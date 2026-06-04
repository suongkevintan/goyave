/**
 * Registre central des modules de Voyage.
 * Source unique pour la navigation, le routing et les libellés.
 * Ajouter un module = ajouter une entrée ici + sa page dans src/modules/<id>.
 */
export interface ModuleDef {
  /** identifiant technique = segment d'URL + dossier dans src/modules */
  id: string
  /** libellé affiché dans la navigation */
  label: string
  /** emoji d'icône (placeholder en attendant la DA — phase 2) */
  icon: string
  /** courte description pour le dashboard */
  blurb: string
}

export const MODULES: ModuleDef[] = [
  { id: 'casting', label: 'Casting', icon: '🗂️', blurb: 'Les participants du voyage' },
  { id: 'activities', label: 'Activités', icon: '🎯', blurb: 'Ce qu’on veut faire' },
  { id: 'itinerary', label: 'Itinéraire', icon: '📅', blurb: 'Le programme jour par jour' },
  { id: 'availability', label: 'Dispo', icon: '📆', blurb: 'Trouver les bonnes dates' },
  { id: 'budget', label: 'Budget', icon: '💰', blurb: 'Les coûts prévisionnels' },
  { id: 'beacon', label: 'Balise', icon: '📍', blurb: 'Statut pendant le voyage' },
  { id: 'documents', label: 'Documents', icon: '📎', blurb: 'Le classeur du voyage' },
]
