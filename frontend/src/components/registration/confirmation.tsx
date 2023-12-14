import { useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

export default function Confirmation() {
    const params = useParams();
    const id = params.id;
    const token = params.token;
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const url = `https://localhost:443/api/user/${id}/verify/${token}`;
    const navigate = useNavigate();

    const handleClick = async () => {
        const response = await fetch(url, { method: "GET" });
        await response.text();
        if (response.status === 201) {
            setSuccess(true);
            setTimeout(() => {
                navigate("/");
            }, 5000);
        } else {
            setError("Confirmation failed");
        }
    }

    if (!id || !token) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p>Params not defined</p>
            </div>);
    }

    if (error) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p>Confirmation failed</p>
            </div>);
    }
    if (success) {
        return (<>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <h3>Verification successful.</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p>You will be redirected shortly. You can now log in using your credentials.</p>
            </div>
        </>);
    }

    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><Button onClick={() => { handleClick(); }}>Confirm E-Mail Address</Button></div>;
}