import React, { useEffect, useState } from 'react';
import { allHospitals } from './parameters/allHospitals'

function KWCHosp({KWCDestHosp, setKWCDestHosp}) {

    const [clusterChecked, setClusterChecked] = useState(false);
    const [hospChecked, setHospChecked] = useState(Array(allHospitals.KWC.length).fill(false));

    const handleClusterChecked = (e)=>{
        const checked = e.target.checked;
        setClusterChecked(checked);
        setHospChecked(hospChecked.map(hospChecked => hospChecked = checked))
        if (checked){ 
            setKWCDestHosp([])
            setKWCDestHosp(allHospitals.KWC.map(hospObj => hospObj.hospCode))
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

        checked? setKWCDestHosp([...KWCDestHosp, value]) : 
                setKWCDestHosp(KWCDestHosp.filter((option) => option !== value));

    };

  return (
    <div className='cluster-border'>
        <div className='cluster KWC'>
            <label style={ clusterChecked ? 
                { 'color': 'black', 
                'fontSize': '1.3rem',
                'textDecoration' : 'underline'} : {}}>
                <input type='checkbox' value='KWC' checked={clusterChecked} onChange={handleClusterChecked}
                style={ clusterChecked ? 
                    { 'minWidth' : '1.2rem',
                      'minHeight' : '1.2rem'} : {}}/>
                KWC
            </label>
            <br/>
        </div>
        <div className='clusterHosp KWCHosp'>
        {
            allHospitals.KWC.map((hospObj) => (
                <div key={hospObj.index}>
                    <label style={ hospChecked[hospObj.index] ? 
                        { 'color': 'black', 
                        'fontSize': '1.3rem',
                        'textDecoration' : 'underline'} : {}}>
                        <input type='checkbox'
                        value={hospObj.hospCode} 
                        name={hospObj.hospCode} 
                        checked={hospChecked[hospObj.index]} 
                        onChange={handleHospChecked(hospObj.index)}
                        style={ hospChecked[hospObj.index] ? 
                            { 'minWidth' : '1.2rem',
                              'minHeight' : '1.2rem'} : {}}/>
                        {hospObj.hospCode}
                    </label>
                    <br/>
                </div>
            ))
        }
        </div>
    </div>
    
  )
}

export default KWCHosp