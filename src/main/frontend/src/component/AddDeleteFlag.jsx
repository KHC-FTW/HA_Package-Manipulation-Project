import React, { useEffect, useState } from 'react'
import { allHospitals } from '../parameters/allHospitals'
import './AddDeleteFlag.css'
import Select from 'react-select';
import axios from 'axios';

function AddDeleteFlag({sessionId}) {

    const [toggleFlagOrNoFlag, setToggleFlagOrNoFlag] = useState('flag')
    const wsPlaceholder = {
        'Hospital': '',
        'hasFlag_count' : '',
        'noFlag_count' : '',
        'hasFlag' : [],
        'noFlag' : []
    }

    const [flagInputForSearch, setFlagInputForSearch] = useState('')
    const [flagInputForAddDel, setFlagInputForAddDel] = useState('')
    const [newFlagToAdd_haveFlag, setNewFlagToAdd_haveFlag] = useState('')
    const [newFlagToAdd_noFlag, setNewFlagToAdd_noFlag] = useState('')
    const [selectedHospFlagSearch, setSelectedHospFlagSearch] = useState('')
    const [selectedHospAddDelFlag, setSelectedHospAddDelFlag] = useState('')
    const [workStationResp, setWorkStationResp] = useState(wsPlaceholder)
    const [disableInput, setDisableInput] = useState(false)

    const [selectedHaveFlagWS, setSelectedHaveFlagWS] = useState([])
    const [selectedNoFlagWS, setSelectedNoFlagWS] = useState([])
    // const [haveFlagWSValues, setHaveFlagWSValue] = useState([])
    // const [noFlagWSValues, setNoFlagWSValue] = useState([])

    const searchFlagByHosp = (e) =>{
        e.preventDefault()

        setDisableInput(true)
        setWorkStationResp(wsPlaceholder)
        setSelectedHaveFlagWS([])
        setSelectedNoFlagWS([])

        const apiURL = `http://crc2-jasper:8080/api/${sessionId}/search-flag/${selectedHospFlagSearch}/${flagInputForSearch}`
        axios.get(apiURL)
        .then(resp =>{
            console.log(resp.data)
            setWorkStationResp(resp.data)
            setSelectedHospAddDelFlag(selectedHospFlagSearch)
            setFlagInputForAddDel(flagInputForSearch)
            setDisableInput(false)
        })
        .catch(err => {
            console.log(err)
        })
    }

    useEffect(()=>{
        console.log(newFlagToAdd_haveFlag)
        console.log(newFlagToAdd_noFlag)
    }, [newFlagToAdd_haveFlag, newFlagToAdd_noFlag])

    const handleHaveFlagWS = option =>{
        setSelectedHaveFlagWS(option.map(item => item))
    }

    const handleSelectAllHaveFlagWS = () =>{
        setSelectedHaveFlagWS(workStationResp.hasFlag);
    }

    const clearSelectedHaveFlagWS = () =>{
        setSelectedHaveFlagWS(wsPlaceholder.hasFlag)
    }

    const handleSelectAllNoFlagWS = () =>{
        setSelectedNoFlagWS(workStationResp.noFlag);
    }

    const clearSelectedNoFlagWS = () =>{
        setSelectedNoFlagWS(wsPlaceholder.noFlag)
    }

    const handleNoFlagWS = option =>{
        setSelectedNoFlagWS(option.map(item => item))
    }

    const deleteFlagForWsHaveFlag = () =>{
        const delFlagFormData = new FormData()
        delFlagFormData.append('flagName', flagInputForAddDel)
        delFlagFormData.append('hospCode', selectedHospAddDelFlag)
        delFlagFormData.append('workStations', selectedHaveFlagWS.map(item => item.value))
        delFlagFormData.append('sessionId', sessionId)
        
        const apiDelFlagURL = 'http://crc2-jasper:8080/api/delete-flag'

        axios.post(apiDelFlagURL, delFlagFormData)
        .then(resp => {
            console.log(resp.data)
            clearSelectedHaveFlagWS()
        })
        .catch(err => console.log(err))

    }

    const addNewFlagForWsHaveFlag = () =>{
        const addNewFlagFormData = new FormData()
        addNewFlagFormData.append('flagName', newFlagToAdd_haveFlag)
        addNewFlagFormData.append('hospCode', selectedHospAddDelFlag)
        addNewFlagFormData.append('workStations', selectedHaveFlagWS.map(item => item.value))
        addNewFlagFormData.append('sessionId', sessionId)

        const apiAddFlagURL = 'http://crc2-jasper:8080/api/add-flag'

        axios.post(apiAddFlagURL, addNewFlagFormData)
        .then(resp => {
            console.log(resp.data)
            setNewFlagToAdd_haveFlag('')
            clearSelectedHaveFlagWS()
        })
        .catch(err => console.log(err))

    }

    const addFlagForWsNoFlag = () =>{
        const addNewFlagFormData = new FormData()
        addNewFlagFormData.append('flagName', flagInputForAddDel)
        addNewFlagFormData.append('hospCode', selectedHospAddDelFlag)
        addNewFlagFormData.append('workStations', selectedNoFlagWS.map(item => item.value))
        addNewFlagFormData.append('sessionId', sessionId)

        const apiAddFlagURL = 'http://crc2-jasper:8080/api/add-flag'

        axios.post(apiAddFlagURL, addNewFlagFormData)
        .then(resp => {
            console.log(resp.data)
            clearSelectedNoFlagWS()
        })
        .catch(err => console.log(err))
    }

    const addNewFlagForWsNoFlag = () =>{
        const addNewFlagFormData = new FormData()
        addNewFlagFormData.append('flagName', newFlagToAdd_noFlag)
        addNewFlagFormData.append('hospCode', selectedHospAddDelFlag)
        addNewFlagFormData.append('workStations', selectedNoFlagWS.map(item => item.value))
        addNewFlagFormData.append('sessionId', sessionId)
        
        const apiAddFlagURL = 'http://crc2-jasper:8080/api/add-flag'

        axios.post(apiAddFlagURL, addNewFlagFormData)
        .then(resp => {
            console.log(resp.data)
            setNewFlagToAdd_noFlag('')
            clearSelectedNoFlagWS()
        })
        .catch(err => console.log(err))
    }

    return (
        <div className='addDeleteFlag-container'>
            <h2>Add/ Delete Flags</h2>
            <div className='flag-hosp-container'>
                <form onSubmit={searchFlagByHosp}>
                    {
                        Object.keys(allHospitals).map(cluster =>(
                            <div className={`flag-cluster ${cluster}`}
                            key={cluster} aria-disabled
                            style={disableInput ? {pointerEvents : 'none'}: {}}>
                                <h3>{cluster}</h3>
                                <div className='flag-hospital-options'>
                                    {
                                        allHospitals[cluster].map(hospObj => (
                                            <div key={hospObj.index} className='flag-hospital'>
                                                <label htmlFor={hospObj.hospCode}>
                                                    <input type='radio' name='hospital' 
                                                    value={hospObj.hospCode} 
                                                    id={hospObj.hospCode}
                                                    onChange={(e)=>{setSelectedHospFlagSearch(e.target.value)}}/>
                                                    {hospObj.hospCode}
                                                </label>
                                            </div>)
                                        )
                                    }
                                </div>
                            </div>
                        ))
                    }

                    <div className='flag-search-container'>
                        <label htmlFor='input-flag'>Flag name:</label>
                        <input type='text' id='input-flag' 
                        value={flagInputForSearch} 
                        onChange={(e)=>setFlagInputForSearch(e.target.value)}
                        disabled={disableInput}
                        minLength={1}
                        required={true}/>
                    </div>
                    <button type="submit" 
                    disabled={disableInput || flagInputForSearch === '' || selectedHospFlagSearch === ''}>
                    Search
                    </button>
                    {/* {
                        disableInput && (<div className='loading-hint'>Loading ... </div>)
                    } */}
                </form>
            </div>

            {disableInput ?
                (<div className='loading-hint'>
                    <div>Loading ...</div>
                    <div>Large hospitals (&gt;1000 workstations) e.g. QMH, PYN</div>
                    <div>may take longer e.g. &gt;1 min to search.</div>
                    <div>Do not close or refresh the browser while waiting.</div>
                </div>):
                (<div>
                    <div className='toggle-add-delete-container'>
                        <div style={toggleFlagOrNoFlag === 'flag' ? 
                        {color : 'black',
                        fontSize : '1.5rem',
                        textDecoration : 'underline',} : {} } 
                        onClick={() => setToggleFlagOrNoFlag('flag')}>Have Flag</div>

                        <div style={toggleFlagOrNoFlag === 'noFlag' ? 
                        {color : 'black',
                        fontSize : '1.5rem',
                        textDecoration : 'underline',} : {} }  
                        onClick={() => setToggleFlagOrNoFlag('noFlag')}>No flag</div>
                    </div>
                    <div className='have-flag-container' style={toggleFlagOrNoFlag === 'flag' ? {} : {display: 'none'}}>
                        <form>
                            <div className='flag-left'>
                                <div className='flag-header'>
                                    {
                                        workStationResp.hasFlag_count === '' ? (<span>0 </span>) : 
                                        (<span style={{'color' : 'red'}}>{`${workStationResp.hasFlag_count} `}</span>)
                                    }
                                    workstation(s) found
                                </div>
                                <div className='select-station'>Select workstation(s)</div>
                                <div 
                                className='select-all-WS' 
                                onClick={handleSelectAllHaveFlagWS} 
                                style={selectedHaveFlagWS.length === workStationResp.hasFlag_count || workStationResp.hasFlag.length === 0? 
                                    {backgroundColor: 'grey', pointerEvents: 'none'}: 
                                    {}
                                }>Select ALL</div>
                                <div 
                                className='clear-WS' 
                                onClick={clearSelectedHaveFlagWS}
                                style={selectedHaveFlagWS.length === 0 ? 
                                    {backgroundColor: 'grey', pointerEvents: 'none'}:
                                    {}
                                }>Clear</div>
                                <Select styles={{
                                    container: (baseStyles) =>({
                                        ...baseStyles, 
                                        'width' : '91%',
                                        'margin' : '10px 0',
                                        // 'overflow': 'auto',
                                    }),
                                    control: (baseStyles) =>({
                                        ...baseStyles,
                                        'maxHeight' : '300px',
                                        'overflow': 'auto',
                                    }),
                                }}
                                value={selectedHaveFlagWS}
                                options={workStationResp.hasFlag}
                                isMulti
                                isClearable
                                isDisabled={workStationResp.hasFlag.length === 0}
                                onChange={(option) => handleHaveFlagWS(option)}
                                closeMenuOnSelect={false}/>
                            </div>
                            <div className='flag-right'>
                                <div 
                                className='div-button' 
                                onClick={deleteFlagForWsHaveFlag}
                                style={selectedHaveFlagWS.length === 0 ? 
                                    {pointerEvents: 'none', backgroundColor: 'grey', color: 'lightgray'}: 
                                    {}
                                }
                                >
                                Delete
                                </div>
                                <div className='delete-flag'>the flag</div>
                                <div className='add-new-flag'>Add a <span style={{color: 'red'}}>NEW</span> flag:</div>
                                <input type='text' minLength={1} required={true} 
                                onChange={(e)=>setNewFlagToAdd_haveFlag(e.target.value)}
                                value={newFlagToAdd_haveFlag}/>
                                <div 
                                className='div-button' 
                                onClick={addNewFlagForWsHaveFlag} 
                                style={newFlagToAdd_haveFlag === '' || selectedHaveFlagWS.length === 0 ? 
                                    {pointerEvents: 'none', backgroundColor: 'grey', color: 'lightgray'}: 
                                    {}
                                }
                                >
                                Add
                                </div>
                            </div>
                        </form>   
                    </div>
                    <div className='no-flag-container' style={toggleFlagOrNoFlag === 'noFlag' ? {} : {display: 'none'}}>
                        <form>
                            
                            <div className='flag-left'>
                                <div className='flag-header'>
                                    {
                                        workStationResp.noFlag_count === '' ? (<span>0 </span>) : 
                                        <span style={{'color' : 'red'}}>{`${workStationResp.noFlag_count} `}</span>
                                    }
                                    workstation(s) found
                                </div>
                                <div className='select-station'>Select workstation(s)</div>
                                <div 
                                className='select-all-WS' 
                                onClick={handleSelectAllNoFlagWS}
                                style={selectedNoFlagWS.length === workStationResp.noFlag_count || workStationResp.noFlag.length === 0? 
                                    {backgroundColor: 'grey', pointerEvents: 'none'}: 
                                    {}
                                }>Select ALL</div>
                                <div 
                                className='clear-WS' 
                                onClick={clearSelectedNoFlagWS}
                                style={selectedNoFlagWS.length === 0 ? 
                                    {backgroundColor: 'grey', pointerEvents: 'none'}:
                                    {}
                                }>Clear</div>
                                <Select styles={{
                                    container: (baseStyles) =>({
                                        ...baseStyles, 
                                        'width' : '91%',
                                        'margin' : '10px 0',
                                    }),
                                    control: (baseStyles) =>({
                                        ...baseStyles,
                                        'maxHeight' : '300px',
                                        'overflow': 'auto',
                                    }),
                                }}
                                value={selectedNoFlagWS}
                                options={workStationResp.noFlag}
                                isMulti
                                isClearable
                                isDisabled={workStationResp.noFlag.length === 0}
                                onChange={(option) => handleNoFlagWS(option)}
                                closeMenuOnSelect={false}/>
                            </div>
                            <div className='flag-right'>
                                <div 
                                className='div-button' 
                                onClick={addFlagForWsNoFlag}
                                style={selectedNoFlagWS.length === 0? 
                                    {pointerEvents: 'none', backgroundColor: 'grey', color: 'lightgray'}: 
                                    {}
                                }
                                >
                                Add
                                </div>
                                <div className='add-flag'>the flag</div>
                                <div>Add a <span style={{color: 'red'}}>NEW</span> flag:</div>
                                <input type='text' minLength={1} required={true}
                                onChange={(e)=>setNewFlagToAdd_noFlag(e.target.value)}
                                value={newFlagToAdd_noFlag}/>
                                <div 
                                className='div-button' 
                                onClick={addNewFlagForWsNoFlag}
                                style={newFlagToAdd_noFlag === '' || selectedNoFlagWS.length === 0 ? 
                                    {pointerEvents: 'none', backgroundColor: 'grey', color: 'lightgray'}: 
                                    {}
                                }
                                >
                                Add
                                </div>
                                
                            </div>
                        </form>   
                    </div>
                </div>)
            }

            

        </div>
    )
}

export default AddDeleteFlag