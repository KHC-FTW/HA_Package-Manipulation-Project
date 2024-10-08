import React, { useEffect, useState } from 'react';

function KWCHosp({KWCDestHosp, setKWCDestHosp}) {
    
    const allKWCHosp = ['KCH', 'CMC', 'NLT', 'PMH', 'YCH'];
    const [clusterChecked, setClusterChecked] = useState(false);
    const [hospChecked, setHospChecked] = useState([false, false, false, false, false]);

    const handleClusterChecked = (e)=>{
        const checked = e.target.checked;
        setClusterChecked(checked);
        setHospChecked([checked, checked, checked, checked, checked]);
        if (checked){ 
            setKWCDestHosp([])
            setKWCDestHosp(allKWCHosp)
        }else{
            setKWCDestHosp([])
        }
    };

    const handleHospChecked = (index) => (e) => {
        const { value, checked } = e.target;
        const newHospCheckboxes = [...hospChecked];
        newHospCheckboxes[index] = checked;
        setHospChecked(newHospCheckboxes);
        setClusterChecked(newHospCheckboxes.every((checkbox) => checkbox));
        if (checked) {
            setKWCDestHosp([...KWCDestHosp, value]);
        } else {
            setKWCDestHosp(KWCDestHosp.filter((option) => option !== value));
        }
    };
    
    return (
        <div className='cluster-border'>
            <div className='cluster KWC'>
                <label>
                    <input type='checkbox' value='KWC' checked={clusterChecked} onChange={handleClusterChecked}/>
                    KWC
                </label>
                <br/>
            </div>
            <div className='clusterHosp KWCHosp'>
                <label>
                    <input type="checkbox" value="KCH" checked = {hospChecked[0]} onChange={handleHospChecked(0)}/>
                    KCH
                </label>
                <br />
                <label>
                    <input type="checkbox" value="CMC" checked = {hospChecked[1]} onChange={handleHospChecked(1)}/>
                    CMC
                </label>
                <br />
                <label>
                    <input type="checkbox" value="NLT" checked = {hospChecked[2]} onChange={handleHospChecked(2)}/>
                    NLT
                </label>
                <br />
                <label>
                    <input type="checkbox" value="PMH" checked = {hospChecked[3]} onChange={handleHospChecked(3)}/>
                    PMH
                </label>
                <br />
                <label>
                    <input type="checkbox" value="YCH" checked = {hospChecked[4]} onChange={handleHospChecked(4)}/>
                    YCH
                </label>
                <br />
            </div>
        </div>
    )
}

export default KWCHosp