import mongoose from 'mongoose'
export const DB  = async ()=>{
    try{
        if(!process.env.MONGO_URL){
            throw new Error('MONGO_URL is not defind in .env')
        }
        await mongoose.connect(process.env.MONGO_URL)
        console.log('MongoDb is Connected Successfully')
    }catch(err){
        console.log('Mongodb is not Connected', err)
    }
}