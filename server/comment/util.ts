import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Comment} from '../comment/model';
import UserCollection from '../user/collection';
import LikeCollection from '../like/collection';
import CommentCollection from './collection';

// Update this if you add a property to the Freet type!
type CommentResponse = {
  _id: string;
  author: string;
  dateCreated: string;
  content: string;
  likes: Array<string>;
  comments: Array<CommentResponse>;
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
 * @param {HydratedDocument<Comment>} comment - A freet
 * @returns {CommentResponse} - The freet object formatted for the frontend
 */
const constructCommentResponse = async (comment: HydratedDocument<Comment>): Promise<CommentResponse> => {
  const commentCopy: Comment = {
    ...comment.toObject({
      versionKey: false // Cosmetics; prevents returning of __v property
    })
  };

  const author = await UserCollection.findOneByUserId(commentCopy.authorId);

  const likes: Array<string> =[];

  for (const likeId of commentCopy.likes) {

    const like = await LikeCollection.findOne(likeId);
    if (like) {
      const user = await UserCollection.findOneByUserId(like.userId);
      likes.push(user.username);
    }
  }

  const comments: Array<CommentResponse> =[];
  for (const commentId of commentCopy.comments) {
    const comment = await CommentCollection.findOne(commentId);
    if (comment) {
      comments.push(await constructCommentResponse(comment));
    }
  }

  return {
    ...commentCopy,
    _id: commentCopy._id.toString(),
    author: author.username,
    dateCreated: formatDate(comment.dateCreated),
    content: commentCopy.content,
    likes: likes,
    comments: comments
  };
};

export {
  constructCommentResponse
};
