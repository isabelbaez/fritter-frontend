import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Freet} from '../freet/model';
import UserCollection from '../user/collection';
import LikeCollection from '../like/collection';

// Update this if you add a property to the Freet type!
type FreetResponse = {
  _id: string;
  author: string;
  dateCreated: string;
  content: string;
  likes: Array<string>;
  refreets: Array<string>;
  credibilityScoreId: string;
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment(date).format('MMMM Do YYYY, h:mm:ss a');

/**
 * Transform a raw Freet object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Freet>} freet - A freet
 * @returns {FreetResponse} - The freet object formatted for the frontend
 */
const constructFreetResponse = async (freet: HydratedDocument<Freet>): Promise<FreetResponse> => {
  const freetCopy: Freet = {
    ...freet.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  let credScore: string;

  if (!freetCopy.credibilityScoreId) {
    credScore = "Disabled";
  } else {
    credScore = freetCopy.credibilityScoreId.toString();
  }

  const author = await UserCollection.findOneByUserId(freetCopy.authorId);

  const likes: Array<string> =[];

  for (const likeId of freetCopy.likes) {

    const like = await LikeCollection.findOne(likeId);
    
    const user = await UserCollection.findOneByUserId(like.userId);
    likes.push(user.username);
  }

  return {
    ...freetCopy,
    _id: freetCopy._id.toString(),
    author: author.username.toString(),
    dateCreated: formatDate(freet.dateCreated),
    likes: likes,
    refreets: freetCopy.refreets,
    credibilityScoreId: credScore
  };
};

export {
  constructFreetResponse
};
