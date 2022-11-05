import type {HydratedDocument} from 'mongoose';
import UserCollection from '../user/collection';
import type {Search} from '../search/model';

// Update this if you add a property to the Freet type!
type SearchResponse = {
  _id: string;
  viewerId: string;
  content: string;
  users: Array<string>;
};

/**
 * Transform a raw Freet object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Search>} search - A search
 * @returns {SearchResponse} - The search object formatted for the frontend
 */
const constructSearchResponse = async (search: HydratedDocument<Search>): Promise<SearchResponse> => {
  const searchCopy: Search = {
    ...search.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  const users: Array<string> =[];

  for (const userId of searchCopy.users) {
    const user = await UserCollection.findOneByUserId(userId);
    users.push(user.username);
  }

  return {
    ...searchCopy,
    _id: searchCopy._id.toString(),
    viewerId: searchCopy.viewerId.toString(),
    content: searchCopy.content,
    users: users
  };
};

export {
  constructSearchResponse
};
