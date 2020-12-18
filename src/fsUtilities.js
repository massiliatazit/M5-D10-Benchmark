const fsExtra = require("fs-extra");
const {join} = require ("path");
const moviesPath = join (__dirname,"./media/media.json")
const readDB = async (filePath)=>{
 try{
    const fileJson = await fsExtra.readJSON(filePath)
    return fileJson
 }catch(err){
    throw new Error(err)
 }


}
const writeDB = async(filePath,contentfile)=>{
    try{
        const filewrite =  await fsExtra.writeJSON(filePath,contentfile)
        return filewrite;

    }catch(err){
        throw new Error(err)
    }
}

module.exports = {
    getmovies:async()=>readDB(moviesPath),
    writemovies:async(movies)=>writeDB(moviesPath,movies)

}