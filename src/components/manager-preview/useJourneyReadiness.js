import {useEffect} from 'react';
import {useStore} from '@store';

// This signal is deliberately screen-specific: transport completion alone is
// never labeled as complete rendering of an arbitrary module.
const listContexts = {ClientsIndex:['people','people'], ProvidersIndex:['people','people'], FranchiseesIndex:['people','people'], MyCompaniesPage:['people','people'], ProductsPage:['products','products'], EmployeesIndex:['people_link','people_links']};

export default function useJourneyReadiness({experience, route, focused}) {
  const context = listContexts[route];
  const people = useStore(context?.[0] || 'people');
  const completedAt = people.getters.lastCompletedRequest?.completedAt;
  useEffect(() => {
    if (!experience || !focused || !context) return;
    const snapshot = experience.journal.snapshot();
    const returned = snapshot.events.some(event => event.journeyId === snapshot.active?.id &&
      ['read.returned','read.cache-hit','read.shared-returned'].includes(event.type) && String(event.resource || '').replace(/^\//,'') === context[1]);
    if (returned && !people.getters.isLoading && people.getters.lastCompletedRequest?.status === 'success')
      experience.dataCommitted(route);
  }, [experience, route, focused, completedAt, people.getters.isLoading]);
}
