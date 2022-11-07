import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Freet} from '../freet/model';
import UserCollection from '../user/collection';
import LikeCollection from '../like/collection';
import RefreetCollection from '../refreet/collection';
import CommentCollection from '../comment/collection';
import * as util from '../comment/util';
import FreetCredibilityScoreCollection from '../freetCredibilityScore/collection';

// Update this if you add a property to the Freet type!
type CommentResponse = {
  _id: string;
  author: string;
  dateCreated: string;
  content: string;
  likes: Array<string>;
  comments: Array<CommentResponse>;
};

type FreetResponse = {
  _id: string;
  author: string;
  dateCreated: string;
  content: string;
  likes: Array<string>;
  refreets: Array<string>;
  comments: Array<CommentResponse>
  credibilityScore: undefined | number;
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

  let credScore: undefined | number;

  if (freetCopy.credibilityScoreId) {
    const score = await FreetCredibilityScoreCollection.findOne(freetCopy.credibilityScoreId);
    credScore = score.value;
  }

  const author = await UserCollection.findOneByUserId(freetCopy.authorId);

  const likes: Array<string> =[];

  for (const likeId of freetCopy.likes) {

    const like = await LikeCollection.findOne(likeId);
    
    const user = await UserCollection.findOneByUserId(like.userId);
    likes.push(user.username);
  }

  const refreets: Array<string> =[];

  for (const refreetId of freetCopy.refreets) {

    const refreet = await RefreetCollection.findOne(refreetId);
    
    const user = await UserCollection.findOneByUserId(refreet.userId);
    refreets.push(user.username);
  }

  const comments: Array<CommentResponse> =[];
  for (const commentId of freetCopy.comments) {
    const comment = await CommentCollection.findOne(commentId);
    comments.push(await util.constructCommentResponse(comment));
  }

  return {
    ...freetCopy,
    _id: freetCopy._id.toString(),
    author: author.username.toString(),
    dateCreated: formatDate(freet.dateCreated),
    likes: likes,
    refreets: refreets,
    comments: comments,
    credibilityScore: credScore
  };
};

export {
  constructFreetResponse
};
