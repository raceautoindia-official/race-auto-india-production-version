'use client'
import { useEffect, useState } from "react";
import { IoIosArrowDropdownCircle, IoIosArrowDropupCircle } from "react-icons/io";
import "./e-magazine-xm.css"
import { useRouter } from "next/navigation";


const GreenBar = () => {
    const router = useRouter();
    const [open, setOpen] = useState(false)
    const [isBlinking, setIsBlinking] = useState(false);

    const toggleBlink = () => {
        setIsBlinking(prevState => !prevState);
      };
    const toggle = () => {
        setOpen(!open);
    };

    useEffect(() => {
        const interval = setInterval(toggleBlink, 1000);
        return () => clearInterval(interval);
      },[])

    return (
        <>
            <div className="e-magazine-xm px-3">
                <div className="d-flex justify-content-between align-items-center">

                        <h5 className="mt-2 e-magazine-heading">
                        Start your 30 day free trial
                        </h5>

                    <div>
                        {open ?  <IoIosArrowDropdownCircle onClick={toggle} size={25}/> : <IoIosArrowDropupCircle onClick={toggle} size={25}/>}
                    </div>
                </div>
                
                {open && (
                    <>
                    
                    <hr/>
                    <div className="d-flex justify-content-evenly mb-2">
                    <div>
                    Unlock the full potential with our 30-day free trial! Subscribe now!
                    </div>
                    <button className={`subscribe-button mx-3 ${isBlinking ? 'blink' : ''}`} onClick={()=>{router.push('/subscription')}}>Subscribe now</button>
                </div>
                </>)}
            </div>
        </>
    );
}

export default GreenBar;
