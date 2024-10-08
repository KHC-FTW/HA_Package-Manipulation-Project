import React, { useEffect, useState } from 'react';
import { allHospitals } from './parameters/allHospitals'

function NTECHosp({NTECDestHosp, setNTECDestHosp}) {

    const [clusterChecked, setClusterChecked] = useState(false);
    const [hospChecked, setHospChecked] = useState(Array(allHospitals.NTEC.length).fill(false));

    const handleClusterChecked = (e)=>{
        const checked = e.target.checked;
        setClusterChecked(checked);
        setHospChecked(hospChecked.map(hospChecked => hospChecked = checked))
        if (checked){ 
            setNTECDestHosp([])
            setNTECDestHosp(allHospitals.NTEC.map(hospObj => hospObj.hospCode))
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

        checked? setNTECDestHosp([...NTECDestHosp, value]) : 
                setNTECDestHosp(NTECDestHosp.filter((option) => option !== value));

    };

  return (
    <div className='cluster-border'>
        <div className='cluster NTEC'>
            <label style={ clusterChecked ? 
                { 'color': 'black', 
                'fontSize': '1.3rem',
                'textDecoration' : 'underline'} : {}}>
                <input type='checkbox' value='NTEC' checked={clusterChecked} onChange={handleClusterChecked}
                style={ clusterChecked ? 
                    { 'minWidth' : '1.2rem',
                      'minHeight' : '1.2rem'} : {}}/>
                NTEC
            </label>
            <br/>
        </div>
        <div className='clusterHosp NTECHosp'>
        {
            allHospitals.NTEC.map((hospObj) => (
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

export default NTECHosp