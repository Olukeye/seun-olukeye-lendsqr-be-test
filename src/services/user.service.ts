import db from "../config/database";
import { User, CreateUserDTO } from "../models/models/types";
import { NotFoundError, UserExistError } from "../utils/errors";
import logger from "../utils/logger";


export class UserService {
  async createUser(data: CreateUserDTO): Promise<User>{
    try{
      const existingUser = await db('users').where({email: data.email}).first()

    if(existingUser){
      throw new UserExistError("user already  exist")
    }

    const [userId] = await db('users').insert({
      first_name: data.firstName,
      last_name:data.lastName,
      email:data.email,
      phone: data.phone,
      is_blacklisted: false
    })

    const user = await this.getUserById(userId)

    return user
    }catch(error){
      logger.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async getUserById(id:number):Promise<User>{
    const user = await db('users').where({id}).first()

    if(!user){
      throw new NotFoundError("user not found")
    }

    return user;
  }

  async getUserByemail(email: string): Promise<User |  null> {
    const user = await db('users').where({email}).first()
    return user || null;
  }

  async markAsBlacklisted(userId: number):Promise<void> {
    await db('users').where({id:userId}).update({is_blacklisted:true})
  }
}
export default new UserService();