import React, { useEffect, useState } from 'react';

function NTECHosp({NTECDestHosp, setNTECDestHosp}) {

    const allNTECHosp = ['AHN', 'BBH', 'CHS', 'NDH', 'PWH', 'SH', 'TPH'];
    const [clusterChecked, setClusterChecked] = useState(false);
    const [hospChecked, setHospChecked] = useState([false, false, false, false, false, false, false]);

    const handleClusterChecked = (e)=>{
        const checked = e.target.checked;
        setClusterChecked(checked);
        setHospChecked([checked, checked, checked, checked, checked, checked, checked]);
        if (checked){ 
            setNTECDestHosp([])
            setNTECDestHosp(allNTECHosp)
        }else{
            setNTECDestHosp([])
        }
    };

    const handleHospChecked = (index) => (e) => {
        const { value, checked } = e.target;
        const newHospCheckboxes = [...hospChecked];
        newHospCheckboxes[index] = checked;
        setHospChecked(newHospCheckboxes);
        setClusterChecked(newHospCheckboxes.every((checkbox) => checkbox));
        if (checked) {
            setNTECDestHosp([...NTECDestHosp, value]);
        } else {
            setNTECDestHosp(NTECDestHosp.filter((option) => option !== value));
        }
    };

    return (
        <div className='cluster-border'>
            <div className='cluster NTEC'>
                <label>
                    <input type='checkbox' value='NTEC' checked={clusterChecked} onChange={handleClusterChecked}/>
                    NTEC
                </label>
                <br/>
            </div>
            <div className='clusterHosp NTECHosp'>
                <label>
                    <input type="checkbox" value="AHN" checked = {hospChecked[0]} onChange={handleHospChecked(0)}/>
                    AHN
                </label>
                <br />
                <label>
                    <input type="checkbox" value="BBH" checked = {hospChecked[1]} onChange={handleHospChecked(1)}/>
                    BBH
                </label>
                <br />
                <label>
                    <input type="checkbox" value="CHS" checked = {hospChecked[2]} onChange={handleHospChecked(2)}/>
                    CHS
                </label>
                <br />
                <label>
                    <input type="checkbox" value="NDH" checked = {hospChecked[3]} onChange={handleHospChecked(3)}/>
                    NDH
                </label>
                <br />
                <label>
                    <input type="checkbox" value="PWH" checked = {hospChecked[4]} onChange={handleHospChecked(4)}/>
                    PWH
                </label>
                <br />
                <label>
                    <input type="checkbox" value="SH" checked = {hospChecked[5]} onChange={handleHospChecked(5)}/>
                    SH
                </label>
                <br />
                <label>
                    <input type="checkbox" value="TPH" checked = {hospChecked[6]} onChange={handleHospChecked(6)}/>
                    TPH
                </label>
            </div>
        </div>
    )
}

export default NTECHosp