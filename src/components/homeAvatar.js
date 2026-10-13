import {resolvePeopleImageUrl} from '@controleonline/ui-people/src/react/utils/peopleImage';
import {resolveFileImageUrl} from '@controleonline/ui-common/src/react/utils/fileUrl';

// The auth store already contains the avatar delivered by the login contract.
export default (user, company) => resolvePeopleImageUrl(user, resolveFileImageUrl, {company});
