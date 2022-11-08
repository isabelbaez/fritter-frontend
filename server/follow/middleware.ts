import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import UserCollection from '../user/collection';
import FollowCollection from './collection';

/**
 * Checks if a follow with followId is req.params exists
 */
const isFollowExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.followId);
  const follow = validFormat ? await FollowCollection.findOne(req.params.followId) : '';
  if (!follow) {
    res.status(404).json({
      error: {
        followNotFound: `Follow with follow ID ${req.params.followId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if a follow with followId is req.params exists
 */
 const isValidUnfollow = async (req: Request, res: Response, next: NextFunction) => {

  const dstUserId = await UserCollection.findOneByUsername(req.params.dstUser);
  const follow = await FollowCollection.findOneBySrcDstUser(req.session.userId, dstUserId._id);

  if (!follow) {
    res.status(403).json({
      error: {
        notValidUnfollow: `User with user ID ${req.session.userId} is not following user with user ID ${dstUserId._id}.`
      }
    });
    return;
  }
  next();
};

/**
 * Checks if the new follow is not an existing follow.
 */
const isValidFollow = async (req: Request, res: Response, next: NextFunction) => {

  const user = await UserCollection.findOneByUserId(req.session.userId);
  const dstUserId = await UserCollection.findOneByUsername(req.body.dstUser);

  const following = await FollowCollection.findAllFollowing(user.username);

  let already_following = false;

  for (let follow of following) {
    if (follow.dstUserId.toString() === dstUserId._id.toString()) {
      already_following = true;
      break;
    }
  }

  if (already_following) {
    res.status(413).json({
      error: {
        duplicateFollow: `User with user ID ${req.session.userId} is already following User with userna,e ${req.body.dstUser}.`
      }
    });
    return;
  }
  next();
};

export {
  isValidFollow,
  isFollowExists,
  isValidUnfollow
};
