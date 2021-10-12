type CreateAlbumInput ={
    name: string; 
    artist: string;
    publishedDate: string;
}; 
type AppsyncEvent = {
    arguments:{
        input: CreateAlbumInput
    }
}
export const handler = async (  event: AppsyncEvent  )=> {    
    console.log("event", JSON.stringify(event)); 
    if(event.arguments.input.artist.toLocaleLowerCase()=="vanilla ice"){
        return {error:"No Vanilla"}
    }
    return null; 
  }