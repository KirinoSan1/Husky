import { useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

export default function Confirmation(){
    const params = useParams()
    const id = params.id
    const token = params.token
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const url = `https://localhost:443/api/user/${id}/verify/${token}`
    const navigate = useNavigate()
    
    const handleClick = async () => {
        const response = await fetch(url, {method: "GET"})
        await response.text()
        if(response.status == 201){
            setSuccess(true)
            setTimeout(() => {
                navigate("/");
              }, 5000);
        } else{
            setError("Confirmation failed")
        }
    }

    if(!id || !token){
        return <p>Params not defined</p>
    }

    if(error){
        return <p>Confirmation failed</p>
    }
    if(success){
        
        return (<><h3>Verification successful. </h3>
        <p>You will be redirected shortly. You can now log in using your credentials.</p></>)
    }

    return <Button onClick = {() => {handleClick()}}>Confirm</Button>
}