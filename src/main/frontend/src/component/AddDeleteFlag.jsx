import React, { useEffect, useState } from 'react'
import { allHospitals } from '../parameters/allHospitals'
import './AddDeleteFlag.css'
import Select from 'react-select';
import axios from 'axios';
import { hostMachineConfig } from '../parameters/hostMachineConfig';

function AddDeleteFlag({sessionId}) {

    const [toggleFlagOrNoFlag, setToggleFlagOrNoFlag] = useState('flag')
    const wsPlaceholder = {
        'Hospital': '',
        'hasFlag_count' : 0,
        'noFlag_count' : 0,
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
    const [addingDeletingFlag, setAddingDeletingFlag] = useState(false)

    const [selectedHaveFlagWS, setSelectedHaveFlagWS] = useState([])
    const [selectedNoFlagWS, setSelectedNoFlagWS] = useState([])

    const searchFlagByHosp = (e) =>{
        e.preventDefault()
        setFlagInputForAddDel(flagInputForSearch)
        setDisableInput(true)
        setWorkStationResp(wsPlaceholder)
        setSelectedHaveFlagWS([])
        setSelectedNoFlagWS([])

        const apiURL = `${hostMachineConfig.hostURL}/api/${sessionId}/search-flag/${selectedHospFlagSearch}/${flagInputForSearch}`
        axios.get(apiURL)
        .then(resp =>{
            setWorkStationResp(resp.data)
            setSelectedHospAddDelFlag(selectedHospFlagSearch)
            setDisableInput(false)
        })
        .catch(err => {
            console.log(err)
            setDisableInput(false)
        })
    }

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
        if(confirm(`Confirm to DELETE\n\n"${flagInputForAddDel}"\n\nfor the selected workstation(s)?`)){
            setAddingDeletingFlag(true)
            const delFlagFormData = new FormData()
            delFlagFormData.append('flagName', flagInputForAddDel)
            delFlagFormData.append('hospCode', selectedHospAddDelFlag)
            delFlagFormData.append('workStations', selectedHaveFlagWS.map(item => item.value))
            delFlagFormData.append('sessionId', sessionId)
            
            const apiDelFlagURL = `${hostMachineConfig.hostURL}/api/delete-flag`

            axios.post(apiDelFlagURL, delFlagFormData)
            .then(resp => {
                clearSelectedHaveFlagWS()
                setAddingDeletingFlag(false)
            })
            .catch(err => {
                setAddingDeletingFlag(false)
                console.log(err)
            })
        }
    }

    const addNewFlagForWsHaveFlag = () =>{
        if(confirm(`Confirm to ADD\n\n"${newFlagToAdd_haveFlag}"\n\nfor the selected workstation(s)?`)){
            setAddingDeletingFlag(true)
            const addNewFlagFormData = new FormData()
            addNewFlagFormData.append('flagName', newFlagToAdd_haveFlag)
            addNewFlagFormData.append('hospCode', selectedHospAddDelFlag)
            addNewFlagFormData.append('workStations', selectedHaveFlagWS.map(item => item.value))
            addNewFlagFormData.append('sessionId', sessionId)

            const apiAddFlagURL = `${hostMachineConfig.hostURL}/api/add-flag`

            axios.post(apiAddFlagURL, addNewFlagFormData)
            .then(resp => {
                setNewFlagToAdd_haveFlag('')
                clearSelectedHaveFlagWS()
                setAddingDeletingFlag(false)
            })
            .catch(err => {
                setAddingDeletingFlag(false)
                console.log(err)
            })
        }
    }

    const addFlagForWsNoFlag = () =>{
        if(confirm(`Confirm to ADD\n\n"${flagInputForAddDel}"\n\nfor the selected workstation(s)?`)){
            setAddingDeletingFlag(true)
            const addNewFlagFormData = new FormData()
            addNewFlagFormData.append('flagName', flagInputForAddDel)
            addNewFlagFormData.append('hospCode', selectedHospAddDelFlag)
            addNewFlagFormData.append('workStations', selectedNoFlagWS.map(item => item.value))
            addNewFlagFormData.append('sessionId', sessionId)

            const apiAddFlagURL = `${hostMachineConfig.hostURL}/api/add-flag`

            axios.post(apiAddFlagURL, addNewFlagFormData)
            .then(resp => {
                clearSelectedNoFlagWS()
                setAddingDeletingFlag(false)
            })
            .catch(err => {
                setAddingDeletingFlag(false)
                console.log(err)
            })
        }
    }

    const addNewFlagForWsNoFlag = () =>{
        if(confirm(`Confirm to ADD\n\n"${newFlagToAdd_noFlag}"\n\nfor the selected workstation(s)?`)){
            setAddingDeletingFlag(true)
            const addNewFlagFormData = new FormData()
            addNewFlagFormData.append('flagName', newFlagToAdd_noFlag)
            addNewFlagFormData.append('hospCode', selectedHospAddDelFlag)
            addNewFlagFormData.append('workStations', selectedNoFlagWS.map(item => item.value))
            addNewFlagFormData.append('sessionId', sessionId)
            
            const apiAddFlagURL = `${hostMachineConfig.hostURL}/api/add-flag`

            axios.post(apiAddFlagURL, addNewFlagFormData)
            .then(resp => {
                setNewFlagToAdd_noFlag('')
                clearSelectedNoFlagWS()
                setAddingDeletingFlag(false)
            })
            .catch(err => {
                setAddingDeletingFlag(false)
                console.log(err)
            })
        }
    }

    const handleSelectedHospFlagSearch = (e) =>{
        const selectedHosp = e.target.value
        if (workStationResp.hasFlag.length > 0 || workStationResp.noFlag.length > 0){
            if(confirm(`If you change to ${selectedHosp} now,\n\nall the previously searched results for ${selectedHospFlagSearch} will be lost.\n\nConfirm to proceed?`)){
                setWorkStationResp(wsPlaceholder)
                setSelectedHospFlagSearch(selectedHosp)
                clearSelectedHaveFlagWS()
                clearSelectedNoFlagWS()
            }else{
                e.preventDefault()
            }
            return
        }
        setSelectedHospFlagSearch(selectedHosp)
    }

    return (
        <div className='addDeleteFlag-container'>
            <h2>Add/ Delete Flags:</h2>
            <div className='header-display-flag'>{flagInputForAddDel}</div>
            <div className='flag-hosp-container'>
                <form onSubmit={searchFlagByHosp} autoComplete='on'>
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
                                                    <input type='radio' 
                                                    name='hospital' 
                                                    value={hospObj.hospCode} 
                                                    id={hospObj.hospCode}
                                                    onClick={handleSelectedHospFlagSearch}/>
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
                        name='flagName'
                        autoComplete='on'
                        spellCheck={false}
                        required={true}/>
                    </div>
                    <button type="submit" 
                    disabled={disableInput 
                    || flagInputForSearch === '' 
                    || selectedHospFlagSearch === '' 
                    || addingDeletingFlag
                    || sessionId === ''}>
                    Search
                    </button>
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
                        } : {} } 
                        onClick={() => setToggleFlagOrNoFlag('flag')}>{(`Have Flag: ${workStationResp.hasFlag_count}`)}</div>

                        <div style={toggleFlagOrNoFlag === 'noFlag' ? 
                        {color : 'black',
                        fontSize : '1.5rem',
                        } : {} }  
                        onClick={() => setToggleFlagOrNoFlag('noFlag')}>{(`No flag: ${workStationResp.noFlag_count}`)}</div>
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
                                style={selectedHaveFlagWS.length === 0 || addingDeletingFlag? 
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
                                style={newFlagToAdd_haveFlag === '' || selectedHaveFlagWS.length === 0 || addingDeletingFlag? 
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
                                style={selectedNoFlagWS.length === 0 || addingDeletingFlag? 
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
                                style={newFlagToAdd_noFlag === '' || selectedNoFlagWS.length === 0 || addingDeletingFlag? 
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