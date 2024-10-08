import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './FormComponent.css'; // Import the CSS file for styling
import HKECHosp from './HKECHosp';
import KWCHosp from './KWCHosp';
import HKWCHosp from './HKWCHosp';
import NTECHosp from './NTECHosp';

const FormComponent = () => {

  const [HKECDestHosp, setHKECDestHosp] = useState([]);
  const [KWCDestHosp, setKWCDestHosp] = useState([]);
  const [HKWCDestHosp, setHKWCDestHosp] = useState([]);
  const [NTECDestHosp, setNTECDestHosp] = useState([]);
  let finalHospDest = []

  const [packageFile, setPackageFile] = useState(null)
  const [packUpdateStaff, setPackUpdateStaff] = useState('');
  const [workStations, setWorkStations] = useState('HAHO,HOW10');
  const [machineGroups, setMachineGroups] = useState('None');
  const [disableBtn, setDisableBtn] = useState(true)
  const [btnAfterPost, setBtnAfterPost] = useState(false)
  const [runBtn, setRunBtn] = useState('Run')
  const [formDisableBtn, setFormDisableBtn] = useState(true)

  const [sessionId, setSessionId] = useState('');
  const [clientSocket, setClientSocket] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [getSessId, setGetSessId] = useState(false);
  const [sessionSub, setSessionSub] = useState(false);
  const [handShake, setHandShake] = useState(false);
  const [firstTimeRunning, setFirstTimeRunning] = useState(true)

  const establishHandshake = ()=>{

    const socket = new SockJS('http://crc2-jasper:8080/ws');
    setClientSocket(socket);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      onConnect: (frame) => {
        client.subscribe('/user/queue/returnSessionId', (message) => {
          setSessionId(message.body);
          setMessages((prevMessages) => [...prevMessages, "Connected to backend server.\nPlease do not close the browser before the operation is completed."]);

          if(!sessionSub){
            client.subscribe(`/queue/afterFormSubmit/${message.body}`, (message2)=>{
              setMessages((prevMessages) => [...prevMessages, message2.body]);
            })
            setSessionSub(true)
          }
        });

      },
      onDisconnect: () => {removeEventListener
        console.log('Client disconnected');
      },
    });

    client.activate();
    setStompClient(client)
  }

  const handleFileUpload = (e)=>{
    let fileName = e.target.value.toLowerCase()
    if (!fileName.endsWith("zip") || fileName == null){
      alert("Please upload .zip files only.")
      e.target.value = ''
      setPackageFile(null)
      return false
    }else{
      setPackageFile(e.target.files[0])
    }

    if(!handShake){
      establishHandshake();
      setHandShake(true);
    }
  };

  const handlePackUpdateStaff = (e) => {
    setPackUpdateStaff(e.target.value);
    if (!getSessId){
      getSessionId();
      setGetSessId(true);
    }
  };

  const handleWorkStations = (e) => {
    setWorkStations(e.target.value);
  };

  const handleMachineGroups = (e) => {
    setMachineGroups(e.target.value);
  };

  const getSessionId = () => {
    if (stompClient && stompClient.connected){
      stompClient.publish({ destination: '/app/connect/getSessionId', body: "getSessionId" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if(firstTimeRunning){
      setFirstTimeRunning(false)
    }else{
      setMessages([])
    }

    setBtnAfterPost(true)
    setRunBtn('Running, please wait...')
    
    finalHospDest = [...HKECDestHosp, ...KWCDestHosp, ...HKWCDestHosp, ...NTECDestHosp]
    // Prepare the data to be sent to the backend
    const formData = new FormData();
    
    formData.append('packageFile', packageFile);
    formData.append('packUpdateStaff', packUpdateStaff)
    formData.append('workStations', workStations)
    formData.append('machineGroups', machineGroups)
    formData.append('finalHospDest', finalHospDest)
    formData.append('sessionId', sessionId)

    // Send the form data to the backend
    fetch('http://crc2-jasper:8080/api/submitForm', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Print the response data received from the backend
        let rcvMsg = JSON.parse(JSON.stringify(data))
        // alert(rcvMsg.response)
        setBtnAfterPost(false)
        setRunBtn('Run')
      })
      .catch((error) => {
        console.error('Error:', error);
        const errorMsg1 = "Timeout error.\n\nIt's possible the backend server has not been started yet."
        const errorMsg2 = "Or the backend is still running but not yet finished to return a response before the timeout. Please monitor the server status on the left for the actual progress."
        console.log(errorMsg1 + "\n\n" + errorMsg2)
        setBtnAfterPost(false)
        setRunBtn('Run')
      });
    
  };

  useEffect(()=>{
    if (packageFile && packUpdateStaff && workStations && machineGroups &&
      (HKECDestHosp.length !== 0 || KWCDestHosp.length !== 0 || HKWCDestHosp.length !== 0 || NTECDestHosp.length !== 0) &&
    !btnAfterPost && stompClient && stompClient.connected){
      setDisableBtn(false)
    }else{
      setDisableBtn(true)
    }
  }, [packageFile, packUpdateStaff, workStations, machineGroups, HKECDestHosp, KWCDestHosp, HKWCDestHosp, NTECDestHosp, btnAfterPost, stompClient])

  useEffect(()=>{
    if (packageFile){
      setFormDisableBtn(false)
    }else{
      setDisableBtn(true)
    }
  }, [packageFile])

  const AlwaysScrollToBottom = () => {
    const elementRef = useRef();
    useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
  };

  return (
    <div className='app'>
      <div className="form-container">
        <h1>Workstation Package Distribution</h1>
        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>Upload package (.zip files only):</label>
            <input type='file' accept='.zip' onChange={handleFileUpload}/>
          </div>
          <div className="form-group checkbox-group">
            <p>Copy Package To The Following Cluster(s)/ Hospital(s):</p>
            <br />
            <HKECHosp HKECDestHosp={HKECDestHosp} setHKECDestHosp={setHKECDestHosp}></HKECHosp>
            <KWCHosp KWCDestHosp={KWCDestHosp} setKWCDestHosp={setKWCDestHosp}></KWCHosp>
            <HKWCHosp HKWCDestHosp={HKWCDestHosp} setHKWCDestHosp={setHKWCDestHosp}></HKWCHosp>
            <NTECHosp NTECDestHosp={NTECDestHosp} setNTECDestHosp={setNTECDestHosp}></NTECHosp>
          </div>
          <div className='form-group'>
            <label htmlFor="packUpdateStaff">Package Updated By:</label>
            <input type="text" id="packUpdateStaff" value={packUpdateStaff} onChange={handlePackUpdateStaff} disabled={formDisableBtn}/>
          </div>
          <div className='form-group'>
            <label htmlFor="workstations">WorkStations (Default: HAHO, HOW10):</label>
            <input type="text" id="workstations" value={workStations} onChange={handleWorkStations} disabled={formDisableBtn}/>
          </div>
          <div className='form-group'>
            <label htmlFor="machineGroups">MachineGroups (e.g. CMS-IP-W11; Default: None):</label>
            <input type="text" id="machineGroups" value={machineGroups} onChange={handleMachineGroups} disabled={formDisableBtn}/>
          </div>      
          
          <br/>
          <button type="submit" disabled={disableBtn}>{runBtn}</button>
        </form>
      </div>
      
      <div className='server-status'>
        <h1>Server Status</h1>
        <div className="messages">
          <div>Awaiting messages ...</div>
          <br></br>
          <br></br>
          {messages.map((msg, index) => (
            <div key={index}>
              <div>{msg}</div>
              <br></br>
              <br></br>
            </div>
          ))}
          <AlwaysScrollToBottom/>
        </div>
      </div>
    </div>
    
  );
};

export default FormComponent
