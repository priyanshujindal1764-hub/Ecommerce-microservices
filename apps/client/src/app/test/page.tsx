import { auth } from "@clerk/nextjs/server";

const TestPage = async () => {
    const {getToken} = await auth();
    const token =await getToken();
    console.log(token);
    
    const res = await fetch("http://localhost:8002/test",{
        headers:{
            Authorization : `Bearer ${token}`,
        },
    }
    ); 
    const data = await res.json();
    console.log(data);


    
  return (
    <div>
        test page
      
    </div>
  )
}

export default TestPage
