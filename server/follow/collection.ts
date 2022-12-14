import type {HydratedDocument, Types} from 'mongoose';
import type {Follow} from './model';
import UserCollection from '../user/collection';
import FollowModel from './model';

/**
 * This files contains a class that has the functionality to explore freets
 * stored in MongoDB, including adding, finding, updating, and deleting freets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Freet> is the output of the FreetModel() constructor,
 * and contains all the information in Freet. https://mongoosejs.com/docs/typescript.html
 */
class FollowCollection {
  /**
   * Add a follow to the collection
   *
   * @param {string} srcId - The id of the author of user following
   * @param {string} dstId - The id of the user being followed
   * @return {Promise<HydratedDocument<Follow>>} - The newly created follow
   */
  static async addOne(srcUserId: Types.ObjectId | string, dstUserId: Types.ObjectId): Promise<HydratedDocument<Follow>> {
    const date = new Date();
    const follow = new FollowModel({
      srcUserId,
      dstUserId,
      dateCreated: date,
    });
    await follow.save(); // Saves freet to MongoDB

    const srcUser = await UserCollection.findOneByUserId(srcUserId);
    await UserCollection.updateFollowing(srcUser._id, follow._id);

    const dstUser = await UserCollection.findOneByUserId(dstUserId);
    await UserCollection.updateFollower(dstUser._id, follow._id);

    return follow;
  }

  /**
   * Find a follow by followId
   *
   * @param {string} followId - The id of the follow to find
   * @return {Promise<HydratedDocument<Follow>> | Promise<null> } - The follow with the given followId, if any
   */
  static async findOne(followId: Types.ObjectId | string): Promise<HydratedDocument<Follow>> {
    return FollowModel.findOne({_id: followId});
  }

  /**
   * Find a follow by followId
   *
   * @param {string} followId - The id of the follow to find
   * @return {Promise<HydratedDocument<Follow>> | Promise<null> } - The follow with the given followId, if any
   */
  static async findOneBySrcDstUser(srcUserId: Types.ObjectId | string, dstUserId: Types.ObjectId | string): Promise<HydratedDocument<Follow>> {
    const srcUser = await UserCollection.findOneByUserId(srcUserId);
    const following = await FollowCollection.findAllFollowing(srcUser.username);
    let foundFollow;

    for (const follow of following) {
      if (dstUserId.toString() === follow.dstUserId.toString()) {
        foundFollow = follow;
      }
    }
    return foundFollow;
  }

  /**
   * Get all the follows in the database
   *
   * @return {Promise<HydratedDocument<Follow>[]>} - An array of all of the follows
   */
  static async findAll(): Promise<Array<HydratedDocument<Follow>>> {
    // Retrieves follows and sorts them from most to least recent
    return FollowModel.find({}).sort({dateCreated: -1});
  }

  /**
   * Get all of a user's following
   *
   * @param {string} username - The user ID of the user
   * @return {Promise<HydratedDocument<Follow>[]>} - An array of all of the follows
   */
  static async findAllFollowing(username: string): Promise<Array<HydratedDocument<Follow>>> {
    const srcUser = await UserCollection.findOneByUsername(username);
    return FollowModel.find({srcUserId: srcUser._id});
  }

  /**
   * Get all of a user's followers
   *
   * @param {string} username - The username of the user
   * @return {Promise<HydratedDocument<Follow>[]>} - An array of all of the follows
   */
     static async findAllFollowers(username: string): Promise<Array<HydratedDocument<Follow>>> {
      const dstUser = await UserCollection.findOneByUsername(username);
      return FollowModel.find({dstUserId: dstUser._id});
  }

  /**
   * Delete a follow with given followId.
   *
   * @param {string} followId - The freetId of freet to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(followId: Types.ObjectId | string): Promise<boolean> {

    const follow = await FollowModel.findOne({_id: followId});

    const srcUser = await UserCollection.findOneByUserId(follow.srcUserId);
    await UserCollection.removeFollowing(srcUser._id, followId);

    const dstUser = await UserCollection.findOneByUserId(follow.dstUserId);
    await UserCollection.removeFollower(dstUser._id, followId);

    const delFollow = await FollowModel.deleteOne({_id: followId});
    return delFollow !== null;
  }

}

export default FollowCollection;
