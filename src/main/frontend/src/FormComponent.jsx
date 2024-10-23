import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import './FormComponent.css' // Import the CSS file for styling
import KWCHosp from './KWCHosp'
import HKWCHosp from './HKWCHosp'
import NTECHosp from './NTECHosp'
import HKECHosp from './HKECHosp'
import CreatableSelect from 'react-select/creatable'
import {machineGpByHosp} from './parameters/machineGpByHosp'
import { workstationByHosp } from './parameters/workstationByHosp'
import AddDeleteFlag from './component/AddDeleteFlag'
import axios from 'axios';

const FormComponent = () => {

  const [HKECDestHosp, setHKECDestHosp] = useState([])
  const [KWCDestHosp, setKWCDestHosp] = useState([])
  const [HKWCDestHosp, setHKWCDestHosp] = useState([])
  const [NTECDestHosp, setNTECDestHosp] = useState([])
  const [finalHospDest, setFinalHospDest] = useState([])
  
  const [packageFile, setPackageFile] = useState(null)
  const [packageName, setPackageName] = useState("No file chosen")
  const [inputPackageName, setInputPackageName] = useState('')
  const [alreadyCheckWSMG, setAlreadyCheckWSMG] = useState(false)
  const [packUpdateStaff, setPackUpdateStaff] = useState('HA Staff')
  const [packDesc, setPackDesc] = useState('')
  const [workStations, setWorkStations] = useState([
    {'hospCode': 'CCH','WS': []},
    {'hospCode': 'PYN','WS': []},
    {'hospCode': 'RH', 'WS': []},
    {'hospCode': 'SJH','WS': []},
    {'hospCode': 'TWE','WS': []},
    {'hospCode': 'WCH','WS': []},
    {'hospCode': 'KCH','WS': []},
    {'hospCode': 'CMC','WS': []},
    {'hospCode': 'NLT','WS': []},
    {'hospCode': 'PMH','WS': []},
    {'hospCode': 'YCH','WS': []},
    {'hospCode': 'DKC','WS': []},
    {'hospCode': 'FYK','WS': []},
    {'hospCode': 'GH', 'WS': []},
    {'hospCode': 'ML', 'WS': []},
    {'hospCode': 'QMH','WS': []},
    {'hospCode': 'TWH','WS': []},
    {'hospCode': 'AHN','WS': []},
    {'hospCode': 'BBH','WS': []},
    {'hospCode': 'SCH','WS': []},
    {'hospCode': 'NDH','WS': []},
    {'hospCode': 'PWH','WS': []},
    {'hospCode': 'SH', 'WS': []},
    {'hospCode': 'TPH','WS': []},
  ]);
  const [machineGroups, setMachineGroups] = useState([
    {'hospCode': 'CCH', 'machineGps' : []},
    {'hospCode': 'PYN', 'machineGps' : []},
    {'hospCode': 'RH', 'machineGps' : []},
    {'hospCode': 'SJH', 'machineGps' : []},
    {'hospCode': 'TWE', 'machineGps' : []},
    {'hospCode': 'WCH', 'machineGps' : []},
    {'hospCode': 'KCH', 'machineGps' : []},
    {'hospCode': 'CMC', 'machineGps' : []},
    {'hospCode': 'NLT', 'machineGps' : []},
    {'hospCode': 'PMH', 'machineGps' : []},
    {'hospCode': 'YCH', 'machineGps' : []},
    {'hospCode': 'DKC', 'machineGps' : []},
    {'hospCode': 'FYK', 'machineGps' : []},
    {'hospCode': 'GH', 'machineGps' : []},
    {'hospCode': 'ML', 'machineGps' : []},
    {'hospCode': 'QMH', 'machineGps' : []},
    {'hospCode': 'TWH', 'machineGps' : []},
    {'hospCode': 'AHN', 'machineGps' : []},
    {'hospCode': 'BBH', 'machineGps' : []},
    {'hospCode': 'SCH', 'machineGps' : []},
    {'hospCode': 'NDH', 'machineGps' : []},
    {'hospCode': 'PWH', 'machineGps' : []},
    {'hospCode': 'SH', 'machineGps' : []},
    {'hospCode': 'TPH', 'machineGps' : []},
  ]);
  const [disableRunBtn, setDisableRunBtn] = useState(true)
  const [disableTasklistBtn, setDisableTasklistBtn] = useState(true)
  const [btnAfterPost, setBtnAfterPost] = useState(false)
  const [runBtn, setRunBtn] = useState('Run')
  const [formDisableBtn, setFormDisableBtn] = useState(true)

  const [sessionId, setSessionId] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [handShake, setHandShake] = useState(false);
  const [packDescAction, setPackDescAction] = useState('nothing')

  const scrollToBottom = useRef(null)

  useEffect(()=>{
    if(scrollToBottom.current) scrollToBottom.current.scrollTop = scrollToBottom.current.scrollHeight 
  }, [messages])

  useEffect(()=>{
    setAlreadyCheckWSMG(false)
    setFinalHospDest([...HKECDestHosp, ...KWCDestHosp, ...HKWCDestHosp, ...NTECDestHosp])
  }, [HKECDestHosp, KWCDestHosp, HKWCDestHosp, NTECDestHosp])

  const establishHandshake = ()=>{
    const socket = new SockJS('http://crc2-jasper:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: (frame) => {
        const subID = client.subscribe('/user/queue/returnSessionId', (message) => {
          setSessionId(message.body);
          setMessages((prevMessages) => [...prevMessages, "Connected to backend server.\nPlease do not close the browser before the operation is completed."]);
          client.subscribe(`/queue/afterFormSubmit/${message.body}`, (message2)=>{
            setMessages((prevMessages) => [...prevMessages, message2.body]);
          })
          subID.unsubscribe();
        });
      },
      onDisconnect: () => {removeEventListener
        console.log('Client disconnected');
      },
    });

    client.activate();
    setStompClient(client)

    setTimeout(()=>{
      if(client && client.connected){
        client.publish({ destination: '/app/connect/getSessionId', body: "getSessionId" })
      }else{
        setMessages((prevMessages) => [...prevMessages, "CRITICAL: Failed to establish connection to backend server."]);
      }
    }, 1500)

    return () => {
      stompClient.deactivate()
    }
  }

  useEffect(()=>{
    if(!handShake){
      establishHandshake();
      setHandShake(true);
    }
  }, [])

  const handleFileUpload = (e)=>{
    setAlreadyCheckWSMG(false)
    let fileName = e.target.value.toLowerCase()
    workStations.forEach(item => item.WS = [])
    machineGroups.forEach(item => item.machineGps = [])
    if (!fileName.endsWith("zip") || fileName == null){
      alert("Please upload .zip files only\n\nOR\n\nManually enter a package name for checking.")
      e.target.value = ''
      setPackageFile(null)
      setPackageName("No file chosen")
      setPackDesc('')
      return false
    }else{
      setPackageFile(e.target.files[0])
      fileName = e.target.files[0].name
      setPackageName(fileName)
      setPackDesc(fileName.substr(0, fileName.lastIndexOf('.')))
      setInputPackageName('')
    }
  }

  const handleInputPackageName = (e) =>{
    if (packageFile){
      e.preventDefault()
      alert(`${packageFile.name} was found, which has higher precedence for checking.\n\nTo check manually input package name, you must first remove the uploaded zip file.\n\nHint: Click the file again, click cancel and confirm ok if prompted.`)
      return
    } 
    setAlreadyCheckWSMG(false)
    const value = e.target.value;
    setInputPackageName(value)
    setPackDesc(value)
    workStations.forEach(item => item.WS = [])
    machineGroups.forEach(item => item.machineGps = [])
  }

  const handlePackUpdateStaff = (e) => {
    setPackUpdateStaff(e.target.value);
  };

  const handlePackDesc = (e) => {
    setPackDesc(e.target.value);
  }

  const handlePackDescAction = (e) =>{
    setPackDescAction(e.target.value)
  }

  const handleWorkStations = (option, action) => {
    const hospName = action.name
    if (option.length !== 0){
      option.forEach(x => {
        x.label = x.label.toUpperCase()
        x.value = x.value.toUpperCase()
        if (!('hospCode' in x)){
          x['hospCode'] = hospName
        }
      })
    }
    if (option.length >= 2){
      setWorkStations(workStations.map(item => {
        if(item.hospCode === hospName){
          item.WS = option.filter(item => item.value !== 'NONE')
        }
        return item
      }))
    }else{
      setWorkStations(workStations.map(item => {
        if(item.hospCode === hospName){
          item.WS = option
        }
        return item
      }))
    }
  };

  const handleMachineGroups = (option, action) => {
    const hospName = action.name
    if (option.length !== 0){
      option.forEach(x => {
        x.label = x.label.toUpperCase()
        x.value = x.value.toUpperCase()
        if (!('hospCode' in x)){
          x['hospCode'] = hospName
        }
      })
    }
    if (option.length >= 2){
      setMachineGroups(machineGroups.map(item => {
        if(item.hospCode === hospName){
          item.machineGps = option.filter(item => item.value !== 'NONE')
        }
        return item
      }))
    }else{
      setMachineGroups(machineGroups.map(item => {
        if(item.hospCode === hospName){
          item.machineGps = option
        }
        return item
      }))
    }
    
  };

  useEffect(()=>{
    setWorkStations(workStations.map(item => {
      if(!(finalHospDest.includes(item.hospCode))){
        item.WS = []
      }
      return item
    }))
    setMachineGroups(machineGroups.map(item => {
      if(!(finalHospDest.includes(item.hospCode))){
        item.machineGps = []
      }
      return item
    }))
  }, [finalHospDest])


  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (confirm('Confirm to run?')){
      setBtnAfterPost(true)
      setRunBtn('Running, please wait...')
      // Prepare the data to be sent to the backend
      const formData = prepareFinalFormData()

    // Send the form data to the backend

      let targetAPI = packageFile ? 'http://crc2-jasper:8080/api/submitForm' : 'http://crc2-jasper:8080/api/submitForm-no-zip'

      fetch(targetAPI, {
        method: 'POST',
        body: formData,
      })
      .then((response) => response.json())
      .then((data) => {
        // console.log(data); // Print the response data received from the backend
        let rcvMsg = data
        // alert(rcvMsg.response)
        setBtnAfterPost(false)
        setRunBtn('Run')
        setAlreadyCheckWSMG(false)
      })
      .catch((error) => {
        console.error('Error:', error);
        const errorMsg1 = "Timeout error.\n\nIt's possible the backend server has not been started yet."
        const errorMsg2 = "Or the backend is still running but not yet finished to return a response before the timeout. Please monitor the server status on the left for the actual progress."
        console.log(errorMsg1 + "\n\n" + errorMsg2)
        setBtnAfterPost(false)
        setRunBtn('Run')
        setAlreadyCheckWSMG(false)
      });
    }
  };

  const prepareFinalFormData = () =>{
    let finalWS = workStations.reduce((finalWS, item) => {
      if(finalHospDest.includes(item.hospCode)){
        if(item.WS.length === 0){
          finalWS.push({[item.hospCode] : ['NONE']})
        }else{
          finalWS.push({[item.hospCode] : item.WS.map(x => x.value)})
        }
      }
      return finalWS
    }, [])
    let finalMachineGps = machineGroups.reduce((finalMachineGps, item) => {
      if(finalHospDest.includes(item.hospCode)){
        if(item.machineGps.length === 0){
          finalMachineGps.push({[item.hospCode] : ['NONE']})
        }else{
          finalMachineGps.push({[item.hospCode] : item.machineGps.map(x => x.value)})
        }
      }
      return finalMachineGps
    }, [])
    const formData = new FormData();
    if(packageFile){
      formData.append('packageFile', packageFile)
    }else{
      formData.append('packageName', inputPackageName)
    }
    formData.append('finalHospDest', finalHospDest)
    formData.append('packDesc', packDesc)
    formData.append('packDescAction', packDescAction)
    formData.append('packUpdateStaff', packUpdateStaff)
    formData.append('workStations', JSON.stringify(finalWS))
    formData.append('machineGroups', JSON.stringify(finalMachineGps))
    formData.append('sessionId', sessionId)

    return formData
  }


  useEffect(()=>{
    if((!packageFile && !inputPackageName) || finalHospDest.length === 0 || !packDesc || !packUpdateStaff || btnAfterPost || !alreadyCheckWSMG){
      setDisableRunBtn(true)
    }else{
      setDisableRunBtn(false)
    }
  }, [packageFile, finalHospDest, packDesc, packUpdateStaff, stompClient, btnAfterPost, alreadyCheckWSMG])

  useEffect(()=>{
    if (packageFile || inputPackageName){
      setFormDisableBtn(false)
    }else{
      setFormDisableBtn(true)
    }
  }, [packageFile, inputPackageName])

  const clearServerStatus = () =>{
    setMessages([])
  }

  const queryExistingWSMG = () =>{
    const queryFormData = new FormData()

    if (packageName !== 'No file chosen'){
      const fileName = packageFile.name
      queryFormData.append('packageName', fileName.substr(0, fileName.lastIndexOf('.')))
    }else if (inputPackageName !== ''){
      queryFormData.append('packageName', inputPackageName)
    }

    queryFormData.append('finalHospDest', finalHospDest)
    queryFormData.append('sessionId', sessionId)
    
    const apiQueryURL = "http://crc2-jasper:8080/api/get-WS-MG"
    axios.post(apiQueryURL, queryFormData)
    .then(resp => {
      finalHospDest.forEach(hospName =>{
        setWorkStations(workStations.map(item =>{
          if (item.hospCode === hospName){
            const target = `${hospName}_WS`
            item.WS = resp.data[target]
          }
          return item
        }))
        setMachineGroups(machineGroups.map(item =>{
          if (item.hospCode === hospName){
            const target = `${hospName}_MG`
            item.machineGps = resp.data[target]
          }
          return item
        }))
        setAlreadyCheckWSMG(true)
      })
    })
    .catch(err => console.log(err))
      
  }

  return (
    <div className='form-component'>

      <div className="form-container">
        <h1 style={{margin: '15px 0 0 0'}}>Workstation Package Distribution</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group checkbox-group">
            <p>Copy Package To The Following Cluster(s)/ Hospital(s):</p>
            <HKECHosp HKECDestHosp={HKECDestHosp} setHKECDestHosp={setHKECDestHosp}/>
            <KWCHosp KWCDestHosp={KWCDestHosp} setKWCDestHosp={setKWCDestHosp}></KWCHosp>
            <HKWCHosp HKWCDestHosp={HKWCDestHosp} setHKWCDestHosp={setHKWCDestHosp}></HKWCHosp>
            <NTECHosp NTECDestHosp={NTECDestHosp} setNTECDestHosp={setNTECDestHosp}></NTECHosp>
          </div>

          <div className='form-group' style={{display: 'flex', alignContent: 'center', padding: '3px', marginBottom: '17px', flexWrap: 'wrap'}}>
            <label className='form-group-file'>Upload package (.zip):
              <span style={packageName === "No file chosen" ? 
                {margin: '0 0 0 5px', color: 'red', textDecoration: 'underline'} : 
                {margin: '0 0 0 5px', color: 'green'}}>
                  {packageName}
              </span>
              <input type='file' accept='.zip' onChange={handleFileUpload} style={{display: 'none'}}/>
            </label>
            <div style={{marginLeft: '10px', display: 'flex', alignItems: 'center', fontWeight: 'bold'}}>OR</div>

            <input className='packageName-input' 
                    type='text' 
                    placeholder='Enter Package Name' 
                    value={inputPackageName} 
                    spellCheck={false}
                    onChange={handleInputPackageName}
                    style={inputPackageName !== '' ? {border: '1px solid black', backgroundColor: 'rgb(184, 207, 255, 0.4)',}:{}}/>


            <div className='check-pack-btn' 
                onClick={queryExistingWSMG}
                style={(packageName === 'No file chosen' && inputPackageName === '') || finalHospDest.length === 0 ? {background: 'gray', pointerEvents: 'none'}: {}}
                >
              Check
            </div>
            {
              alreadyCheckWSMG ? (<div className='tasklist-check-msg' style={{color: 'green'}}> tasklist.ini checked</div>) : (<div className='tasklist-check-msg' style={{color: 'red'}}>tasklist.ini NOT checked yet</div>)
            }
          </div>

          <div className='pack-staff-desc-option-wrapper'>
            <div className='pack-staff-desc'>
              <div className='form-group text-input'>
                <input 
                className='formInput' 
                type="text" 
                id="packDesc" 
                value={packDesc} 
                onChange={handlePackDesc} 
                disabled={formDisableBtn}
                required={true}
                spellCheck={false}
                />
                <label htmlFor="packDesc">Package Description</label>
              </div>

              <div className='form-group text-input'>
                <input 
                className='formInput' 
                type="text" 
                id="packUpdateStaff" 
                value={packUpdateStaff} 
                onChange={handlePackUpdateStaff} 
                disabled={formDisableBtn}
                required={false}
                spellCheck={false}
                />
                <label htmlFor="packUpdateStaff">Package Update Staff</label>
              </div>

            </div>

            <div className='pack-desc-option'>
              <p>If package description already exists:</p>
              <div>
                <label 
                htmlFor='nothing'
                style={
                  packDescAction === 'nothing' ? 
                  {
                    backgroundColor : 'rgb(0, 72, 255)', 
                    color: 'white',
                    fontSize: '2vh',
                    fontWeight: 'bold'
                  } : {}}
                >
                  <input 
                  type='radio' 
                  id='nothing' 
                  value={'nothing'} 
                  name='pack-desc-action' 
                  defaultChecked onChange={handlePackDescAction} 
                  style={{display: 'none'}}/>
                  Do nothing
                </label>
                <label 
                htmlFor='append'
                style={
                  packDescAction === 'append' ? 
                  {
                    backgroundColor : 'rgb(0, 72, 255)', 
                    color: 'white',
                    fontSize: '2vh',
                    fontWeight: 'bold'
                  } : {}}
                >
                  <input 
                  type='radio' 
                  id='append' 
                  value={'append'} 
                  name='pack-desc-action' 
                  onChange={handlePackDescAction} 
                  style={{display: 'none'}}/>
                  Append
                </label>
                <label 
                htmlFor='overwrite'
                style={
                  packDescAction === 'overwrite' ? 
                  {
                    backgroundColor : 'rgb(0, 72, 255)', 
                    color: 'white',
                    fontSize: '2vh',
                    fontWeight: 'bold'
                  } : {}}
                >
                  <input 
                  type='radio' 
                  id='overwrite' 
                  value={'overwrite'} 
                  name='pack-desc-action' 
                  onChange={handlePackDescAction} 
                  style={{display: 'none'}}/>
                  Overwrite
                </label>
              </div>
            </div>
          </div>
          
          <div className='ws-machines-wrapper'>
            <fieldset>
              <legend>WorkStations</legend>
              <br/>
              {
                finalHospDest.length === 0 && 
                (<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px'}}>
                  <div style={{fontSize: '200%'}}>No hospital chosen.</div>
                </div>)
              }
              {
                workstationByHosp.map(hospObj=>(
                  <div 
                  className='hosp-workstation' key={hospObj.hospCode}
                  style={finalHospDest.includes(hospObj.label)? {}: {display: 'none'}}>
                    <div style={{display: 'inline-block', width: '60px'}} key={hospObj.hospCode}>{hospObj.label}</div>
                    <CreatableSelect
                    name={`${hospObj.label}`}
                    value={workStations.at(hospObj.index).WS}
                    isClearable
                    options={hospObj.options} 
                    isMulti
                    placeholder="NONE"
                    onChange={(option, action) => handleWorkStations(option, action)}
                    closeMenuOnSelect={false}
                    styles={{
                      container: (baseStyles) =>({
                          ...baseStyles,
                          width : '100%',
                          margin : '0 0 5px 0',
                          paddingLeft: '2px',
                      }),
                    }}
                    />
                  </div>
                ))
              }
            </fieldset>
            <br/>
            <fieldset>
              <legend>MachineGroups</legend>
              {/* <div className='ws-mg-warning'>Note: No overwrite will be done if the package already exists in tasklist.ini. Consider updating manually.</div> */}
              <br/>
              {
                finalHospDest.length === 0 && 
                (<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px'}}>
                  <div style={{fontSize: '200%'}}>No hospital chosen.</div>
                </div>)
              }
              {
                machineGpByHosp.map(hospObj=>(
                  <div 
                  className='hosp-machine' key={hospObj.label}
                  style={finalHospDest.includes(hospObj.label)? {}: {display: 'none'}}>
                    <div style={{display: 'inline-block', width: '60px'}} key={hospObj.label}>{hospObj.label}</div>
                    <CreatableSelect
                    name={`${hospObj.label}`}
                    value={machineGroups.at(hospObj.index).machineGps}
                    isClearable
                    options={hospObj.options} 
                    isMulti
                    placeholder="NONE"
                    onChange={(option, action) => handleMachineGroups(option, action)}
                    closeMenuOnSelect={false}
                    styles={{
                      container: (baseStyles) =>({
                          ...baseStyles,
                          width : '100%',
                          margin : '0 0 5px 0',
                          paddingLeft: '2px',
                      }),
                    }}
                    />
                  </div>
                ))
              }
            </fieldset>
          </div>
          <br/>
          <button type="submit" disabled={disableRunBtn}>{runBtn}</button>
        </form>
      </div>

      <div className='right-side'>
        <AddDeleteFlag sessionId={sessionId}/>

        <div className='server-status'>
          <div className='server-header'>
            <div className='server-title'>Server Status</div>
            <div 
            className='clear-server' 
            onClick={clearServerStatus}
            style={messages.length === 0?
              {backgroundColor: 'grey', pointerEvents: 'none'}:
              {}
            }>Clear</div>
          </div>
          <div className="messages" ref={scrollToBottom}>
            {/* <div>Awaiting messages ...</div> */}
            {messages.map((msg, index) => 
              (
                <div key={index}>
                  <div style={msg.includes("CRITICAL") || msg.includes("WARNING")?
                    {marginBottom: '8px', color: '#68ff8b', fontSize: '1.1rem', fontWeight: 'bolder'}:{marginBottom: '8px'}}>{msg}</div>
                </div>
              )
            )}
            <div ref={scrollToBottom}></div>
          </div>
        </div>
      </div>
      
      
    </div>
    
  );
};

export default FormComponent
