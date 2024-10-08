import React, { useState } from 'react';

function HKECHosp({HKECDestHosp, setHKECDestHosp}){

    const allHKECHosp = ['CCH', 'PYN', 'RH', 'SJH', 'TWE', 'WCH'];
    const [clusterChecked, setClusterChecked] = useState(false);
    const [hospChecked, setHospChecked] = useState([false, false, false, false, false, false]);

    const handleClusterChecked = (e)=>{
        const checked = e.target.checked;
        setClusterChecked(checked);
        setHospChecked([checked, checked, checked, checked, checked, checked]);
        if (checked){ 
            setHKECDestHosp([])
            setHKECDestHosp(allHKECHosp)
        }else{
            setHKECDestHosp([])
        }
    };

    const handleHospChecked = (index) => (e) => {
        const { value, checked } = e.target;
        const newHospCheckboxes = [...hospChecked];
        newHospCheckboxes[index] = checked;
        setHospChecked(newHospCheckboxes);
        setClusterChecked(newHospCheckboxes.every((checkbox) => checkbox));
        if (checked) {
            setHKECDestHosp([...HKECDestHosp, value]);
        } else {
            setHKECDestHosp(HKECDestHosp.filter((option) => option !== value));
        }
    };
 
    return (
        <div className='cluster-border'>
            <div className='cluster HKEC'>
                <label>
                    <input type='checkbox' value='HKEC' checked={clusterChecked} onChange={handleClusterChecked}/>
                    HKEC
                </label>
                <br/>
            </div>
            <div className='clusterHosp HKECHosp'>
                <label>
                    <input type="checkbox" value="CCH" checked = {hospChecked[0]} onChange={handleHospChecked(0)}/>{' '}
                    CCH
                </label>
                <br />
                <label>
                    <input type="checkbox" value="PYN" checked = {hospChecked[1]} onChange={handleHospChecked(1)}/>
                    PYN
                </label>
                <br />
                <label>
                    <input type="checkbox" value="RH" checked = {hospChecked[2]} onChange={handleHospChecked(2)}/>
                    RH
                </label>
                <br />
                <label>
                    <input type="checkbox" value="SJH" checked = {hospChecked[3]} onChange={handleHospChecked(3)}/>
                    SJH
                </label>
                <br />
                <label>
                    <input type="checkbox" value="TWE" checked = {hospChecked[4]} onChange={handleHospChecked(4)}/>
                    TWE
                </label>
                <br />
                <label>
                    <input type="checkbox" value="WCH" checked = {hospChecked[5]} onChange={handleHospChecked(5)}/>
                    WCH
                </label>
            </div>
        </div>
    )
}

export default HKECHosp
