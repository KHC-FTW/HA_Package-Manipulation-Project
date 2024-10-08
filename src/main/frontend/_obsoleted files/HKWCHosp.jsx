import React, { useEffect, useState } from 'react';

function HKWCHosp({HKWCDestHosp, setHKWCDestHosp}) {

    const allHKWCHosp = ['DKC', 'FYK', 'GH', 'ML', 'QMH', 'TWH'];
    const [clusterChecked, setClusterChecked] = useState(false);
    const [hospChecked, setHospChecked] = useState([false, false, false, false, false, false]);

    const handleClusterChecked = (e)=>{
        const checked = e.target.checked;
        setClusterChecked(checked);
        setHospChecked([checked, checked, checked, checked, checked, checked]);
        if (checked){ 
            setHKWCDestHosp([])
            setHKWCDestHosp(allHKWCHosp)
        }else{
            setHKWCDestHosp([])
        }
    };

    const handleHospChecked = (index) => (e) => {
        const { value, checked } = e.target;
        const newHospCheckboxes = [...hospChecked];
        newHospCheckboxes[index] = checked;
        setHospChecked(newHospCheckboxes);
        setClusterChecked(newHospCheckboxes.every((checkbox) => checkbox));
        if (checked) {
            setHKWCDestHosp([...HKWCDestHosp, value]);
        } else {
            setHKWCDestHosp(HKWCDestHosp.filter((option) => option !== value));
        }
    };

    return (
        <div className='cluster-border'>
            <div className='cluster HKWC'>
                <label>
                    <input type='checkbox' value='HKWC' checked={clusterChecked} onChange={handleClusterChecked}/>
                    HKWC
                </label>
                <br/>
            </div>
            <div className='clusterHosp HKWCHosp'>
                <label>
                    <input type="checkbox" value="DKC" checked = {hospChecked[0]} onChange={handleHospChecked(0)}/>
                    DKC
                </label>
                <br />
                <label>
                    <input type="checkbox" value="FYK" checked = {hospChecked[1]} onChange={handleHospChecked(1)}/>
                    FYK
                </label>
                <br />
                <label>
                    <input type="checkbox" value="GH" checked = {hospChecked[2]} onChange={handleHospChecked(2)}/>
                    GH
                </label>
                <br />
                <label>
                    <input type="checkbox" value="ML" checked = {hospChecked[3]} onChange={handleHospChecked(3)}/>
                    ML
                </label>
                <br />
                <label>
                    <input type="checkbox" value="QMH" checked = {hospChecked[4]} onChange={handleHospChecked(4)}/>
                    QMH
                </label>
                <br />
                <label>
                    <input type="checkbox" value="TWH" checked = {hospChecked[5]} onChange={handleHospChecked(5)}/>
                    TWH
                </label>
                <br />
            </div>
        </div>
    )
}

export default HKWCHosp