import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import FreetCollection from './collection';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as util from './util';
import LikeCollection from '../like/collection';
import { Freet } from './model';
import RefreetCollection from '../refreet/collection';
import CommentCollection from '../comment/collection';
import FeedCollection from '../feed/collection';

const router = express.Router();

/**
 * Get all the freets
 *
 * @name GET /api/freets
 *
 * @return {FreetResponse[]} - A list of all the freets sorted in descending
 *                      order by date modified
 */
/**
 * Get freets by author.
 *
 * @name GET /api/freets?author=username
 *
 * @return {FreetResponse[]} - An array of freets created by user with username, author
 * @throws {400} - If author is not given
 * @throws {404} - If no user has given author
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if authorId query parameter was supplied
    if (req.query.author !== undefined || req.query.feed !== undefined) {
      next();
      return;
    }

    const allFreets = await FreetCollection.findAll();
    const response = allFreets.map(util.constructFreetResponse);

    res.status(200).json(await Promise.all(response));
  },
  async (req: Request, res: Response, next: NextFunction) => {

    if (req.query.author !== undefined) {
      next();
      return;
    }

    let authorFeed = await FeedCollection.findOneByUser(req.session.userId);
    const allFreets = await FreetCollection.findAll();

    await FeedCollection.updateFeed(authorFeed._id);
    authorFeed = await FeedCollection.findOneByUser(req.session.userId);

    const feedFreets: Array<Freet> = [];

    for (const freet of allFreets) {
      for (const freetId of authorFeed.freets) {
        if (freet._id.toString() === freetId) {
          feedFreets.push(freet);
        }
      }
    }
    const response = feedFreets.map(util.constructFreetResponse);
    res.status(200).json(await Promise.all(response));
  },
  [
    userValidator.isAuthorExists
  ],
  async (req: Request, res: Response, next: NextFunction) => {

    if (req.query.likes !== undefined || req.query.refreets !== undefined || req.query.comments !== undefined) {
      next();
      return;
    }

    const authorFreets = await FreetCollection.findAllByUsername(req.query.author as string);
    const response = authorFreets.map(util.constructFreetResponse);
    res.status(200).json(await Promise.all(response));
  },
  async (req: Request, res: Response, next: NextFunction) => {

    if (req.query.refreets !== undefined || req.query.comments !== undefined || req.query.feed !== undefined) {
      next();
      return;
    }

    const authorLikes = await LikeCollection.findAllByUsername(req.query.author as string);
    const allFreets = await FreetCollection.findAll();

    const likedFreets: Array<Freet> = [];

    for (const freet of allFreets) {
      for (const likeId of authorLikes) {
        if (freet.likes.includes(likeId._id.toString())) {
          likedFreets.push(freet);
        }
      }
    }

    const response = likedFreets.map(util.constructFreetResponse);
    res.status(200).json(await Promise.all(response));
  },
  async (req: Request, res: Response, next: NextFunction) => {

    if (req.query.comments !== undefined || req.query.feed !== undefined) {
      next();
      return;
    }

    const authorRefreets = await RefreetCollection.findAllByUsername(req.query.author as string);
    const allFreets = await FreetCollection.findAll();

    const refreetFreets: Array<Freet> = [];

    for (const freet of allFreets) {
      for (const refreetId of authorRefreets) {
        if (freet.refreets.includes(refreetId._id.toString())) {
          refreetFreets.push(freet);
        }
      }
    }
    const response = refreetFreets.map(util.constructFreetResponse);
    res.status(200).json(await Promise.all(response));
  },
  async (req: Request, res: Response, next: NextFunction) => {

    if (req.query.feed !== undefined) {
      next();
      return;
    }

    const authorComments = await CommentCollection.findAllByUsername(req.query.author as string);
    const allFreets = await FreetCollection.findAll();

    const commentFreets: Array<Freet> = [];

    for (const freet of allFreets) {
      for (const commentId of authorComments) {
        if (freet.comments.includes(commentId._id.toString())) {
          commentFreets.push(freet);
        }
      }
    }
    const response = commentFreets.map(util.constructFreetResponse);
    res.status(200).json(await Promise.all(response));
  }
);

/**
 * Create a new freet.
 *
 * @name POST /api/freets
 *
 * @param {string} content - The content of the freet
 * @return {FreetResponse} - The created freet
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isValidFreetContent,
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    let freet;

    if (req.body.sources) {
      const sourcesString = (req.body.sources as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
      const sources = sourcesString.split(',');
      freet = await FreetCollection.addOne(userId, req.body.content, sources);
    } else {
      freet = await FreetCollection.addOne(userId, req.body.content);
    }

    res.status(201).json({
      message: 'Your freet was created successfully.',
      freet: await util.constructFreetResponse(freet)
    });
  }
);

/**
 * Delete a freet
 *
 * @name DELETE /api/freets/:id
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the freet
 * @throws {404} - If the freetId is not valid
 */
router.delete(
  '/:freetId?',
  [
    userValidator.isUserLoggedIn,
    freetValidator.isFreetExists,
    freetValidator.isValidFreetModifier
  ],
  async (req: Request, res: Response) => {
    await FreetCollection.deleteOne(req.params.freetId);
    res.status(200).json({
      message: 'Your freet was deleted successfully.'
    });
  }
);

export {router as freetRouter};
