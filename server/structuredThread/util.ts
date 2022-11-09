import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import { StructuredThread } from './model';
import FreetCollection from '../freet/collection';
import UserCollection from '../user/collection';
import * as util from '../freet/util';

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
  comments: Array<CommentResponse>;
  credibilityScore: undefined | number;
};

type ThreadResponse = {
  _id: string;
  author: string;
  dateCreated: string;
  content: Array<FreetResponse>;
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
 * @param {HydratedDocument<StructuredThread>} thread - A thread
 * @returns {FreetResponse} - The freet object formatted for the frontend
 */
const constructThreadResponse = async (thread: HydratedDocument<StructuredThread>): Promise<ThreadResponse> => {
  const threadCopy: StructuredThread = {
    ...thread.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  const author = await UserCollection.findOneByUserId(threadCopy.authorId);

  const freets: Array<FreetResponse> =[];
  for (const freetId of threadCopy.content) {
    const freet = await FreetCollection.findOne(freetId);
    freets.push(await util.constructFreetResponse(freet));
  }

  return {
    ...threadCopy,
    _id: threadCopy._id.toString(),
    author: author.username.toString(),
    dateCreated: formatDate(threadCopy.dateCreated),
    content: freets,
  };
};

export {
  constructThreadResponse
};
